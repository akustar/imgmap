<template>
  <div
    class="draggable"
    :class="{'is-resizable': isResizable, 'is-draggable': isDraggable} "
    :style="draggableBoxStyling"
    @mousedown.stop="onMouseDown"
  >
    <input type="button" class="draggable_input" @keydown="dragCopyPaste" />
    <slot></slot>
    <div class="resizable" @mousedown="isResizable = true"></div>
    <button
      type="button"
      class="button delete"
      @mousedown.stop
      @click="$emit('deleteMaps', index)"
    >×</button>
  </div>
</template>

<script>
export default {
  props: {
    state: {
      type: Object
    },
    map: {
      type: Object,
      default: null
    },
    index: {
      type: Number,
      default: -1
    },
    containerSelector: {
      type: String,
      default: ""
    },
    constraintSelector: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      container: null,
      constraint: null,
      isResizable: false,
      isDraggable: false,
      diffX: 0,
      diffY: 0,
      keyCodeState: {
        codeList: [],
        isCopy: false
      }
    };
  },
  computed: {
    draggableBoxStyling() {
      let { left, top, width, height } = this.map;

      const x1 = left;
      const x2 = top;
      const y1 = left + width;
      const y2 = top + height;

      return {
        left: left + "px",
        top: top + "px",
        width: width + "px",
        height: height + "px"
      };
    }
  },
  mounted() {
    this.container = document.querySelector(this.containerSelector);
    this.constraint = document.querySelector(this.constraintSelector);
  },
  methods: {
    isKeyCodeCopy(...params) {
      const { e, KEY_CODE, codeList } = params[0];
      return e.keyCode === KEY_CODE.C && codeList[0] === KEY_CODE.CTRL;
    },
    isKeyCodePaste(...params) {
      const { e, KEY_CODE, codeList } = params[0];
      return (
        e.keyCode === KEY_CODE.V &&
        (codeList[0] === KEY_CODE.CTRL || codeList[0] === KEY_CODE.C)
      );
    },
    mapsIdIncrementAdd() {
      const PASTE_INDENT_X = 50;
      const getLastIncrementId =
        Number(this.state.maps[this.state.maps.length - 1].id.match(/\d/g)) + 1;

      this.state.maps.push({
        id: `mapper-${getLastIncrementId}`,
        left: this.map.left + this.map.width + PASTE_INDENT_X,
        top: this.map.top,
        width: this.map.width,
        height: this.map.height
      });
    },
    dragCopyPaste(e) {
      const KEY_CODE = {
        CTRL: 91,
        C: 67,
        V: 86
      };
      const TEMP_CODE_LIST_LENGTH = 2;
      const codeList = this.keyCodeState.codeList;

      codeList.push(e.keyCode);
      if (codeList.length > TEMP_CODE_LIST_LENGTH) {
        codeList.shift();
      }
      if (this.isKeyCodeCopy({ e, KEY_CODE, codeList })) {
        this.keyCodeState.isCopy = true;
      }
      if (
        this.isKeyCodePaste({ e, KEY_CODE, codeList }) &&
        this.keyCodeState.isCopy
      ) {
        this.keyCodeState.isCopy = false;
        this.mapsIdIncrementAdd();
      }
    },
    onMouseDown() {
      if (this.scrollRepeater) clearInterval(this.scrollRepeater);

      if (!this.isResizable) this.isDraggable = true;

      this.width = this.map.width;
      this.height = this.map.height;
      this.diffX = event.pageX - this.map.left + this.scrollXFrame(event);
      this.diffY = event.pageY - this.map.top + this.scrollYFrame(event);

      window.addEventListener("mousemove", this.onMouseMove);
      window.addEventListener("mouseup", this.onMouseUp);
    },
    onMouseMove(event) {
      if (this.scrollRepeater) clearInterval(this.scrollRepeater);

      const constraintRect = this.constraint.getBoundingClientRect();
      const draggableRect = this.$el.getBoundingClientRect();

      if (this.isResizable) {
        let left = this.map.left;
        let top = this.map.top;
        let width = Math.min(
          event.pageX -
            draggableRect.left +
            this.scrollXFrame(event) -
            this.container.scrollLeft +
            3,
          constraintRect.width - left
        );
        let height = Math.min(
          event.pageY -
            draggableRect.top +
            this.scrollYFrame(event) -
            this.container.scrollTop +
            3,
          constraintRect.height - top
        );

        this.$emit("updateMaps", { left, top, width, height }, this.index);
      } else {
        let width = this.map.width;
        let height = this.map.height;
        let left = event.pageX - this.diffX + this.scrollXFrame(event);
        let top = event.pageY - this.diffY + this.scrollYFrame(event);

        if (left < 0) left = 0;
        if (top < 0) top = 0;

        if (left + this.width > constraintRect.width)
          left = constraintRect.width - this.width;
        if (top + this.height > constraintRect.height)
          top = constraintRect.height - this.height;

        this.$emit("updateMaps", { left, top, width, height }, this.index);
      }
    },
    onMouseUp() {
      if (this.scrollRepeater) clearInterval(this.scrollRepeater);

      this.isDraggable = false;
      this.isResizable = false;

      window.removeEventListener("mousemove", this.onMouseMove);
      window.removeEventListener("mouseup", this.onMouseUp);
    },
    scrollXFrame(event) {
      const frame = this.container.getBoundingClientRect();
      const distance = 10;
      const speed = 10;

      let diff = 0;

      if (event.pageX >= frame.right - distance) {
        diff = speed;
      } else if (event.pageX <= frame.left + distance) {
        diff = -speed;
      }

      this.container.scrollLeft += diff;

      if (event.pageX >= frame.right || event.pageX <= frame.left) {
        if (this.scrollRepeater) clearInterval(this.scrollRepeater);

        this.scrollRepeater = setInterval(() => this.onMouseMove(event), 16);
      }

      return this.container.scrollLeft;
    },
    scrollYFrame(event) {
      const frame = this.container.getBoundingClientRect();
      const distance = 10;
      const speed = 10;

      let diff = 0;

      if (event.pageY >= frame.bottom - distance) {
        diff = speed;
      } else if (event.pageY <= frame.top + distance) {
        diff = -speed;
      }

      this.container.scrollTop += diff;

      if (event.pageY >= frame.bottom || event.pageY <= frame.top) {
        if (this.scrollRepeater) clearInterval(this.scrollRepeater);

        this.scrollRepeater = setInterval(() => this.onMouseMove(event), 16);
      }

      return this.container.scrollTop;
    }
  }
};
</script>

<style>
.draggable {
  position: absolute;
  background: rgba(0, 162, 255, 0.4);
  z-index: 99;
  user-select: none;
}

.draggable:hover .resizable,
.draggable.is-draggable .resizable,
.draggable.is-resizable .resizable {
  opacity: 1;
}

.draggable:hover .delete,
.draggable.is-draggable .delete,
.draggable.is-resizable .delete {
  opacity: 1;
}

.resizable {
  position: absolute;
  right: -4px;
  bottom: -4px;
  width: 12px;
  height: 12px;
  opacity: 0;
  cursor: se-resize;
  background-color: #fff;
  border-radius: 50%;
  border: 1px solid rgb(0, 162, 255);
}

.button.delete {
  position: absolute;
  top: 0;
  right: 0;
  width: 22px;
  height: 20px;
  padding: 0;
  min-width: auto;
  border-radius: 0;
  font-size: 18px;
  transition: none;
  background-color: #f04747;
  outline: none;
  transform: translateX(100%);
}
.draggable_input {
  position: absolute;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}
</style>