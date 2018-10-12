<template>
  <div class="drag-box" :style="selectionBoxStyling"></div>
</template>

<script>
  export default {
    props: {
      containerSelector: {
        type: String,
        default: null
      },
      constraintSelector: {
        type: String,
        default: null
      }
    },
    mounted () {
      this.container = document.querySelector(this.containerSelector)
      this.constraint = document.querySelector(this.constraintSelector)

      this.constraint.addEventListener('mousedown', (event) => {
        this.onMouseDown(event)
      })
    },
    data () {
      return {
        container: null,
        constraint: null,
        startPoint: null,
        endPoint: null,
        dragging: false,
        scrollRepeater: 0
      }
    },
    computed: {
      selectionBox () {
        const rect = this.container.getBoundingClientRect()

        const left = Math.min(this.startPoint.x, this.endPoint.x) - rect.left
        const top = Math.min(this.startPoint.y, this.endPoint.y) - rect.top
        const width = Math.abs(this.startPoint.x - this.endPoint.x)
        const height = Math.abs(this.startPoint.y - this.endPoint.y)
        
        return {
          left,
          top,
          width,
          height
        }
      },
      selectionBoxStyling () {
        if (!this.startPoint || !this.endPoint) return {}

        const { left, top, width, height } = this.selectionBox

        return {
          left: `${left}px`,
          top: `${top}px`,
          width: `${width}px`,
          height: `${height}px`
        }
      }
    },
    methods: {
      bound (event) {
        const rect = this.constraint.getBoundingClientRect()
        return {
          x: Math.min(Math.max(rect.left, event.pageX), rect.width + rect.left),
          y: Math.min(Math.max(rect.top, event.pageY), rect.height + rect.top)
        }
      },
      scrollXFrame (event) {
        const frame = this.container.getBoundingClientRect()
        const distance = 10
        const speed = 10
        let diff = 0

        if (event.pageX >= frame.right - distance) {
          diff = speed
        }
        else if (event.pageX <= frame.left + distance) {
          diff = -speed
        }

        this.container.scrollLeft += diff

        if (event.pageX >= frame.right || event.pageX <= frame.left) {
          if (this.scrollRepeater) clearInterval(this.scrollRepeater)
          
          this.scrollRepeater = setInterval(() => this.onMouseMove(event), 16)
        }

        return this.container.scrollLeft
      },
      scrollYFrame (event) {
        const frame = this.container.getBoundingClientRect()
        const distance = 10
        const speed = 10
        let diff = 0

        if (event.pageY >= frame.bottom - distance) {
          diff = speed
        }
        else if (event.pageY <= frame.top + distance) {
          diff = -speed
        }

        this.container.scrollTop += diff

        if (event.pageY >= frame.bottom || event.pageY <= frame.top) {
          if (this.scrollRepeater) clearInterval(this.scrollRepeater)
          
          this.scrollRepeater = setInterval(() => this.onMouseMove(event), 16)
        }

        return this.container.scrollTop
      },
      onMouseDown (event) {
        if (event.button !== 0) return

        if (this.scrollRepeater) clearInterval(this.scrollRepeater)

        this.startPoint = this.bound(event)
        this.startPoint.x += this.scrollXFrame(event)
        this.startPoint.y += this.scrollYFrame(event)

        window.addEventListener('mousemove', this.onMouseMove)
        window.addEventListener('mouseup', this.onMouseUp)
      },
      onMouseMove (event) {
        if (this.scrollRepeater) clearInterval(this.scrollRepeater)

        this.endPoint = this.bound(event)
        this.endPoint.x += this.scrollXFrame(event)
        this.endPoint.y += this.scrollYFrame(event)
        this.dragging = true
      },
      onMouseUp (event) {
        if (this.scrollRepeater) clearInterval(this.scrollRepeater)

        const sRect = this.$el.getBoundingClientRect()
        const cRect = this.constraint.getBoundingClientRect()
        
        const left = sRect.left - cRect.left
        const top = sRect.top - cRect.top
        const width = sRect.width
        const height = sRect.height

        if (this.dragging) {
          // 최소값을 어떤식으로 정해야..? -> 잡아끄는 동작에 일정시간을 둬서 처리해볼 것.
          if (width > 0 && height > 0) {
            this.$emit('createMaps', { left, top, width, height })
          }
        }

        this.startPoint = null
        this.endPoint = null
        this.dragging = false

        window.removeEventListener('mousemove', this.onMouseMove)
        window.removeEventListener('mouseup', this.onMouseUp)
      }
    }    
  }
</script>

<style>
  .drag-box {
    position: absolute;
    background: rgba(0, 162, 255, .4);
    z-index: 99;
  }
</style>