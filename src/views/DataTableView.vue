<!--suppress ALL -->
<template>
  <div class="table-demo-page">
    <UiQueryPanel
      aria-label="数据表格查询区域"
      filter-aria-label="数据筛选"
      title="数据表格"
      description="展示后台列表页中常用的搜索、筛选、状态列与分页结构。"
    >
        <template #fields>
        <UiFilterFields v-model="filterValues" :fields="filterFields" />
        </template>
        <template #actions>
          <UiButton @click="resetFilters">重置</UiButton>
          <UiButton variant="primary" @click="applyFilters">查询</UiButton>
        </template>
    </UiQueryPanel>

    <UiDataTable
      aria-label="数据表格内容区域"
      :summary-text="`共 ${filteredRows.length} 条记录，已选 ${selectedVisibleCount} 条`"
      :is-empty="filteredRows.length === 0"
      empty-text="没有匹配的数据，调整搜索词或状态筛选后重试。"
    >
      <template #actions>
        <UiButton class="table-create-button" variant="primary" @click="createOrder">新增订单</UiButton>
      </template>

      <template #grid>
        <UiDataTableGrid
          :columns="orderTableColumns"
          :rows="filteredRows"
          :selected-row-ids="selectedRowIds"
        >
          <template #header-select>
            <UiCheckbox
              :model-value="allVisibleRowsSelected"
              :indeterminate="hasPartialVisibleSelection"
              @update:model-value="toggleAllVisibleRows"
            />
          </template>

          <template #header-actions>
            <span class="table-action-cell table-action-column">操作</span>
          </template>

          <template #cell-select="{ row }">
            <UiCheckbox
              :model-value="isRowSelected(row.id)"
              @update:model-value="toggleRowSelection(row.id)"
            />
          </template>

          <template #cell-order="{ row }">
            <strong>{{ row.id }}</strong>
            <small>{{ row.channel }}</small>
          </template>

          <template #cell-status="{ row }">
            <em class="status-pill" :class="statusClass(row.status)">{{ row.status }}</em>
          </template>

          <template #cell-customer="{ row }">
            <strong>{{ row.customer }}</strong>
            <small>{{ row.segment }}</small>
          </template>

          <template #cell-amount="{ row }">
            <strong>{{ row.amount }}</strong>
          </template>

          <template #cell-owner="{ row }">
            {{ row.owner }}
          </template>

          <template #cell-updatedAt="{ row }">
            {{ row.updatedAt }}
          </template>

          <template #cell-actions="{ row }">
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
              @click.stop="openDeleteConfirm(row)"
            >
              删除
            </UiButton>
          </template>
        </UiDataTableGrid>
      </template>

      <template #pagination>
        <UiPagination v-model="currentPage" :pages="[1, 2, 3]" />
      </template>
    </UiDataTable>

    <Teleport to="body">
      <Transition name="table-editor-scrim">
        <button
          v-if="isDialogOpen"
          class="table-editor-scrim"
          type="button"
          :aria-label="isDeleteConfirmOpen ? '关闭删除确认弹窗' : '关闭编辑弹窗'"
          @click="closeActiveDialog"
        ></button>
      </Transition>

      <UiEditorDialog
        :visible="isEditorOpen"
        aria-label="订单编辑弹窗"
        title="编辑订单"
        :subtitle="editForm.id || '未选择订单'"
        close-aria-label="关闭编辑弹窗"
        :save-loading="isSavingRow"
        :disable-close="isSavingRow"
        @close="closeEditor"
        @cancel="closeEditor"
        @save="saveEditor"
      >
        <template #summary>
          <div>
            <span>金额</span>
            <strong>{{ editForm.amount || '--' }}</strong>
          </div>
          <div>
            <span>更新时间</span>
            <strong>{{ editForm.updatedAt || '--' }}</strong>
          </div>
        </template>

        <UiEditorFields v-model="editForm" :fields="editorFields" />
      </UiEditorDialog>

      <UiConfirmDialog
        :visible="isDeleteConfirmOpen"
        aria-label="删除订单确认弹窗"
        title="确认删除"
        :subtitle="pendingDeleteRow ? pendingDeleteRow.id : '未选择订单'"
        description="删除后该订单将从当前列表移除，且无法恢复。"
        close-aria-label="关闭删除确认弹窗"
        confirm-text="确认删除"
        :confirm-loading="isDeletingRow"
        @close="closeDeleteConfirm"
        @cancel="closeDeleteConfirm"
        @confirm="confirmDelete"
      >
        <template #meta>
          <div v-if="pendingDeleteRow">
            <dt>客户名称</dt>
            <dd>{{ pendingDeleteRow.customer }}</dd>
          </div>
          <div v-if="pendingDeleteRow">
            <dt>订单状态</dt>
            <dd>{{ pendingDeleteRow.status }}</dd>
          </div>
        </template>
      </UiConfirmDialog>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import UiButton from '../components/UiButton.vue'
import UiCheckbox from '../components/UiCheckbox.vue'
import UiConfirmDialog from '../components/UiConfirmDialog.vue'
import UiDataTable from '../components/UiDataTable.vue'
import UiDataTableGrid from '../components/UiDataTableGrid.vue'
import UiEditorDialog from '../components/UiEditorDialog.vue'
import UiEditorFields from '../components/UiEditorFields.vue'
import UiFilterFields from '../components/UiFilterFields.vue'
import UiPagination from '../components/UiPagination.vue'
import UiQueryPanel from '../components/UiQueryPanel.vue'
import { showErrorMessage, showSuccessMessage } from '../components/uiMessage'
import { preservePageScroll } from '../composables/useDialogScrollPosition'
import { useDialogScrollLock } from '../composables/useDialogScrollLock'
import { orderEditorFieldConfig } from '../config/tableEditorFields'
import { orderFilterFields } from '../config/tableFilters'
import { orderTableColumns } from '../config/tableColumns'

const statuses = getFieldOptions(orderFilterFields, 'status')
const channels = getFieldOptions(orderFilterFields, 'channel')
const segments = getFieldOptions(orderFilterFields, 'segments')
const editableStatuses = statuses.filter((status) => status !== '全部')
const editableChannels = channels.filter((channel) => channel !== '全部')
const editorFields = orderEditorFieldConfig.map((field) => {
  const optionsMap = {
    statusOptions: editableStatuses,
    channelOptions: editableChannels,
    segmentOptions: segments
  }

  return field.optionsKey
    ? { ...field, options: optionsMap[field.optionsKey] || [] }
    : field
})
const isStatusLoading = ref(true)
const isSegmentLoading = ref(true)
const filterValues = ref(createDefaultOrderFilters())
const currentPage = ref(1)
const selectedRowIds = ref([])
const isEditorOpen = ref(false)
const pendingDeleteRow = ref(null)
const isSavingRow = ref(false)
const isDeletingRow = ref(false)
const editingRowId = ref('')
const editForm = ref(createEmptyEditor())
let statusLoadingTimer = 0
let segmentLoadingTimer = 0

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
  const normalizedKeyword = String(filterValues.value.keyword).toLowerCase()

  return rows.value.filter((row) => {
    // noinspection JSUnresolvedReference
    const matchesStatus = filterValues.value.status === '全部' || row.status === filterValues.value.status
    // noinspection JSUnresolvedReference
    const matchesChannel = filterValues.value.channel === '全部' || row.channel === filterValues.value.channel
    // noinspection JSUnresolvedReference
    const matchesSegment = filterValues.value.segments.length === 0 || filterValues.value.segments.indexOf(row.segment) !== -1
    // noinspection JSUnresolvedReference
    const matchesOwner = !filterValues.value.ownerKeyword || row.owner.toLowerCase().includes(filterValues.value.ownerKeyword.toLowerCase())
    // noinspection JSUnresolvedReference
    const rowDateValue = getRowDateValue(row.id)
    const startDateValue = filterValues.value.startDate ? filterValues.value.startDate.getTime() : 0
    const endDateValue = filterValues.value.endDate ? filterValues.value.endDate.getTime() : 0
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
const isDeleteConfirmOpen = computed(() => Boolean(pendingDeleteRow.value))
const isDialogOpen = computed(() => isEditorOpen.value || isDeleteConfirmOpen.value)
const filterFields = computed(() => orderFilterFields.map((field) => {
  if (field.key === 'status') {
    return {
      ...field,
      loading: isStatusLoading.value
    }
  }

  if (field.key === 'segments') {
    return {
      ...field,
      loading: isSegmentLoading.value
    }
  }

  return field
}))

useDialogScrollLock(isDialogOpen, closeActiveDialog)

function applyFilters() {
  return filteredRows.value
}

function resetFilters() {
  filterValues.value = createDefaultOrderFilters()
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

function getRowDateObject(orderId) {
  return new Date(getRowDateValue(orderId))
}

function getFieldOptions(fields, key) {
  const matchedField = fields.find((field) => field.key === key)
  return matchedField && Array.isArray(matchedField.options) ? matchedField.options : []
}

function createDefaultOrderFilters() {
  return {
    keyword: '',
    status: '全部',
    channel: '全部',
    ownerKeyword: '',
    startDate: null,
    endDate: null,
    segments: []
  }
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
    updatedAt: '',
    scheduledAt: null
  }
}

function openEditor(row) {
  preservePageScroll(() => {
    editingRowId.value = row.id
    editForm.value = {
      ...row,
      scheduledAt: row.scheduledAt instanceof Date ? row.scheduledAt : getRowDateObject(row.id)
    }
    isEditorOpen.value = true
  })
}

function createOrder() {
  preservePageScroll(() => {
    editingRowId.value = ''
    editForm.value = {
      id: `ORD-${Date.now()}`,
      channel: editableChannels[0] || '',
      customer: '',
      segment: segments[0] || '',
      status: editableStatuses[0] || '',
      amount: '',
      owner: '',
      updatedAt: '刚刚',
      scheduledAt: new Date()
    }
    isEditorOpen.value = true
  })
}

function closeEditor(forceClose) {
  if (isSavingRow.value && !forceClose) {
    return
  }

  isEditorOpen.value = false
  editingRowId.value = ''
  editForm.value = createEmptyEditor()
}

function openDeleteConfirm(row) {
  pendingDeleteRow.value = { ...row }
}

function closeDeleteConfirm() {
  if (isDeletingRow.value) {
    return
  }

  pendingDeleteRow.value = null
}

function closeActiveDialog() {
  if (isDeleteConfirmOpen.value) {
    closeDeleteConfirm()
    return
  }

  closeEditor()
}

async function saveEditor() {
  if (isSavingRow.value) {
    return
  }

  isSavingRow.value = true

  try {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 600)
    })

    if (!editingRowId.value) {
      rows.value = [
        {
          ...editForm.value,
          updatedAt: '刚刚'
        },
        ...rows.value
      ]

      closeEditor(true)
      showSuccessMessage('订单已保存')
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

    closeEditor(true)
    showSuccessMessage('订单已保存')
  } catch {
    showErrorMessage('保存失败，请稍后重试')
  } finally {
    isSavingRow.value = false
  }
}

function deleteRow(id) {
  // noinspection JSUnresolvedReference
  rows.value = rows.value.filter((row) => row.id !== id)
  selectedRowIds.value = selectedRowIds.value.filter((rowId) => rowId !== id)

  if (editingRowId.value === id) {
    closeEditor()
  }
}

async function confirmDelete() {
  if (!pendingDeleteRow.value || isDeletingRow.value) {
    return
  }

  isDeletingRow.value = true

  try {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 600)
    })

    deleteRow(pendingDeleteRow.value.id)
    closeDeleteConfirm()
    showSuccessMessage('订单已删除')
  } catch {
    showErrorMessage('删除失败，请稍后重试')
  } finally {
    isDeletingRow.value = false
  }
}

onMounted(() => {
  statusLoadingTimer = window.setTimeout(() => {
    isStatusLoading.value = false
  }, 5000)

  segmentLoadingTimer = window.setTimeout(() => {
    isSegmentLoading.value = false
  }, 5000)
})

onBeforeUnmount(() => {
  if (statusLoadingTimer) {
    window.clearTimeout(statusLoadingTimer)
  }

  if (segmentLoadingTimer) {
    window.clearTimeout(segmentLoadingTimer)
  }
})
</script>
