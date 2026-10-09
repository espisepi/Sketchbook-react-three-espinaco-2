# Edificios 3D de Sevilla con Cesium ion

Sketchbook puede cargar el asset **Cesium OSM Buildings** directamente en su escena Three.js mediante `3d-tiles-renderer`. La opción **World → Seville_3D_Buildings** activa o desactiva el tileset y centra la cámara en Sevilla. Al desactivarlo se restaura la vista anterior.

La escena posiciona los edificios en un sistema local ENU (este, arriba, sur) tomando como origen `37.3891, -5.9845`. El tileset de edificios no incluye una capa de imágenes satelitales ni el terreno global de Cesium.

## Token de Cesium ion

El asset de edificios usa el asset ID `96188` de Cesium ion y necesita un token de acceso válido. Al activar la opción, Sketchbook lo solicita si no existe `window.CESIUM_ION_ACCESS_TOKEN`. También se puede establecer esa propiedad **antes de crear `Sketchbook.World`**, por ejemplo en el código de inicialización local:

```js
window.CESIUM_ION_ACCESS_TOKEN = "TU_TOKEN_DE_CESIUM_ION";
```

No guardes un token real en el repositorio ni en el bundle publicado. Usa un token de cliente restringido a los permisos y orígenes necesarios. La aplicación mantiene el token en memoria; no lo escribe en almacenamiento local.

## Referencias

- [Ejemplo oficial de CesiumJS: Japan 3D Buildings](https://sandcastle.cesium.com/?id=japan-buildings)
- [API oficial de CesiumJS: `createOsmBuildingsAsync`](https://cesium.com/learn/cesiumjs/ref-doc/global.html#createOsmBuildingsAsync)
- [REST API oficial de Cesium ion](https://cesium.com/docs/rest-api/)
- [3D Tiles Renderer para Three.js: uso con Cesium ion](https://github.com/NASA-AMMOS/3DTilesRendererJS/blob/master/USAGE.md#loading-from-cesium-ion)
