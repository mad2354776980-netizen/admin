<template>
  <section class="panel content-panel" aria-label="运营概览">
    <div class="content-head">
      <div class="content-copy">
        <strong>{{ title }}</strong>
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
      <UiButton @click="activeStatus = '全部'">清除筛选</UiButton>
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
        @click="selectedOrder = order"
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
      <UiButton>分配负责人</UiButton>
      <UiButton variant="primary">继续处理</UiButton>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import UiButton from '../components/UiButton.vue'

const route = useRoute()
const title = computed(() => route.meta.navLabel || '运营概览')

const activeStatus = ref('全部')
const searchQuery = ref('')

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

const selectedOrder = ref(orders[0])
const queueTotal = computed(() => queue.reduce((sum, item) => sum + item.count, 0))

const filteredOrders = computed(() => {
  const keyword = String(searchQuery.value).toLowerCase()

  return orders.filter((order) => {
    const matchesStatus = activeStatus.value === '全部' || order.status === activeStatus.value
    const matchesKeyword = String([order.id, order.customer, order.owner, order.status].join(' '))
      .toLowerCase()
      .includes(keyword)

    return matchesStatus && matchesKeyword
  })
})

function statusClass(status) {
  return {
    'is-pending': status === '待处理',
    'is-active': status === '进行中',
    'is-done': status === '已完成',
    'is-risk': status === '风险'
  }
}
</script>
