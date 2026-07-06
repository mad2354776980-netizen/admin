<template>
  <div class="table-demo-page">
    <section class="panel content-panel" aria-label="数据表格查询区域">
      <div class="content-head">
        <div class="content-copy">
          <strong>数据表格</strong>
          <span>展示后台列表页中常用的搜索、筛选、状态列与分页结构。</span>
        </div>
      </div>

      <div class="table-filter-bar" aria-label="数据筛选">
        <div class="table-search-field">
          <span class="table-select-label">搜索订单或客户</span>
          <div class="search-bar" role="search" aria-label="搜索订单或客户">
            <input
              v-model.trim="keyword"
              class="search-input"
              type="search"
              placeholder="搜索订单号、客户、负责人"
            >
          </div>
        </div>
        <label class="table-select-field">
          <span class="table-select-label">状态筛选</span>
          <UiSelect
            v-model="activeStatus"
            :options="statuses"
            label="状态筛选"
            placeholder="请选择状态"
          />
        </label>
        <label class="table-select-field">
          <span class="table-select-label">渠道来源</span>
          <UiSelect
            v-model="activeChannel"
            :options="channels"
            label="渠道来源"
            placeholder="请选择渠道"
          />
        </label>
        <div class="table-search-field table-search-field-compact">
          <span class="table-select-label">负责人</span>
          <div class="search-bar" role="search" aria-label="负责人">
            <input
              v-model.trim="ownerKeyword"
              class="search-input"
              type="search"
              placeholder="输入负责人"
            >
          </div>
        </div>
        <label class="table-select-field table-time-field">
          <span class="table-select-label">开始时间</span>
          <VueDatePicker
            v-model="startDate"
            class="table-time-picker"
            auto-apply
            clearable
            :formats="datePickerFormats"
            :locale="datePickerLocale"
            :time-config="datePickerTimeConfig"
            placeholder="选择开始时间"
            teleport
          />
        </label>
        <label class="table-select-field table-time-field">
          <span class="table-select-label">结束时间</span>
          <VueDatePicker
            v-model="endDate"
            class="table-time-picker"
            auto-apply
            clearable
            :formats="datePickerFormats"
            :locale="datePickerLocale"
            :time-config="datePickerTimeConfig"
            placeholder="选择结束时间"
            teleport
          />
        </label>
        <label class="table-select-field table-chip-field">
          <span class="table-select-label">客户分层</span>
          <UiMultiSelect
            v-model="activeSegments"
            :options="segments"
            label="客户分层"
            placeholder="请选择分层"
          />
        </label>
        <div class="table-filter-actions">
          <UiButton @click="resetFilters">重置</UiButton>
          <UiButton variant="primary" @click="applyFilters">查询</UiButton>
        </div>
      </div>
    </section>

    <section class="panel content-panel" aria-label="数据表格内容区域">
      <div class="table-head">
        <span class="table-summary-text">共 {{ filteredRows.length }} 条记录，已选 {{ selectedVisibleCount }} 条</span>
        <UiButton class="table-create-button" variant="primary" @click="createOrder">新增订单</UiButton>
      </div>

      <div class="table-demo-scroll">
        <div class="table-demo-shell">
          <div class="table-demo-grid table-header">
            <span class="table-checkbox-cell">
              <UiCheckbox
                :model-value="allVisibleRowsSelected"
                :indeterminate="hasPartialVisibleSelection"
                @update:model-value="toggleAllVisibleRows"
              />
            </span>
            <span>订单</span>
            <span>客户</span>
            <span>状态</span>
            <span>金额</span>
            <span>负责人</span>
            <span>更新时间</span>
            <span class="table-action-cell table-action-column">操作</span>
          </div>

          <div
            v-for="row in filteredRows"
            :key="row.id"
            class="table-demo-grid"
            :class="{ 'is-selected': isRowSelected(row.id) }"
          >
            <span class="table-checkbox-cell table-cell table-cell-checkbox">
              <UiCheckbox
                :model-value="isRowSelected(row.id)"
                @update:model-value="toggleRowSelection(row.id)"
              />
            </span>
            <span class="table-cell table-cell-order" data-label="订单">
              <strong>{{ row.id }}</strong>
              <small>{{ row.channel }}</small>
            </span>
            <span class="table-cell table-cell-status" data-label="状态">
              <em class="status-pill" :class="statusClass(row.status)">{{ row.status }}</em>
            </span>
            <span class="table-cell table-cell-customer" data-label="客户">
              <strong>{{ row.customer }}</strong>
              <small>{{ row.segment }}</small>
            </span>
            <span class="table-cell table-cell-amount" data-label="金额">
              <strong>{{ row.amount }}</strong>
            </span>
            <span class="table-cell table-cell-owner" data-label="负责人">{{ row.owner }}</span>
            <span class="table-cell table-cell-updated" data-label="更新时间">{{ row.updatedAt }}</span>
            <span class="table-action-cell table-action-column table-cell table-cell-action" data-label="操作">
              <UiButton
                class="table-action-button"
                @mousedown.prevent
                @click.stop="openEditor(row)"
              >
                编辑
              </UiButton>
              <UiButton
                class="table-action-button table-action-button-danger"
                @mousedown.prevent
                @click.stop="deleteRow(row.id)"
              >
                删除
              </UiButton>
            </span>
          </div>

          <div v-if="filteredRows.length === 0" class="empty-state">
            没有匹配的数据，调整搜索词或状态筛选后重试。
          </div>
        </div>
      </div>

      <div class="table-demo-footer">
        <div class="button-toolbar">
          <UiButton disabled>上一页</UiButton>
          <UiButton variant="primary">1</UiButton>
          <UiButton>2</UiButton>
          <UiButton>3</UiButton>
          <UiButton>下一页</UiButton>
        </div>
      </div>
    </section>

    <Teleport to="body">
      <Transition name="table-editor-scrim">
        <button
          v-if="isEditorOpen"
          class="table-editor-scrim"
          type="button"
          aria-label="关闭编辑弹窗"
          @click="closeEditor"
        ></button>
      </Transition>

      <Transition name="table-editor-modal">
        <div
          v-if="isEditorOpen"
          class="table-editor-modal"
          role="dialog"
          aria-modal="true"
          aria-label="订单编辑弹窗"
        >
          <div class="table-editor-head">
            <div class="table-editor-copy">
              <strong>编辑订单</strong>
              <span>{{ editForm.id || '未选择订单' }}</span>
            </div>
            <UiButton class="table-editor-close" icon aria-label="关闭编辑弹窗" @click="closeEditor">
              ×
            </UiButton>
          </div>

          <div class="table-editor-summary">
            <div>
              <span>金额</span>
              <strong>{{ editForm.amount || '--' }}</strong>
            </div>
            <div>
              <span>更新时间</span>
              <strong>{{ editForm.updatedAt || '--' }}</strong>
            </div>
          </div>

          <div class="table-editor-form">
            <label class="table-select-field">
              <span class="table-select-label">客户名称</span>
              <span class="search-bar" role="group" aria-label="客户名称">
                <input
                  v-model.trim="editForm.customer"
                  class="search-input"
                  type="text"
                  placeholder="输入客户名称"
                >
              </span>
            </label>

            <label class="table-select-field">
              <span class="table-select-label">订单状态</span>
              <UiSelect
                v-model="editForm.status"
                :options="editableStatuses"
                label="订单状态"
                placeholder="请选择状态"
              />
            </label>

            <label class="table-select-field">
              <span class="table-select-label">渠道来源</span>
              <UiSelect
                v-model="editForm.channel"
                :options="editableChannels"
                label="渠道来源"
                placeholder="请选择渠道"
              />
            </label>

            <label class="table-select-field">
              <span class="table-select-label">客户分层</span>
              <UiSelect
                v-model="editForm.segment"
                :options="segments"
                label="客户分层"
                placeholder="请选择分层"
              />
            </label>

            <label class="table-select-field">
              <span class="table-select-label">负责人</span>
              <span class="search-bar" role="group" aria-label="负责人">
                <input
                  v-model.trim="editForm.owner"
                  class="search-input"
                  type="text"
                  placeholder="输入负责人"
                >
              </span>
            </label>
          </div>

          <div class="table-editor-actions">
            <UiButton @click="closeEditor">取消</UiButton>
            <UiButton variant="primary" @click="saveEditor">保存</UiButton>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { zhCN as datePickerLocale } from 'date-fns/locale'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import UiButton from '../components/UiButton.vue'
import UiCheckbox from '../components/UiCheckbox.vue'
import UiMultiSelect from '../components/UiMultiSelect.vue'
import UiSelect from '../components/UiSelect.vue'

const datePickerFormats = {
  input: 'yyyy/MM/dd HH:mm:ss'
}

const datePickerTimeConfig = {
  enableTimePicker: true,
  enableSeconds: true,
  is24: true
}

const statuses = ['全部', '待处理', '进行中', '已完成', '风险']
const channels = ['全部', 'App / 企业版', 'App / 新签', 'Web / 新客', 'Web / 老客加购', 'API / 自动续费', 'API / 自动扣费']
const segments = ['高价值客户', '重点培育', '成熟客户', '续费客户', '风险观察']
const editableStatuses = statuses.filter((status) => status !== '全部')
const editableChannels = channels.filter((channel) => channel !== '全部')
const activeStatus = ref('全部')
const activeChannel = ref('全部')
const activeSegments = ref([])
const keyword = ref('')
const ownerKeyword = ref('')
const startDate = ref(null)
const endDate = ref(null)
const selectedRowIds = ref([])
const isEditorOpen = ref(false)
const editingRowId = ref('')
const editForm = ref(createEmptyEditor())
const blockedScrollKeys = [' ', 'PageUp', 'PageDown', 'Home', 'End']
let touchStartY = 0

const rows = ref([
  {
    id: 'ORD-24106',
    channel: 'App / 企业版',
    customer: '北川设计',
    segment: '高价值客户',
    status: '进行中',
    amount: '¥26,400',
    owner: '林予',
    updatedAt: '10:42'
  },
  {
    id: 'ORD-24105',
    channel: 'Web / 新客',
    customer: '青岚工作室',
    segment: '重点培育',
    status: '待处理',
    amount: '¥8,960',
    owner: '陈默',
    updatedAt: '10:18'
  },
  {
    id: 'ORD-24104',
    channel: 'API / 自动续费',
    customer: '南街影像',
    segment: '续费客户',
    status: '已完成',
    amount: '¥14,200',
    owner: '叶澜',
    updatedAt: '09:56'
  },
  {
    id: 'ORD-24103',
    channel: 'App / 风控复核',
    customer: '远山供应链',
    segment: '风险观察',
    status: '风险',
    amount: '¥39,700',
    owner: '沈周',
    updatedAt: '09:31'
  },
  {
    id: 'ORD-24102',
    channel: 'Web / 老客加购',
    customer: '山海零售',
    segment: '成熟客户',
    status: '进行中',
    amount: '¥17,850',
    owner: '林予',
    updatedAt: '09:12'
  },
  {
    id: 'ORD-24101',
    channel: 'Web / 续费',
    customer: '星阔传媒',
    segment: '成熟客户',
    status: '已完成',
    amount: '¥21,600',
    owner: '陈默',
    updatedAt: '08:58'
  },
  {
    id: 'ORD-24100',
    channel: 'App / 新签',
    customer: '越川物流',
    segment: '重点培育',
    status: '待处理',
    amount: '¥12,740',
    owner: '叶澜',
    updatedAt: '08:41'
  },
  {
    id: 'ORD-24099',
    channel: 'API / 自动扣费',
    customer: '观澜科技',
    segment: '续费客户',
    status: '进行中',
    amount: '¥9,380',
    owner: '林予',
    updatedAt: '08:16'
  },
  {
    id: 'ORD-24098',
    channel: 'Web / 风控复查',
    customer: '源木家居',
    segment: '风险观察',
    status: '风险',
    amount: '¥43,120',
    owner: '沈周',
    updatedAt: '08:03'
  },
  {
    id: 'ORD-24097',
    channel: 'App / 老客复购',
    customer: '海右咨询',
    segment: '高价值客户',
    status: '进行中',
    amount: '¥31,500',
    owner: '林予',
    updatedAt: '07:54'
  },
  {
    id: 'ORD-24096',
    channel: 'Web / 企业认证',
    customer: '白鹭电商',
    segment: '重点培育',
    status: '待处理',
    amount: '¥6,290',
    owner: '陈默',
    updatedAt: '07:46'
  },
  {
    id: 'ORD-24095',
    channel: 'API / 套餐升级',
    customer: '正午影业',
    segment: '续费客户',
    status: '已完成',
    amount: '¥18,960',
    owner: '叶澜',
    updatedAt: '07:35'
  },
  {
    id: 'ORD-24094',
    channel: 'Web / 渠道转化',
    customer: '知岸教育',
    segment: '成熟客户',
    status: '进行中',
    amount: '¥11,430',
    owner: '林予',
    updatedAt: '07:22'
  },
  {
    id: 'ORD-24093',
    channel: 'App / 对公转账',
    customer: '临风建筑',
    segment: '风险观察',
    status: '风险',
    amount: '¥52,800',
    owner: '沈周',
    updatedAt: '07:10'
  },
  {
    id: 'ORD-24092',
    channel: 'Web / 首单',
    customer: '云禾食品',
    segment: '重点培育',
    status: '待处理',
    amount: '¥7,860',
    owner: '陈默',
    updatedAt: '06:58'
  },
  {
    id: 'ORD-24091',
    channel: 'App / 企业版',
    customer: '青岚工作室',
    segment: '高价值客户',
    status: '进行中',
    amount: '¥18,900',
    owner: '林予',
    updatedAt: '06:44'
  },
  {
    id: 'ORD-24090',
    channel: 'Web / 风控复核',
    customer: '北桥科技',
    segment: '风险观察',
    status: '风险',
    amount: '¥42,600',
    owner: '沈周',
    updatedAt: '06:32'
  },
  {
    id: 'ORD-24089',
    channel: 'API / 自动续费',
    customer: '山海零售',
    segment: '成熟客户',
    status: '已完成',
    amount: '¥7,280',
    owner: '陈默',
    updatedAt: '06:20'
  },
  {
    id: 'ORD-24088',
    channel: 'App / 新签',
    customer: '亦同咨询',
    segment: '重点培育',
    status: '待处理',
    amount: '¥12,450',
    owner: '叶澜',
    updatedAt: '06:08'
  },
  {
    id: 'ORD-24087',
    channel: 'Web / 老客加购',
    customer: '南街影像',
    segment: '高价值客户',
    status: '进行中',
    amount: '¥5,980',
    owner: '林予',
    updatedAt: '05:54'
  },
  {
    id: 'ORD-24086',
    channel: 'API / 套餐升级',
    customer: '川禾医药',
    segment: '续费客户',
    status: '已完成',
    amount: '¥16,880',
    owner: '叶澜',
    updatedAt: '05:46'
  },
  {
    id: 'ORD-24085',
    channel: 'App / 首单',
    customer: '原点制造',
    segment: '重点培育',
    status: '待处理',
    amount: '¥9,640',
    owner: '陈默',
    updatedAt: '05:31'
  },
  {
    id: 'ORD-24084',
    channel: 'Web / 企业签约',
    customer: '沐川旅业',
    segment: '成熟客户',
    status: '进行中',
    amount: '¥24,300',
    owner: '林予',
    updatedAt: '05:18'
  },
  {
    id: 'ORD-24083',
    channel: 'App / 风险拦截',
    customer: '禾川能源',
    segment: '风险观察',
    status: '风险',
    amount: '¥47,500',
    owner: '沈周',
    updatedAt: '05:06'
  },
  {
    id: 'ORD-24082',
    channel: 'API / 自动扣费',
    customer: '柏年工业',
    segment: '续费客户',
    status: '已完成',
    amount: '¥13,260',
    owner: '叶澜',
    updatedAt: '04:52'
  },
  {
    id: 'ORD-24081',
    channel: 'Web / 渠道活动',
    customer: '嘉禾零售',
    segment: '重点培育',
    status: '待处理',
    amount: '¥8,340',
    owner: '陈默',
    updatedAt: '04:39'
  },
  {
    id: 'ORD-24080',
    channel: 'App / 企业版',
    customer: '至远软件',
    segment: '高价值客户',
    status: '进行中',
    amount: '¥33,700',
    owner: '林予',
    updatedAt: '04:24'
  },
  {
    id: 'ORD-24079',
    channel: 'Web / 对公付款',
    customer: '松云资本',
    segment: '风险观察',
    status: '风险',
    amount: '¥58,900',
    owner: '沈周',
    updatedAt: '04:10'
  },
  {
    id: 'ORD-24078',
    channel: 'API / 年度续费',
    customer: '云章文化',
    segment: '续费客户',
    status: '已完成',
    amount: '¥19,800',
    owner: '叶澜',
    updatedAt: '03:56'
  }
])

const filteredRows = computed(() => {
  const normalizedKeyword = String(keyword.value).toLowerCase()

  return rows.value.filter((row) => {
    // noinspection JSUnresolvedReference
    const matchesStatus = activeStatus.value === '全部' || row.status === activeStatus.value
    // noinspection JSUnresolvedReference
    const matchesChannel = activeChannel.value === '全部' || row.channel === activeChannel.value
    // noinspection JSUnresolvedReference
    const matchesSegment = activeSegments.value.length === 0 || activeSegments.value.indexOf(row.segment) !== -1
    // noinspection JSUnresolvedReference
    const matchesOwner = !ownerKeyword.value || row.owner.toLowerCase().includes(ownerKeyword.value.toLowerCase())
    const rowDateValue = getRowDateValue(row.id)
    const startDateValue = startDate.value ? startDate.value.getTime() : 0
    const endDateValue = endDate.value ? endDate.value.getTime() : 0
    const matchesStartTime = !startDateValue || rowDateValue >= startDateValue
    const matchesEndTime = !endDateValue || rowDateValue <= endDateValue
    // noinspection JSUnresolvedReference
    const matchesKeyword = String([
      row.id,
      row.customer,
      row.owner,
      row.status,
      row.channel,
      row.segment
    ].join(' ')).toLowerCase().includes(normalizedKeyword)

    return matchesStatus
      && matchesChannel
      && matchesSegment
      && matchesOwner
      && matchesStartTime
      && matchesEndTime
      && matchesKeyword
  })
})

// noinspection JSUnresolvedReference
const visibleRowIds = computed(() => filteredRows.value.map((row) => row.id))
// noinspection JSUnresolvedReference
const selectedVisibleCount = computed(() => visibleRowIds.value.filter((id) => selectedRowIds.value.includes(id)).length)
const allVisibleRowsSelected = computed(() => visibleRowIds.value.length > 0 && selectedVisibleCount.value === visibleRowIds.value.length)
const hasPartialVisibleSelection = computed(() => selectedVisibleCount.value > 0 && !allVisibleRowsSelected.value)

function applyFilters() {
  return filteredRows.value
}

function resetFilters() {
  keyword.value = ''
  activeStatus.value = '全部'
  activeChannel.value = '全部'
  activeSegments.value = []
  ownerKeyword.value = ''
  startDate.value = null
  endDate.value = null
  selectedRowIds.value = []
}

function isRowSelected(id) {
  // noinspection JSUnresolvedReference
  return selectedRowIds.value.includes(id)
}

function toggleRowSelection(id) {
  if (isRowSelected(id)) {
    selectedRowIds.value = selectedRowIds.value.filter((rowId) => rowId !== id)
    return
  }

  selectedRowIds.value = [...selectedRowIds.value, id]
}

function toggleAllVisibleRows(nextValue) {
  if (!nextValue) {
    selectedRowIds.value = selectedRowIds.value.filter((id) => !visibleRowIds.value.includes(id))
    return
  }

  const mergedIds = new Set([...selectedRowIds.value, ...visibleRowIds.value])
  selectedRowIds.value = Array.from(mergedIds)
}

function statusClass(status) {
  return {
    'is-pending': status === '待处理',
    'is-active': status === '进行中',
    'is-done': status === '已完成',
    'is-risk': status === '风险'
  }
}

function getRowDateValue(orderId) {
  const suffixValue = Number(String(orderId).slice(-2)) || 0
  const baseDate = new Date(2026, 6, 6, 9, 30, 0)
  baseDate.setDate(baseDate.getDate() - (suffixValue % 12))
  baseDate.setHours(9 + (suffixValue % 9), (suffixValue * 7) % 60, (suffixValue * 11) % 60, 0)
  return baseDate.getTime()
}

function createEmptyEditor() {
  return {
    id: '',
    channel: '',
    customer: '',
    segment: '',
    status: '',
    amount: '',
    owner: '',
    updatedAt: ''
  }
}

function openEditor(row) {
  const currentScrollY = typeof window === 'undefined' ? 0 : window.scrollY

  if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }

  editingRowId.value = row.id
  editForm.value = { ...row }
  isEditorOpen.value = true

  if (typeof window !== 'undefined') {
    nextTick(() => {
      window.scrollTo(0, currentScrollY)
      window.requestAnimationFrame(() => {
        window.scrollTo(0, currentScrollY)
      })
    })
  }
}

function createOrder() {
  const currentScrollY = typeof window === 'undefined' ? 0 : window.scrollY

  if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }

  editingRowId.value = ''
  editForm.value = {
    id: `ORD-${Date.now()}`,
    channel: editableChannels[0] || '',
    customer: '',
    segment: segments[0] || '',
    status: editableStatuses[0] || '',
    amount: '',
    owner: '',
    updatedAt: '刚刚'
  }
  isEditorOpen.value = true

  if (typeof window !== 'undefined') {
    nextTick(() => {
      window.scrollTo(0, currentScrollY)
      window.requestAnimationFrame(() => {
        window.scrollTo(0, currentScrollY)
      })
    })
  }
}

function closeEditor() {
  isEditorOpen.value = false
  editingRowId.value = ''
  editForm.value = createEmptyEditor()
}

function saveEditor() {
  if (!editingRowId.value) {
    rows.value = [
      {
        ...editForm.value,
        updatedAt: '刚刚'
      },
      ...rows.value
    ]

    closeEditor()
    return
  }

  rows.value = rows.value.map((row) => {
    // noinspection JSUnresolvedReference
    if (row.id !== editingRowId.value) {
      return row
    }

    return {
      ...row,
      ...editForm.value,
      updatedAt: '刚刚'
    }
  })

  closeEditor()
}

function deleteRow(id) {
  // noinspection JSUnresolvedReference
  rows.value = rows.value.filter((row) => row.id !== id)
  selectedRowIds.value = selectedRowIds.value.filter((rowId) => rowId !== id)

  if (editingRowId.value === id) {
    closeEditor()
  }
}

function getScrollableEditorContainer(target) {
  if (!(target instanceof Element)) {
    return null
  }

  return target.closest('.table-editor-form')
}

function canScrollEditor(container, deltaY) {
  if (!container || deltaY === 0) {
    return false
  }

  const maxScrollTop = container.scrollHeight - container.clientHeight
  if (maxScrollTop <= 0) {
    return false
  }

  if (deltaY < 0) {
    return container.scrollTop > 0
  }

  return container.scrollTop < maxScrollTop
}

function handleLockedWheel(event) {
  if (!isEditorOpen.value) {
    return
  }

  const container = getScrollableEditorContainer(event.target)
  if (canScrollEditor(container, event.deltaY)) {
    return
  }

  event.preventDefault()
}

function handleLockedKeydown(event) {
  if (!isEditorOpen.value) {
    return
  }

  const activeElement = document.activeElement
  const isTypingTarget = activeElement instanceof HTMLInputElement
    || activeElement instanceof HTMLTextAreaElement
    || activeElement instanceof HTMLSelectElement
    || (activeElement instanceof HTMLElement && activeElement.isContentEditable)

  if (blockedScrollKeys.indexOf(event.key) !== -1) {
    event.preventDefault()
    return
  }

  if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && !isTypingTarget) {
    event.preventDefault()
  }
}

function handleLockedTouchStart(event) {
  const touch = event.touches && event.touches[0]
  touchStartY = touch ? touch.clientY : 0
}

function handleLockedTouchMove(event) {
  if (!isEditorOpen.value) {
    return
  }

  const touch = event.touches && event.touches[0]
  const currentY = touch ? touch.clientY : touchStartY
  const deltaY = touchStartY - currentY
  const container = getScrollableEditorContainer(event.target)

  if (canScrollEditor(container, deltaY)) {
    return
  }

  event.preventDefault()
}

function setPageScrollLocked(locked) {
  if (typeof window === 'undefined') {
    return
  }

  const method = locked ? 'addEventListener' : 'removeEventListener'
  window[method]('wheel', handleLockedWheel, { passive: false })
  window[method]('keydown', handleLockedKeydown, { passive: false })
  window[method]('touchstart', handleLockedTouchStart, { passive: true })
  window[method]('touchmove', handleLockedTouchMove, { passive: false })
}

watch(isEditorOpen, (nextValue) => {
  setPageScrollLocked(nextValue)
})

onBeforeUnmount(() => {
  setPageScrollLocked(false)
})
</script>
