// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Lazy loading ile component'leri import et
const Dashboard = () => import('../pages/Dashboard.vue')
const SarfPage = () => import('../pages/SarfPage.vue')
const MembranPage = () => import('../pages/MembranPage.vue')
const CelikPage = () => import('../pages/CelikPage.vue')
const HalatPage = () => import('../pages/HalatPage.vue')
const FitilPage = () => import('../pages/FitilPage.vue')
const Projects = () => import('../pages/Projects.vue')

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: 'Ana Sayfa', icon: '🏠' }
  },
  {
    path: '/sarf',
    name: 'Sarf',
    component: SarfPage,
    meta: { title: 'Sarf Malzemeler', icon: '📦' }
  },
  {
    path: '/membran',
    name: 'Membran',
    component: MembranPage,
    meta: { title: 'Membran', icon: '📄' }
  },
  {
    path: '/celik',
    name: 'Celik',
    component: CelikPage,
    meta: { title: 'Çelik', icon: '🔩' }
  },
  {
    path: '/halat',
    name: 'Halat',
    component: HalatPage,
    meta: { title: 'Halat', icon: '⛓️' }
  },
  {
    path: '/fitil',
    name: 'Fitil',
    component: FitilPage,
    meta: { title: 'Fitil', icon: '🧵' }
  },
  {
    path: '/projects',
    name: 'Projects',
    component: Projects,
    meta: { title: 'Projeler', icon: '🏗️', requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for title updates
router.beforeEach((to, from, next) => {
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} - Stok Takip Sistemi`
  }
  next()
})

export default router