<template>
  <div class="map">
    <map-dropzone @updateLink="updateLink">
      <map-mapper
        :state="state"
        @updateSize="updateSize"
        @updateMaps="updateMaps"
        @deleteMaps="deleteMaps"
      >
      </map-mapper>
      <div class="drop-guide" v-if="!state.link">
        <img src="../../assets/images/picture.png" alt="" width="128">
        <p>파일을 이곳에 드래그 &amp; 드롭하여 업로드하세요</p>
      </div>
    </map-dropzone>
    <map-dragbox
      containerSelector=".map"
      constraintSelector=".mapper"
      @createMaps="createMaps"
    >
    </map-dragbox>
  </div>
</template>

<script>
  import DropZone from './ImageMap/DropZone.vue'
  import DragBox from './ImageMap/DragBox.vue'
  import Mapper from './ImageMap/Mapper.vue'

  export default {
    name: 'image-map',
    props: {
      state: {
        type: Object
      }
    },
    methods: {      
      createMaps (clientRect) {
        const maps = this.state.maps.slice(0)
        const id = 'mapper-' + maps.length
        maps.push({ id, ...clientRect })

        this.$set(this.state, 'maps', maps)
      },
      updateMaps (clientRect, index) {
        const maps = this.state.maps.slice(0)
        const map = maps[index]

        map.left = clientRect.left
        map.top = clientRect.top
        map.width = clientRect.width
        map.height = clientRect.height

        this.$set(this.state, 'maps', maps)
      },
      deleteMaps (index) {
        this.$delete(this.state.maps, index)
      },
      updateLink (file) {
        if (file) {
          const img = new Image()
          img.addEventListener('load', () => {
            this.setProps({
              state: {
                link: img.src,
                name: file.name,
                width: img.width,
                height: img.height,
                maps: []
              }
            })
          }, false)
          img.src = URL.createObjectURL(file)
        }
      },
      updateSize (width, height) {
        this.$set(this.state, 'width', width)
        this.$set(this.state, 'height', height)
      }
    },
    components: {
      'map-dropzone': DropZone,
      'map-dragbox': DragBox,
      'map-mapper': Mapper
    }
  }
</script>

<style scoped>
  .map {
    display: grid;
    justify-items: center;
    align-items: center;    
    position: relative;
    flex: 1;
    overflow: auto;
    background-color: #f4f4f4;
    padding: 24px 0;
  }
</style>