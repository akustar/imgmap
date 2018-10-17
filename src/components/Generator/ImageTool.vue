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
      <div style="margin-bottom: 6px;">
        <button type="button" class="button tiny" :class="{ 'transparent': snippet !== 'Coords' }" @click="snippet = 'Coords'">Coords</button>
        <button type="button" class="button tiny" :class="{ 'transparent': snippet !== 'Responsive' }" @click="snippet = 'Responsive'">Responsive</button>
      </div>
      <textarea class="form" v-model="code" spellcheck="false"></textarea>
      <div class="actions">
        <!-- a href="#" @click.stop="clipboardCopy" title="클립보드에 복사">클립보드 복사</a-->
        <a href="#!" @click.prevent="downloadHtmlFile">HTML 파일로 저장</a>
      </div>
    </div>
    <div class="links">
      <a href="#!" @click.prevent="installApp" v-if="deferredPrompt">홈 화면에 앱 추가</a>
      <a href="https://github.com/akustar/imgmap" class="github" target="_blank"><img src="../../assets/images/GitHub-Mark-64px.png" width="32" alt=""></a>
    </div>
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
        deferredPrompt: null,
        code: `<map name="map">\n\n</map>`,
        snippet: 'Coords'
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
        if (this.snippet === 'Coords') {
          this.setCoords()
        }
        else if (this.snippet === 'Responsive') {
          this.setResponsive()
        }
      },
      'snippet' () {
        if (this.snippet === 'Coords') {
          this.setCoords()
        }
        else if (this.snippet === 'Responsive') {
          this.setResponsive()
        }
      }
    },
    mounted () {
      window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault()

        if (event.platforms[0] === 'web') {
          this.deferredPrompt = event
        }

        return false
      })
    },
    // 미래의 나에게: 실제코드와 화면에서의 코드 모두 가독성이 너무 안좋으므로 코드미러 등 스타일 적용 꼭 할것!!
    methods: {
      setCoords () {
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

        this.code = 
`<map name="map">
  ${areas}
</map>`
      },
      setResponsive () {
        const styles = this.state.maps.map(map => {
          let left = Number(map.left.toFixed(0))
          let top = Number(map.top.toFixed(0))
          let width = Number(map.width.toFixed(0))
          let height = Number(map.height.toFixed(0))
          
          left = left / this.state.width * 100
          top = top / this.state.height * 100
          width = width / this.state.width * 100
          height = height / this.state.height * 100

          return `<a href="" class="${map.id}" title="" style="width: ${width}%;height: ${height}%;top: ${top}%;left: ${left}%;"></a>`
        }).join('\n  ')

        this.code = `${styles}`
      },
      installApp () {
        if (this.deferredPrompt !== null) {
          this.deferredPrompt.prompt()

          this.deferredPrompt.userChoice.then((choiceResult) => {
            if(choiceResult.outcome == 'dismissed') {
              console.log('사용자가 홈 화면에 추가 취소')
            }
            else {
              console.log('사용자가 홈 화면에 앱을 설치함')
            }
            this.deferredPrompt = null
          })
        }        
      },
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
      clipboardCopy () {},
      downloadHtmlFile () {
        let innerHTML = '';

        if (this.snippet === 'Coords') {
        innerHTML = 
`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>index</title>
</head>
<body>
<img src="${this.link}" usemap="#map" width="${this.width}" height="${this.height}">
${this.code}
</body>
</html>`;
        }
        else if (this.snippet === 'Responsive') {
        innerHTML = 
`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>index</title>
  <style>
    .map {
      position: relative;
      display: inline-block;
    }
    .map img {
      display: block;
      width: 100%;
      max-width: ${this.width}px;
    }
    [class*="mapper-"] {
      position: absolute;
      display: block;
    }
  </style>
</head>
<body>
<div class="map">
  <img src="${this.link}">
  ${this.code}
</div>
</body>
</html>`;
        }

        const blob = new Blob([innerHTML], {type: 'text/html;charset=utf-8'})
        const url = window.URL.createObjectURL(blob)
        const anchor = document.createElement('a')

        anchor.href = url
        anchor.download = 'index.html'
        anchor.click()
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

  .actions {
    position: absolute;
    bottom: 0;
    right: 0;
  }

  .links {
    display: flex;
    align-items: center;
    position: absolute;
    right: 20px;
    top: 20px;
  }

  .links > a {
    display: block;
    margin-left: 10px;
  }

  .links > a:first-child {
    position: relative;
    top: 2px;
  }

  .form-col.size .input-group {
    width: 30%;
    min-width: 200px;
  }

  .button.transparent {
    background-color: transparent;
    color: #36393f;
  }

  @media (max-width: 1440px) {
    .form-col.size .input-group {
      width: 50%
    }
  }
</style>