<template>
  <div id="canvas" ref="canvas"></div>
</template>

<script>
import * as SCENE from '../../assets/js/scene.js';

export default {
  name: 'Canvas',

  async mounted() {
    // 1. add event listeners
    // 2. initialize scene and geometries
    // 3. animate
    window.addEventListener('resize', SCENE.resizeToWindowSize, false)
    document.addEventListener('keydown', SCENE.onDocumentKeyDown, false);
    document.addEventListener('keyup', SCENE.onDocumentKeyUp, false);
    SCENE.init();
    SCENE.animate();
  },

  beforeUnmount() {
    // remove event listeners
    window.removeEventListener('resize', SCENE.resizeToWindowSize, false)
    document.removeEventListener('keydown', SCENE.onDocumentKeyDown, false);
    document.removeEventListener('keyup', SCENE.onDocumentKeyUp, false);
  }
}
</script>

<style scoped>
#canvas {
  height: 100vh;
  width: 100vw;
}
</style>