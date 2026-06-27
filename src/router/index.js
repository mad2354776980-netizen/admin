import { createRouter, createWebHistory } from 'vue-router'
import ButtonGalleryView from '../views/ButtonGalleryView.vue'
import DataTableView from '../views/DataTableView.vue'
import DashboardView from '../views/DashboardView.vue'
import LoginView from '../views/LoginView.vue'
import PlaceholderView from '../views/PlaceholderView.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      layout: 'auth'
    }
  },
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      navLabel: '运营概览'
    }
  },
  {
    path: '/components/buttons',
    name: 'button-gallery',
    component: ButtonGalleryView,
    meta: {
      navLabel: '按钮'
    }
  },
  {
    path: '/components/tables',
    name: 'data-table-gallery',
    component: DataTableView,
    meta: {
      navLabel: '数据表格'
    }
  },
  {
    path: '/:section/:page',
    name: 'placeholder',
    component: PlaceholderView,
    meta: {
      navLabel: ''
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  if (to.name !== 'placeholder') {
    return true
  }

  const routeLabelMap = {
    'workspace/live': '实时监控',
    'workspace/queue': '处理队列',
    'business/orders': '订单管理',
    'business/segments': '客户分层',
    'business/payments': '支付记录',
    'content/review': '内容审核',
    'content/posts': '文章管理',
    'content/tags': '标签配置',
    'components/tables': '数据表格',
    'components/forms': '表单控件',
    'components/feedback': '弹层反馈',
    'system/access': '成员权限',
    'system/settings': '系统设置',
    'system/audit': '操作日志'
  }

  to.meta.navLabel = routeLabelMap[`${to.params.section}/${to.params.page}`] || '页面'
  return true
})

export default router
