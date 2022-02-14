import { createRouter, createWebHashHistory } from 'vue-router'
import PlayMode from '@/pages/PlayMode.vue'

const routes = [
  { path: '/', name: 'PlayMode', component: PlayMode },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/pages/About.vue'),
  }, // Lazy load route component
]

export default createRouter({
  routes,
  history: createWebHashHistory(),
})
