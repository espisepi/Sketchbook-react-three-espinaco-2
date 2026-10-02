import * as THREE from 'three';
import * as CANNON from 'cannon';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';

var PI_2 = Math.PI / 2;

var Type = {
  BOX: 'Box',
  CYLINDER: 'Cylinder',
  SPHERE: 'Sphere',
  HULL: 'ConvexPolyhedron',
  MESH: 'Trimesh'
};

/**
 * Given a THREE.Object3D instance, creates a corresponding CANNON shape.
 * @param  {THREE.Object3D} object
 * @return {CANNON.Shape}
 */
export const threeToCannon = function (object, options) {
  options = options || {};

  var geometry;

  if (options.type === Type.BOX) {
    return createBoundingBoxShape(object);
  } else if (options.type === Type.CYLINDER) {
    return createBoundingCylinderShape(object, options);
  } else if (options.type === Type.SPHERE) {
    return createBoundingSphereShape(object, options);
  } else if (options.type === Type.HULL) {
    return createConvexPolyhedron(object);
  } else if (options.type === Type.MESH) {
    geometry = getGeometry(object);
    return geometry ? createTrimeshShape(geometry) : null;
  } else if (options.type) {
    throw new Error('[CANNON.threeToCannon] Invalid type "%s".', options.type);
  }

  geometry = getGeometry(object);
  if (!geometry) return null;

  var type = geometry.type;

  switch (type) {
    case 'BoxGeometry':
      return createBoxShape(geometry);
    case 'CylinderGeometry':
      return createCylinderShape(geometry);
    case 'PlaneGeometry':
      return createPlaneShape(geometry);
    case 'SphereGeometry':
      return createSphereShape(geometry);
    case 'BufferGeometry':
      return createBoundingBoxShape(object);
    default:
      console.warn('Unrecognized geometry: "%s". Using bounding box as shape.', geometry.type);
      return createBoxShape(geometry);
  }
};

threeToCannon.Type = Type;

/******************************************************************************
 * Shape construction
 */

 /**
  * @param  {THREE.BufferGeometry} geometry
  * @return {CANNON.Shape}
  */
 function createBoxShape (geometry) {
   var vertices = getVertices(geometry);

   if (!vertices.length) return null;

   geometry.computeBoundingBox();
   var box = geometry.boundingBox;
   return new CANNON.Box(new CANNON.Vec3(
     (box.max.x - box.min.x) / 2,
     (box.max.y - box.min.y) / 2,
     (box.max.z - box.min.z) / 2
   ));
 }

/**
 * Bounding box needs to be computed with the entire mesh, not just geometry.
 * @param  {THREE.Object3D} mesh
 * @return {CANNON.Shape}
 */
function createBoundingBoxShape (object) {
  var shape, localPosition,
      box = new THREE.Box3();

  var clone = object.clone();
  clone.quaternion.set(0, 0, 0, 1);
  clone.updateMatrixWorld();

  box.setFromObject(clone);

  if (!isFinite(box.min.lengthSq())) return null;

  shape = new CANNON.Box(new CANNON.Vec3(
    (box.max.x - box.min.x) / 2,
    (box.max.y - box.min.y) / 2,
    (box.max.z - box.min.z) / 2
  ));

  localPosition = box.translate(clone.position.negate()).getCenter(new THREE.Vector3());
  if (localPosition.lengthSq()) {
    shape.offset = localPosition;
  }

  return shape;
}

/**
 * Computes 3D convex hull as a CANNON.ConvexPolyhedron.
 * @param  {THREE.Object3D} mesh
 * @return {CANNON.Shape}
 */
function createConvexPolyhedron (object) {
  var geometry = getGeometry(object);
  if (!geometry) return null;

  var positions = geometry.getAttribute('position');
  if (!positions || positions.count < 4) return null;

  var points = [];
  for (var i = 0; i < positions.count; i++) {
    points.push(new THREE.Vector3(positions.getX(i), positions.getY(i), positions.getZ(i)));
  }

  var hull = new ConvexGeometry(points);
  var hullPositions = hull.getAttribute('position');
  var vertices = [];
  var faces = [];
  var vertexIndices = new Map();

  for (var i = 0; i < hullPositions.count; i += 3) {
    var face = [];
    for (var j = 0; j < 3; j++) {
      var point = new THREE.Vector3(
        hullPositions.getX(i + j),
        hullPositions.getY(i + j),
        hullPositions.getZ(i + j)
      );
      var key = point.x + ',' + point.y + ',' + point.z;
      var vertexIndex = vertexIndices.get(key);
      if (vertexIndex === undefined) {
        vertexIndex = vertices.length;
        vertexIndices.set(key, vertexIndex);
        vertices.push(new CANNON.Vec3(point.x, point.y, point.z));
      }
      face.push(vertexIndex);
    }
    faces.push(face);
  }

  hull.dispose();
  var shape = new CANNON.ConvexPolyhedron(vertices);
  shape.faces = faces;
  shape.computeNormals();
  return shape;
}

/**
 * @param  {THREE.BufferGeometry} geometry
 * @return {CANNON.Shape}
 */
function createCylinderShape (geometry) {
  var shape,
      params = geometry.parameters;
  shape = new CANNON.Cylinder(
    params.radiusTop,
    params.radiusBottom,
    params.height,
    params.radialSegments
  );

  // Include metadata for serialization.
  shape._type = CANNON.Shape.types.CYLINDER; // Patch schteppe/cannon.js#329.
  shape.radiusTop = params.radiusTop;
  shape.radiusBottom = params.radiusBottom;
  shape.height = params.height;
  shape.numSegments = params.radialSegments;

  shape.orientation = new CANNON.Quaternion();
  shape.orientation.setFromEuler(Math.PI / 2, 0, 0, 'XYZ').normalize();
  return shape;
}

/**
 * @param  {THREE.Object3D} object
 * @return {CANNON.Shape}
 */
function createBoundingCylinderShape (object, options) {
  var shape, height, radius,
      box = new THREE.Box3(),
      axes = ['x', 'y', 'z'],
      majorAxis = options.cylinderAxis || 'y',
      minorAxes = axes.splice(axes.indexOf(majorAxis), 1) && axes;

  box.setFromObject(object);

  if (!isFinite(box.min.lengthSq())) return null;

  // Compute cylinder dimensions.
  height = box.max[majorAxis] - box.min[majorAxis];
  radius = 0.5 * Math.max(
    box.max[minorAxes[0]] - box.min[minorAxes[0]],
    box.max[minorAxes[1]] - box.min[minorAxes[1]]
  );

  // Create shape.
  shape = new CANNON.Cylinder(radius, radius, height, 12);

  // Include metadata for serialization.
  shape._type = CANNON.Shape.types.CYLINDER; // Patch schteppe/cannon.js#329.
  shape.radiusTop = radius;
  shape.radiusBottom = radius;
  shape.height = height;
  shape.numSegments = 12;

  shape.orientation = new CANNON.Quaternion();
  shape.orientation.setFromEuler(
    majorAxis === 'y' ? PI_2 : 0,
    majorAxis === 'z' ? PI_2 : 0,
    0,
    'XYZ'
  ).normalize();
  return shape;
}

/**
 * @param  {THREE.BufferGeometry} geometry
 * @return {CANNON.Shape}
 */
function createPlaneShape (geometry) {
  geometry.computeBoundingBox();
  var box = geometry.boundingBox;
  return new CANNON.Box(new CANNON.Vec3(
    (box.max.x - box.min.x) / 2 || 0.1,
    (box.max.y - box.min.y) / 2 || 0.1,
    (box.max.z - box.min.z) / 2 || 0.1
  ));
}

/**
 * @param  {THREE.BufferGeometry} geometry
 * @return {CANNON.Shape}
 */
function createSphereShape (geometry) {
  var params = geometry.parameters;
  return new CANNON.Sphere(params.radius);
}

/**
 * @param  {THREE.Object3D} object
 * @return {CANNON.Shape}
 */
function createBoundingSphereShape (object, options) {
  if (options.sphereRadius) {
    return new CANNON.Sphere(options.sphereRadius);
  }
  var geometry = getGeometry(object);
  if (!geometry) return null;
  geometry.computeBoundingSphere();
  return new CANNON.Sphere(geometry.boundingSphere.radius);
}

/**
 * @param  {THREE.BufferGeometry} geometry
 * @return {CANNON.Shape}
 */
function createTrimeshShape (geometry) {
  var position = geometry.getAttribute('position');
  if (!position || position.count === 0) return null;

  var vertices = Array.from(position.array);
  var indices = geometry.index
    ? Array.from(geometry.index.array)
    : Array.from({ length: position.count }, function (_, index) { return index; });
  return new CANNON.Trimesh(vertices, indices);
}

/******************************************************************************
 * Utils
 */

/**
 * Returns a single geometry for the given object. If the object is compound,
 * its geometries are automatically merged.
 * @param {THREE.Object3D} object
 * @return {THREE.BufferGeometry}
 */
function getGeometry (object) {
  var meshes = getMeshes(object);

  if (meshes.length === 0) return null;

  object.updateWorldMatrix(true, true);
  var inverseRoot = new THREE.Matrix4().copy(object.matrixWorld).invert();
  var rootScale = new THREE.Matrix4().makeScale(object.scale.x, object.scale.y, object.scale.z);
  if (meshes.length === 1) {
    var geometry = meshes[0].geometry.clone();
    var relativeMatrix = new THREE.Matrix4()
      .multiplyMatrices(inverseRoot, meshes[0].matrixWorld);
    relativeMatrix.premultiply(rootScale);
    return geometry.applyMatrix4(relativeMatrix);
  }

  var vertices = [];
  var indices = [];
  meshes.forEach(function (mesh) {
    var geometry = mesh.geometry.clone();
    var relativeMatrix = new THREE.Matrix4()
      .multiplyMatrices(inverseRoot, mesh.matrixWorld);
    relativeMatrix.premultiply(rootScale);
    geometry.applyMatrix4(relativeMatrix);

    var positions = geometry.getAttribute('position');
    if (positions) {
      var baseIndex = vertices.length / 3;
      for (var i = 0; i < positions.count; i++) {
        vertices.push(positions.getX(i), positions.getY(i), positions.getZ(i));
      }

      if (geometry.index) {
        for (var i = 0; i < geometry.index.count; i++) {
          indices.push(baseIndex + geometry.index.getX(i));
        }
      } else {
        for (var i = 0; i < positions.count; i++) {
          indices.push(baseIndex + i);
        }
      }
    }
    geometry.dispose();
  });

  if (vertices.length === 0) return null;

  var combined = new THREE.BufferGeometry();
  combined.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  combined.setIndex(indices);
  combined.computeVertexNormals();
  combined.computeBoundingSphere();
  return combined;
}

/**
 * @param  {THREE.BufferGeometry} geometry
 * @return {Array<number>}
 */
function getVertices (geometry) {
  return (geometry.attributes.position || {}).array || [];
}

/**
 * Returns a flat array of THREE.Mesh instances from the given object. If
 * nested transformations are found, they are applied to child meshes
 * as mesh.userData.matrix, so that each mesh has its position/rotation/scale
 * independently of all of its parents except the top-level object.
 * @param  {THREE.Object3D} object
 * @return {Array<THREE.Mesh>}
 */
function getMeshes (object) {
  var meshes = [];
  object.traverse(function (o) {
    if (o.type === 'Mesh') {
      meshes.push(o);
    }
  });
  return meshes;
}
