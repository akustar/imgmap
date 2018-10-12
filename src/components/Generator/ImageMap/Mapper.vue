<template>
  <div class="mapper">
    <img v-if="state.link" :src="state.link" :width="state.width" :height="state.height" ref="img">

    <map-draggable
      v-for="(map, index) in state.maps" :key="map.id"
      :state="state"      
      :map="map"
      :index="index"
      containerSelector=".map"
      constraintSelector=".mapper"
      @updateMaps="updateMaps"
      @deleteMaps="deleteMaps"
    >
    </map-draggable>
  </div>
</template>

<script>
  import Draggable from './Draggable.vue'

  export default {
    props: {
      state: {
        type: Object
      }
    },
    watch: {
      'state.width' () {
        this.$nextTick(() => {
          this.$emit('updateSize', this.$refs.img.width, this.$refs.img.height)
        })
      },
      'state.height' () {
        this.$nextTick(() => {
          this.$emit('updateSize', this.$refs.img.width, this.$refs.img.height)
        })
      }
    },
    computed: {
      mapperBoxStyling () {
        if (!this.state.link) return {}
        
        return {
          width: `${this.state.width}px`,
          height: `${this.state.height}px`,
          background: `url(${this.state.link}) no-repeat 0 0`
        }
      }
    },
    methods: {
      updateMaps (clientRect, index) {
        this.$emit('updateMaps', clientRect, index)
      },
      deleteMaps (index) {
        this.$emit('deleteMaps', index)
      }
    },
    components: {
      'map-draggable': Draggable
    }
  }
</script>

<style>
  .mapper {
    position: relative;
    user-select: none;
    background-size: 100%;
  }
</style>