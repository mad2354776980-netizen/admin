<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="brand">
        <button
          class="ghost-button icon-button mobile-nav-toggle"
          type="button"
          :aria-expanded="isMobileNavOpen"
          aria-controls="sidebar-navigation"
          aria-label="打开导航菜单"
          title="打开导航菜单"
          @click="toggleMobileNav"
        >
          <span aria-hidden="true">{{ isMobileNavOpen ? '×' : '☰' }}</span>
        </button>
      </div>
      <div class="topbar-actions">
        <button class="avatar-button" type="button" aria-label="个人资料" title="个人资料">
          <span class="avatar-image" aria-hidden="true">MX</span>
        </button>
      </div>
    </header>

    <main class="workspace">
      <Transition name="mobile-nav-scrim">
        <button
          v-if="isMobileViewport && isMobileNavOpen"
          class="mobile-nav-scrim"
          type="button"
          aria-label="关闭导航"
          @click="closeMobileNav"
        ></button>
      </Transition>
      <SidebarNav
        id="sidebar-navigation"
        :groups="navGroups"
        :active-label="activeNav"
        :mobile-mode="isMobileViewport"
        :mobile-open="isMobileNavOpen"
        :initial-open-menus="initialOpenMenus"
        @close-mobile="closeMobileNav"
        @select="selectNav"
      />

      <section class="main-grid">
        <section class="panel content-panel" aria-label="运营概览">
          <div class="content-head">
            <div class="content-copy">
              <strong>{{ activeNav }}</strong>
              <span>按实时任务队列、收入波动与风险状态汇总。</span>
            </div>
            <label class="search-bar" role="search" aria-label="搜索订单或客户">
              <span class="search-icon" aria-hidden="true">⌕</span>
              <input
                v-model.trim="searchQuery"
                class="search-input"
                type="search"
                placeholder="搜索订单、客户、负责人"
              >
            </label>
          </div>

          <div class="metrics-strip" aria-label="关键指标">
            <article v-for="metric in metrics" :key="metric.label" class="metric-item">
              <span>{{ metric.label }}</span>
              <strong>{{ metric.value }}</strong>
              <em :class="{ 'is-down': metric.trend.startsWith('-') }">{{ metric.trend }}</em>
            </article>
          </div>

          <div class="split-row">
            <section class="plain-section" aria-label="收入趋势">
              <div class="section-head">
                <strong>收入趋势</strong>
                <span>最近 7 天</span>
              </div>
              <div class="bar-chart">
                <div
                  v-for="point in revenueSeries"
                  :key="point.day"
                  class="bar-column"
                  :style="{ '--bar-height': `${point.value}%` }"
                >
                  <span class="bar-value">{{ point.amount }}</span>
                  <i aria-hidden="true"></i>
                  <small>{{ point.day }}</small>
                </div>
              </div>
            </section>

            <section class="plain-section" aria-label="待处理事项">
              <div class="section-head">
                <strong>处理队列</strong>
                <span>{{ queueTotal }} 项</span>
              </div>
              <div class="queue-list">
                <button
                  v-for="task in queue"
                  :key="task.title"
                  class="queue-item"
                  type="button"
                  @click="activeStatus = task.status"
                >
                  <span>
                    <strong>{{ task.title }}</strong>
                    <small>{{ task.owner }} / {{ task.due }}</small>
                  </span>
                  <em>{{ task.count }}</em>
                </button>
              </div>
            </section>
          </div>

          <div class="table-head">
            <div>
              <strong>订单列表</strong>
              <span>{{ filteredOrders.length }} 条记录</span>
            </div>
            <button class="ghost-button" type="button" @click="activeStatus = '全部'">清除筛选</button>
          </div>

          <div class="data-table" aria-label="订单列表">
            <div class="table-row table-header">
              <span>订单</span>
              <span>客户</span>
              <span>状态</span>
              <span>金额</span>
              <span>负责人</span>
            </div>
            <button
              v-for="order in filteredOrders"
              :key="order.id"
              class="table-row"
              :class="{ 'is-selected': selectedOrder.id === order.id }"
              type="button"
              @click="selectOrder(order)"
            >
              <span>
                <strong>{{ order.id }}</strong>
                <small>{{ order.time }}</small>
              </span>
              <span>{{ order.customer }}</span>
              <span>
                <em class="status-pill" :class="statusClass(order.status)">{{ order.status }}</em>
              </span>
              <span>{{ order.amount }}</span>
              <span>{{ order.owner }}</span>
            </button>
            <div v-if="filteredOrders.length === 0" class="empty-state">
              没有找到匹配记录，调整关键词或状态筛选。
            </div>
          </div>
        </section>

        <aside class="panel inspector-panel" aria-label="订单详情">
          <div class="inspector-head">
            <span class="panel-label">Inspector</span>
            <strong>{{ selectedOrder.id }}</strong>
            <span>{{ selectedOrder.customer }} / {{ selectedOrder.time }}</span>
          </div>

          <dl class="detail-list">
            <div>
              <dt>当前状态</dt>
              <dd><em class="status-pill" :class="statusClass(selectedOrder.status)">{{ selectedOrder.status }}</em></dd>
            </div>
            <div>
              <dt>订单金额</dt>
              <dd>{{ selectedOrder.amount }}</dd>
            </div>
            <div>
              <dt>负责人</dt>
              <dd>{{ selectedOrder.owner }}</dd>
            </div>
            <div>
              <dt>风险提示</dt>
              <dd>{{ selectedOrder.note }}</dd>
            </div>
          </dl>

          <div class="timeline">
            <div v-for="event in selectedOrder.events" :key="event" class="timeline-item">
              <span aria-hidden="true"></span>
              <p>{{ event }}</p>
            </div>
          </div>

          <div class="inspector-actions">
            <button class="ghost-button" type="button">分配负责人</button>
            <button class="primary-button" type="button">继续处理</button>
          </div>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import SidebarNav from './components/SidebarNav.vue'

/**
 * @typedef {'全部' | '待处理' | '进行中' | '已完成' | '风险'} OrderStatus
 * @typedef {{
 *   id: string
 *   customer: string
 *   status: Exclude<OrderStatus, '全部'>
 *   amount: string
 *   owner: string
 *   time: string
 *   note: string
 *   events: string[]
 * }} Order
 */

const navGroups = [
  {
    label: '工作台',
    children: [
      { label: '运营概览' },
      { label: '实时监控' },
      { label: '处理队列' }
    ]
  },
  {
    label: '业务管理',
    children: [
      { label: '订单管理' },
      { label: '客户分层' },
      { label: '支付记录' }
    ]
  },
  {
    label: '内容中心',
    children: [
      { label: '内容审核' },
      { label: '文章管理' },
      { label: '标签配置' }
    ]
  },
  {
    label: '通用组件',
    children: [
      { label: '按钮' },
      { label: '表单控件' },
      { label: '弹层反馈' }
    ]
  },
  {
    label: '系统',
    children: [
      { label: '成员权限' },
      { label: '系统设置' },
      { label: '操作日志' }
    ]
  }
]
const activeNav = ref('运营概览')
const initialOpenMenus = ['工作台', '业务管理']
/** @type {import('vue').Ref<OrderStatus>} */
const activeStatus = ref('全部')
const searchQuery = ref('')
const MOBILE_NAV_STORAGE_KEY = 'admin-demo.mobile-nav.open'
const isMobileNavOpen = ref(getInitialMobileNavOpen())
const isMobileViewport = ref(false)

const metrics = [
  { label: '今日收入', value: '¥128,460', trend: '+12.8%' },
  { label: '活跃客户', value: '8,214', trend: '+4.1%' },
  { label: '待处理', value: '37', trend: '-6.3%' },
  { label: '履约率', value: '98.2%', trend: '+1.6%' }
]

const revenueSeries = [
  { day: '周五', value: 52, amount: '8.4w' },
  { day: '周六', value: 68, amount: '10.1w' },
  { day: '周日', value: 46, amount: '7.2w' },
  { day: '周一', value: 78, amount: '12.0w' },
  { day: '周二', value: 64, amount: '9.7w' },
  { day: '周三', value: 86, amount: '13.6w' },
  { day: '周四', value: 72, amount: '11.2w' }
]

const queue = [
  { title: '退款复核', owner: '财务组', due: '今日', count: 12, status: '待处理' },
  { title: '高价值客户跟进', owner: '客户成功', due: '2 小时内', count: 8, status: '进行中' },
  { title: '异常支付确认', owner: '风控组', due: '立即', count: 5, status: '风险' }
]

/** @type {Order[]} */
const orders = [
  {
    id: 'ORD-24091',
    customer: '青岚工作室',
    status: '进行中',
    amount: '¥18,900',
    owner: '林予',
    time: '09:31',
    note: '合同审批已通过，等待客户确认发票抬头。',
    events: ['09:31 创建履约任务', '09:48 客户提交发票信息', '10:12 指派给林予跟进']
  },
  {
    id: 'ORD-24090',
    customer: '北桥科技',
    status: '风险',
    amount: '¥42,600',
    owner: '沈周',
    time: '09:12',
    note: '支付来源与历史账户不一致，需要二次确认。',
    events: ['09:12 触发风控规则', '09:16 暂停自动履约', '09:25 通知负责人复核']
  },
  {
    id: 'ORD-24089',
    customer: '山海零售',
    status: '已完成',
    amount: '¥7,280',
    owner: '陈默',
    time: '08:57',
    note: '订单已完成，客户评分 4.9。',
    events: ['08:57 订单支付成功', '09:05 完成资源分配', '09:20 客户确认收货']
  },
  {
    id: 'ORD-24088',
    customer: '亦同咨询',
    status: '待处理',
    amount: '¥12,450',
    owner: '叶澜',
    time: '08:36',
    note: '需要补充企业认证材料。',
    events: ['08:36 新订单进入队列', '08:38 系统发送材料清单', '09:00 等待客户上传']
  },
  {
    id: 'ORD-24087',
    customer: '南街影像',
    status: '进行中',
    amount: '¥5,980',
    owner: '林予',
    time: '08:04',
    note: '素材包已锁定，预计今日完成交付。',
    events: ['08:04 客户完成付款', '08:21 交付任务排期', '09:03 素材进入处理队列']
  }
]

/** @type {import('vue').Ref<Order>} */
const selectedOrder = ref(orders[0])

const queueTotal = computed(() => queue.reduce((sum, item) => sum + item.count, 0))

const filteredOrders = computed(() => {
  const keyword = String(searchQuery.value).toLowerCase()

  return orders.filter((order) => {
    const matchesStatus = activeStatus.value === '全部' || order.status === activeStatus.value
    const matchesKeyword = String([order.id, order.customer, order.owner, order.status]
      .join(' ')
    )
      .toLowerCase()
      .includes(keyword)

    return matchesStatus && matchesKeyword
  })
})

/**
 * @param {Order} order
 */
function selectOrder(order) {
  selectedOrder.value = order
}

/**
 * @param {Order['status']} status
 */
function statusClass(status) {
  return {
    'is-pending': status === '待处理',
    'is-active': status === '进行中',
    'is-done': status === '已完成',
    'is-risk': status === '风险'
  }
}

function toggleMobileNav() {
  isMobileNavOpen.value = !isMobileNavOpen.value
}

function closeMobileNav() {
  isMobileNavOpen.value = false
}

function selectNav(label) {
  activeNav.value = label
}

watch([isMobileNavOpen, isMobileViewport], ([isOpen, isMobile]) => {
  if (typeof document === 'undefined') {
    return
  }

  const overflowValue = isOpen && isMobile ? 'hidden' : ''
  document.documentElement.style.overflow = overflowValue
  document.body.style.overflow = overflowValue
})

watch(isMobileNavOpen, (isOpen) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(MOBILE_NAV_STORAGE_KEY, JSON.stringify(isOpen))
})

onMounted(() => {
  syncMobileViewport()
  window.addEventListener('resize', syncMobileViewport)
})

onBeforeUnmount(() => {
  if (typeof document === 'undefined') {
    return
  }

  window.removeEventListener('resize', syncMobileViewport)
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
})

function syncMobileViewport() {
  if (typeof window === 'undefined') {
    return
  }

  isMobileViewport.value = window.innerWidth <= 860
}

function getInitialMobileNavOpen() {
  if (typeof window === 'undefined') {
    return false
  }

  const storedValue = window.localStorage.getItem(MOBILE_NAV_STORAGE_KEY)
  if (!storedValue) {
    return false
  }

  try {
    return JSON.parse(storedValue) === true
  } catch {
    return false
  }
}
</script>
