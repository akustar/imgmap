<template>
  <div class="generator">
    <image-map :state.sync="state" />
    <image-tool :state.sync="state" />
  </div>
</template>

<script>
  import ImageMap from './Generator/ImageMap'
  import ImageTool from './Generator/ImageTool'

  export default {
    name: 'generator',
    data () {
      return {
        state: {
          width: 0,
          height: 0,
          link: '',
          maps: []
        }
      }
    },
    components: {
      ImageMap,
      ImageTool
    }
  }
</script>

<style>
  .generator {
    display: flex;
    height: 100vh;    
  }
</style>