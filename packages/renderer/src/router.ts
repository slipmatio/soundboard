import { createRouter, createWebHashHistory } from 'vue-router'
import GridView from '@/views/GridView.vue'

const routes = [{ path: '/', name: 'GridView', component: GridView }]

export default createRouter({
  routes,
  history: createWebHashHistory(),
})
