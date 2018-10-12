import Vue from 'vue'
import Router from 'vue-router'
import Generator from '@/components/Generator'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Generator',
      component: Generator
    }
  ]
})
