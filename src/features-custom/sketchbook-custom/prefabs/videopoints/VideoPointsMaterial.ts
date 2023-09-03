import * as THREE from "three";

export default class VideoPointsMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        iTime: { type: "f", value: 0 },
        iResolution: { value: new THREE.Vector3(1, 1, 1) },

        bass: { type: "f", value: 0.0 },
        mid: { type: "f", value: 0.0 },
        treble: { type: "f", value: 0.0 },

        pointSize: { type: "f", value: 1.5 },

        amplitudeDistance: { type: "f", value: 1.0 },

        colorInput: { value: new THREE.Vector3(0, 0, 0) },

        iChannel0: { type: "t", value: undefined }, // THREE.Texture
      },
      vertexShader: `
      varying vec2 vUv;

      uniform float iTime;
      uniform sampler2D iChannel0;
  
      uniform float bass;
      uniform float mid;
      uniform float treble;

      uniform float pointSize;

      uniform float amplitudeDistance;
  
  
          void main() {
              vUv = uv;
  
              vec4 textureVideo = texture2D( iChannel0, vec2( vUv.x, vUv.y) );
              float gray = (textureVideo.r + textureVideo.g + textureVideo.b) / 3.0;
              float threshold = 300.0;
              vec3 pos = position;
  
              float r = bass + 0.5;
              float g = treble;
              float b = mid;
              float distance = 400.0;
              float distance2 = 300.0;
              float distance3 = 100.0;
  
              if(gray < 0.1){
                  pos.z = - gray * ( bass * 1.0) ;
              } else if (gray < 0.3) {
                  pos.z = - gray * ( bass * distance) ;
              } else if(gray < 0.4) {
                  pos.z = - gray * bass * distance2;
                  // pos.z = -1000.0;
              } else if(gray < 0.6) {
                  pos.z = - gray * bass * distance3;
              } else if(gray < 0.8) {
                  pos.z = - gray * bass * distance2;
              }
  
              // if(gray < 0.3){
              //     pos.z = - gray * r * bass * distance;
              // } else if(gray < 0.6) {
              //     pos.z = gray * r * bass * distance2;
              // } else {
              //     pos.z = gray * bass * distance3;
              // }
              
              pos.z += gray * bass * (amplitudeDistance * -1.0);
  
  
              gl_PointSize = pointSize ;
  
              gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
            }
        `,
      fragmentShader: `

      #include <common>

      varying vec2 vUv;
  
      uniform vec3 iResolution;
      uniform float iTime;
  
      uniform float bass;
      uniform float mid;
      uniform float treble;
      uniform sampler2D iChannel0;
  
      uniform vec3 colorInput;
  
      vec3 colorA = vec3(0.3,0.0,0.0);
      vec3 colorB = vec3(1.0,0.0,0.0);
  
      void mainImage(out vec4 fragColor, in vec2 fragCoord) {
          
          vec2 uv = fragCoord.xy / iResolution.xy;
          uv.x *= iResolution.x / iResolution.y;
  
          
          //vec3 color = mix(colorA,colorB,bass+0.3);
  
          //vec4 textureVideo = texture2D( iChannel0, vec2( vUv.x, vUv.y) );
          //float gray = (textureVideo.r + textureVideo.g + textureVideo.b) / 3.0;
          //vec3 color = textureVideo.rgb;                        
          //vec3 color_red = vec3(bass+gray,0.0,0.0);
          //color = ( textureVideo.rgb  ) * vec3(bass + 0.5 , bass + 0.5 , bass + 0.5 ) * 1.0;
          //float isColor = colorInput.r + colorInput.g + colorInput.b;
          //if ( isColor  != 0.0 ) {
          //    color = vec3( colorInput.r * (bass + gray), colorInput.g * (bass + gray), colorInput.b * (bass + gray)  );
          //    color = vec3(1.0,0.0,0.0);
          //}
          //color = vec3( textureVideo.r - 0.1, textureVideo.g - 0.1, textureVideo.b - 0.1 ) + vec3( bass * 0.2, bass * 0.2, bass * 0.2 );
  
          vec4 textureVideo = texture2D( iChannel0, vec2( vUv.x, vUv.y) );
          vec3 color = textureVideo.rgb;
          //color.r += bass - 0.6 ;
          //color.g += bass - 0.6;
          //color.b += bass - 0.6;
          fragColor = vec4(color, 1.0 );
  
  
      }
      void main() {
          mainImage(gl_FragColor, vUv * iResolution.xy);
      }
    `,
    });
  }

  get iTime() {
    return this.uniforms.iTime.value;
  }
  set iTime(v) {
    this.uniforms.iTime.value = v;
  }

  get iResolution() {
    return this.uniforms.iResolution.value;
  }
  set iResolution(v) {
    this.uniforms.iResolution.value = v;
  }

  get bass() {
    return this.uniforms.bass.value;
  }
  set bass(v) {
    this.uniforms.bass.value = v;
  }

  get mid() {
    return this.uniforms.mid.value;
  }
  set mid(v) {
    this.uniforms.mid.value = v;
  }

  get treble() {
    return this.uniforms.treble.value;
  }
  set treble(v) {
    this.uniforms.treble.value = v;
  }

  get pointSize() {
    return this.uniforms.pointSize.value;
  }
  set pointSize(v) {
    this.uniforms.pointSize.value = v;
  }
  get colorInput() {
    return this.uniforms.colorInput.value;
  }
  set colorInput(v) {
    this.uniforms.colorInput.value = v;
  }

  get iChannel0() {
    return this.uniforms.iChannel0.value;
  }
  set iChannel0(v) {
    this.uniforms.iChannel0.value = v;
  }
}
