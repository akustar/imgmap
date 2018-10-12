<template>
  <div class="drop-zone" :class="{ dragover: dragover }" @drop="onDrop">
    <slot></slot>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        dragover: false
      }
    },
    mounted () {
      this.initEvents()
    },
    methods: {
      initEvents () {
        this.addEventListeners(this.$el, 'drag dragstart dragend dragover dragenter dragleave drop', (event) => {
          event.stopPropagation()
          event.preventDefault()
        })
        this.addEventListeners(this.$el, 'dragover dragenter', (event) => this.dragover = true)
        this.addEventListeners(this.$el, 'dragleave dragend drop', (event) => this.dragover = false)
      },
      onDrop (event) {
        const droppedFile = event.dataTransfer.files[0]
        this.$emit('updateLink', droppedFile)
      },
      addEventListeners (element, eventNames, listener) {
        eventNames.split(' ').forEach((event) => element.addEventListener(event, listener))
      }
    },
  }
</script>

<style>
  .drop-zone {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    height: 100%;
    text-align: center;
    font-size: 18px;
  }

  .drop-zone > p {
    margin: 24px 0;
  }
</style>