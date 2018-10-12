<template>
  <div class="tool">
    <h2 class="title">Image Map Generator</h2>
    <div class="form-row">
      <h3 class="form-title">이미지 업로드</h3>
      <label for="selectLocalFile" class="button upload">{{ state.name || 'UPLOAD' }}</label>
      <input @change="attachImgFile" type="file" id="selectLocalFile" style="display: none" accept="image/*">
    </div>
    <div class="form-row" style="margin-top: -5px">
      <h3 class="form-title">또는 이미지 링크 연결</h3>
      <input type="text" v-model="link" @keydown.enter="insertImgLink" @paste="insertImgLink" placeholder="https://www..." class="form">
    </div>
    <div class="form-row">
      <h3 class="form-title">크기</h3>
      <div class="form-col size">
        <div class="input-group">
          <label for="">가로(px)</label>
          <input type="text" class="form" v-model="width" @keydown.enter="updateSize('width')">
        </div>
        <div class="input-group">
          <label for="">세로(px)</label>
          <input type="text" class="form" v-model="height" @keydown.enter="updateSize('height')">
        </div>
      </div>
    </div>
    <div class="form-row">
      <h3 class="form-title">Usemap Code</h3>
      <textarea class="form" v-model="usemapCode" spellcheck="false"></textarea>
      <!-- <div class="actions">
        <a href="#" @click.stop="clipboardCopy" title="클립보드에 복사"><img src="../../assets/images/copy.png" width="18" alt=""> 클립보드 복사</a>
        <a href="#" @click.stop="saveHtmlFile" title="html 파일로 저장"><img src="../../assets/images/download-arrow.png" width="18" alt=""> HTML 파일로 저장</a>
      </div> -->
    </div>
    <a href="https://github.com/akustar/imgmap" class="github" target="_blank"><img src="../../assets/images/GitHub-Mark-64px.png" width="32" alt=""></a>
  </div>
</template>

<script>
  export default {
    name: 'image-tool',
    props: {
      state: {
        type: Object
      }
    },
    data () {
      return {
        width: 0,
        height: 0,
        link: '',
        usemapCode: '<map name="imagemap">\n\n</map>',
      }
    },
    watch: {
      'state.width' () {
        this.width = this.state.width
      },
      'state.height' () {
        this.height = this.state.height
      },
      'state.maps' () {
        const areas = this.state.maps.map(map => {
          const left = Number(map.left.toFixed(0))
          const top = Number(map.top.toFixed(0))
          const width = Number(map.width.toFixed(0))
          const height = Number(map.height.toFixed(0))

          const x1 = left
          const x2 = top
          const y1 = left + width
          const y2 = top + height

          return `<area shape="rect" coords="${x1}, ${x2}, ${y1}, ${y2}" href="" title="" target="_blank" />`
        }).join('\n  ')

        this.usemapCode = 
`<map name="imagemap">
  ${areas}
</map>`
      }
    },
    methods: {
      updateSize (model) {
        if (this.state.width === this.width && this.state.height === this.height 
        || !this.state.link) return

        if (model === 'width') this.height = ''
        else if (model === 'height') this.width = ''

        this.setProps({
          state: {
            link: this.state.link,
            name: this.state.name,
            width: this.width,
            height: this.height,
            maps: []
          }
        })
      },
      insertImgLink () {
        this.$nextTick(() => {
          if (this.link) URL.revokeObjectURL(this.link)

          const img = new Image()
          img.addEventListener('load', () => {
            this.setProps({
              state: {
                link: this.link,
                name: '',
                width: img.width,
                height: img.height,
                maps: []
              }
            })
          }, false)
          img.src = this.link
        })
      },
      attachImgFile (event) {
        const file = event.target.files[0]
        if (file) {
          if (this.link) URL.revokeObjectURL(this.link)

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
      clipboardCopy () {
        
      },
      saveHtmlFile () {
        
      }
    }
  }
</script>

<style scoped>
  .tool {
    position: relative;
    width: 34%;
    padding: 24px;
    overflow: auto;
  }
  .github {
    position: absolute;
    right: 20px;
    top: 20px;
  }
  .actions {
    position: absolute;
    right: 0px;
    top: 0px;
    z-index: 10;
  }

  .actions > a {
    margin: 0 4px;
  }

  .form-col.size .input-group {
    width: 30%;
    min-width: 200px;
  }
  @media (max-width: 1440px) {
    .form-col.size .input-group {
      width: 50%
    }
  }
</style>