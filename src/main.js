// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import 'normalize.css'

const isObject = obj => Object.prototype.toString.call(obj) === '[object Object]'

Vue.mixin({
  methods: {
    setProps (props) {
      if (isObject(props)) {
        Object.keys(props).forEach(key => this.$emit(`update:${key}`, props[key]))
      }
    }
  }
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
