<template>
  <div class="table-demo-page">
    <UiQueryPanel
      aria-label="用户管理查询区域"
      filter-aria-label="用户筛选"
      title="用户管理"
      description="用于维护后台账号、角色权限、归属部门与登录状态。"
    >
        <div class="table-search-field">
          <span class="table-select-label">搜索用户</span>
          <div class="search-bar" role="search" aria-label="搜索用户">
            <input
              v-model.trim="keyword"
              class="search-input"
              type="search"
              placeholder="搜索姓名、工号、手机、邮箱"
            >
          </div>
        </div>

        <label class="table-select-field">
          <span class="table-select-label">账号状态</span>
          <UiSelect
            v-model="activeStatus"
            :options="statuses"
            label="账号状态"
            placeholder="请选择状态"
          />
        </label>

        <label class="table-select-field">
          <span class="table-select-label">角色类型</span>
          <UiSelect
            v-model="activeRole"
            :options="roles"
            label="角色类型"
            placeholder="请选择角色"
          />
        </label>

        <label class="table-select-field">
          <span class="table-select-label">所属部门</span>
          <UiSelect
            v-model="activeDepartment"
            :options="departments"
            label="所属部门"
            placeholder="请选择部门"
          />
        </label>

        <label class="table-select-field table-time-field">
          <span class="table-select-label">登录开始时间</span>
          <UiDateTimePicker v-model="startDate" placeholder="选择开始时间" />
        </label>

        <label class="table-select-field table-time-field">
          <span class="table-select-label">登录结束时间</span>
          <UiDateTimePicker v-model="endDate" placeholder="选择结束时间" />
        </label>

        <div class="table-filter-actions">
          <UiButton @click="resetFilters">重置</UiButton>
          <UiButton variant="primary" @click="applyFilters">查询</UiButton>
        </div>
    </UiQueryPanel>

    <UiDataTable
      aria-label="用户管理列表区域"
      :summary-text="`共 ${filteredUsers.length} 条记录，已选 ${selectedVisibleCount} 条`"
      :is-empty="filteredUsers.length === 0"
      empty-text="没有匹配的用户，调整筛选条件后重试。"
    >
      <template #head-action>
        <UiButton class="table-create-button" variant="primary" @click="createUser">新增用户</UiButton>
      </template>

      <template #grid>
        <UiDataTableGrid
          :columns="tableColumns"
          :rows="filteredUsers"
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

          <template #cell-user="{ row }">
            <strong>{{ row.name }}</strong>
            <small>{{ row.id }}</small>
          </template>

          <template #cell-role="{ row }">
            {{ row.role }}
          </template>

          <template #cell-department="{ row }">
            <strong>{{ row.department }}</strong>
            <small>{{ row.email }}</small>
          </template>

          <template #cell-status="{ row }">
            <em class="status-pill" :class="statusClass(row.status)">{{ row.status }}</em>
          </template>

          <template #cell-phone="{ row }">
            <strong>{{ row.phone }}</strong>
          </template>

          <template #cell-lastLoginAt="{ row }">
            {{ formatTableDate(row.lastLoginAt) }}
          </template>

          <template #cell-actions="{ row }">
            <UiButton class="table-action-button" @mousedown.prevent @click.stop="openEditor(row)">编辑</UiButton>
            <UiButton class="table-action-button table-action-button-danger" @mousedown.prevent @click.stop="openDeleteConfirm(row)">删除</UiButton>
          </template>
        </UiDataTableGrid>
      </template>

      <template #footer>
        <div class="button-toolbar">
          <UiButton disabled>上一页</UiButton>
          <UiButton variant="primary">1</UiButton>
          <UiButton>2</UiButton>
          <UiButton>3</UiButton>
          <UiButton>下一页</UiButton>
        </div>
      </template>
    </UiDataTable>

    <Teleport to="body">
      <Transition name="table-editor-scrim">
        <button
          v-if="isDialogOpen"
          class="table-editor-scrim"
          type="button"
          :aria-label="isDeleteConfirmOpen ? '关闭删除确认弹窗' : '关闭用户编辑弹窗'"
          @click="closeActiveDialog"
        ></button>
      </Transition>

      <UiEditorDialog
        :visible="isEditorOpen"
        aria-label="用户编辑弹窗"
        :title="editingRowId ? '编辑用户' : '新增用户'"
        :subtitle="editForm.id || '未生成工号'"
        close-aria-label="关闭用户编辑弹窗"
        :save-loading="isSavingUser"
        :disable-close="isSavingUser"
        @close="closeEditor"
        @cancel="closeEditor"
        @save="saveEditor"
      >
        <template #summary>
          <div>
            <span>所属部门</span>
            <strong>{{ editForm.department || '--' }}</strong>
          </div>
          <div>
            <span>最近登录</span>
            <strong>{{ editForm.lastLoginAt ? formatFullDate(editForm.lastLoginAt) : '--' }}</strong>
          </div>
        </template>

        <label class="table-select-field">
          <span class="table-select-label">用户姓名</span>
          <span class="search-bar" role="group" aria-label="用户姓名">
            <input v-model.trim="editForm.name" class="search-input" type="text" placeholder="输入用户姓名">
          </span>
        </label>

        <label class="table-select-field">
          <span class="table-select-label">手机号</span>
          <span class="search-bar" role="group" aria-label="手机号">
            <input v-model.trim="editForm.phone" class="search-input" type="text" placeholder="输入手机号">
          </span>
        </label>

        <label class="table-select-field">
          <span class="table-select-label">邮箱</span>
          <span class="search-bar" role="group" aria-label="邮箱">
            <input v-model.trim="editForm.email" class="search-input" type="text" placeholder="输入邮箱">
          </span>
        </label>

        <label class="table-select-field">
          <span class="table-select-label">角色类型</span>
          <UiSelect v-model="editForm.role" :options="editableRoles" label="角色类型" placeholder="请选择角色" />
        </label>

        <label class="table-select-field">
          <span class="table-select-label">所属部门</span>
          <UiSelect v-model="editForm.department" :options="editableDepartments" label="所属部门" placeholder="请选择部门" />
        </label>

        <label class="table-select-field">
          <span class="table-select-label">账号状态</span>
          <UiSelect v-model="editForm.status" :options="editableStatuses" label="账号状态" placeholder="请选择状态" />
        </label>

        <label class="table-select-field table-time-field">
          <span class="table-select-label">最近登录时间</span>
          <UiDateTimePicker v-model="editForm.lastLoginAt" placeholder="选择最近登录时间" />
        </label>
      </UiEditorDialog>

      <UiConfirmDialog
        :visible="isDeleteConfirmOpen"
        aria-label="删除用户确认弹窗"
        title="确认删除"
        :subtitle="pendingDeleteRow ? pendingDeleteRow.name : '未选择用户'"
        description="删除后该账号会从当前列表移除，且无法恢复。"
        close-aria-label="关闭删除用户确认弹窗"
        confirm-text="确认删除"
        :confirm-loading="isDeletingUser"
        @close="closeDeleteConfirm"
        @cancel="closeDeleteConfirm"
        @confirm="confirmDelete"
      >
        <template #meta>
          <div v-if="pendingDeleteRow">
            <dt>工号</dt>
            <dd>{{ pendingDeleteRow.id }}</dd>
          </div>
          <div v-if="pendingDeleteRow">
            <dt>角色</dt>
            <dd>{{ pendingDeleteRow.role }}</dd>
          </div>
        </template>
      </UiConfirmDialog>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import UiButton from '../components/UiButton.vue'
import UiCheckbox from '../components/UiCheckbox.vue'
import UiConfirmDialog from '../components/UiConfirmDialog.vue'
import UiDataTable from '../components/UiDataTable.vue'
import UiDataTableGrid from '../components/UiDataTableGrid.vue'
import UiDateTimePicker from '../components/UiDateTimePicker.vue'
import UiEditorDialog from '../components/UiEditorDialog.vue'
import UiQueryPanel from '../components/UiQueryPanel.vue'
import UiSelect from '../components/UiSelect.vue'
import { showErrorMessage, showSuccessMessage } from '../components/uiMessage'

const statuses = ['全部', '正常', '待激活', '冻结']
const roles = ['全部', '运营管理员', '客服主管', '财务专员', '内容审核员', '超级管理员']
const departments = ['全部', '运营中心', '客户成功', '财务组', '内容中心', '技术支持']
const editableStatuses = statuses.filter((item) => item !== '全部')
const editableRoles = roles.filter((item) => item !== '全部')
const editableDepartments = departments.filter((item) => item !== '全部')
const tableColumns = [
  { key: 'select', label: '', headerClass: 'table-checkbox-cell', cellClass: 'table-checkbox-cell table-cell table-cell-checkbox', dataLabel: '' },
  { key: 'user', label: '用户', cellClass: 'table-cell table-cell-order' },
  { key: 'role', label: '角色', cellClass: 'table-cell table-cell-owner' },
  { key: 'department', label: '部门', cellClass: 'table-cell table-cell-customer' },
  { key: 'status', label: '状态', cellClass: 'table-cell table-cell-status' },
  { key: 'phone', label: '手机号', cellClass: 'table-cell table-cell-amount' },
  { key: 'lastLoginAt', label: '最近登录', cellClass: 'table-cell table-cell-updated' },
  { key: 'actions', label: '操作', headerClass: 'table-action-cell table-action-column', cellClass: 'table-action-cell table-action-column table-cell table-cell-action' }
]

const keyword = ref('')
const activeStatus = ref('全部')
const activeRole = ref('全部')
const activeDepartment = ref('全部')
const startDate = ref(null)
const endDate = ref(null)
const selectedRowIds = ref([])
const isEditorOpen = ref(false)
const pendingDeleteRow = ref(null)
const isSavingUser = ref(false)
const isDeletingUser = ref(false)
const editingRowId = ref('')
const editForm = ref(createEmptyEditor())
const blockedScrollKeys = [' ', 'PageUp', 'PageDown', 'Home', 'End']
let touchStartY = 0

const users = ref([
  createUserRecord('USR-24061', '林予', '运营管理员', '运营中心', '正常', '138 2011 0482', 'linyu@admin.demo', createDate(0, 10, 42)),
  createUserRecord('USR-24060', '陈默', '客服主管', '客户成功', '正常', '136 1482 1164', 'chenmo@admin.demo', createDate(0, 10, 18)),
  createUserRecord('USR-24059', '叶澜', '财务专员', '财务组', '待激活', '139 7003 2241', 'yelan@admin.demo', createDate(0, 9, 56)),
  createUserRecord('USR-24058', '沈周', '内容审核员', '内容中心', '冻结', '137 9338 4026', 'shenzhou@admin.demo', createDate(0, 9, 31)),
  createUserRecord('USR-24057', '许栀', '运营管理员', '运营中心', '正常', '135 8421 0792', 'xuzhi@admin.demo', createDate(0, 9, 12)),
  createUserRecord('USR-24056', '周序', '超级管理员', '技术支持', '正常', '188 0142 6821', 'zhouxu@admin.demo', createDate(0, 8, 58)),
  createUserRecord('USR-24055', '宋箐', '客服主管', '客户成功', '待激活', '186 4218 9532', 'songqing@admin.demo', createDate(1, 18, 34)),
  createUserRecord('USR-24054', '白芷', '内容审核员', '内容中心', '正常', '153 8821 1472', 'baizhi@admin.demo', createDate(1, 16, 50)),
  createUserRecord('USR-24053', '唐策', '财务专员', '财务组', '正常', '152 6301 0744', 'tangce@admin.demo', createDate(2, 11, 22)),
  createUserRecord('USR-24052', '顾岑', '运营管理员', '运营中心', '冻结', '131 8042 5371', 'gucen@admin.demo', createDate(2, 9, 48)),
  createUserRecord('USR-24051', '姜禾', '客服主管', '客户成功', '正常', '133 1048 8420', 'jianghe@admin.demo', createDate(3, 20, 11)),
  createUserRecord('USR-24050', '罗汀', '内容审核员', '内容中心', '待激活', '187 2250 3164', 'luoting@admin.demo', createDate(4, 15, 9))
])

const filteredUsers = computed(() => {
  const normalizedKeyword = String(keyword.value).toLowerCase()

  return users.value.filter((user) => {
    const matchesKeyword = [
      user.id,
      user.name,
      user.phone,
      user.email,
      user.role,
      user.department
    ].join(' ').toLowerCase().includes(normalizedKeyword)
    const matchesStatus = activeStatus.value === '全部' || user.status === activeStatus.value
    const matchesRole = activeRole.value === '全部' || user.role === activeRole.value
    const matchesDepartment = activeDepartment.value === '全部' || user.department === activeDepartment.value
    const startDateValue = startDate.value ? startDate.value.getTime() : 0
    const endDateValue = endDate.value ? endDate.value.getTime() : 0
    const loginTime = user.lastLoginAt.getTime()
    const matchesStartTime = !startDateValue || loginTime >= startDateValue
    const matchesEndTime = !endDateValue || loginTime <= endDateValue

    return matchesKeyword && matchesStatus && matchesRole && matchesDepartment && matchesStartTime && matchesEndTime
  })
})

const visibleRowIds = computed(() => filteredUsers.value.map((item) => item.id))
const selectedVisibleCount = computed(() => visibleRowIds.value.filter((id) => selectedRowIds.value.includes(id)).length)
const allVisibleRowsSelected = computed(() => visibleRowIds.value.length > 0 && selectedVisibleCount.value === visibleRowIds.value.length)
const hasPartialVisibleSelection = computed(() => selectedVisibleCount.value > 0 && !allVisibleRowsSelected.value)
const isDeleteConfirmOpen = computed(() => Boolean(pendingDeleteRow.value))
const isDialogOpen = computed(() => isEditorOpen.value || isDeleteConfirmOpen.value)

function applyFilters() {
  return filteredUsers.value
}

function resetFilters() {
  keyword.value = ''
  activeStatus.value = '全部'
  activeRole.value = '全部'
  activeDepartment.value = '全部'
  startDate.value = null
  endDate.value = null
  selectedRowIds.value = []
}

function isRowSelected(id) {
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
    'is-active': status === '正常',
    'is-pending': status === '待激活',
    'is-risk': status === '冻结'
  }
}

function createEmptyEditor() {
  return {
    id: '',
    name: '',
    role: '',
    department: '',
    status: '',
    phone: '',
    email: '',
    lastLoginAt: null
  }
}

function createUserRecord(id, name, role, department, status, phone, email, lastLoginAt) {
  return {
    id,
    name,
    role,
    department,
    status,
    phone,
    email,
    lastLoginAt
  }
}

function createDate(dayOffset, hour, minute) {
  const nextDate = new Date(2026, 6, 9, hour, minute, 0, 0)
  nextDate.setDate(nextDate.getDate() - dayOffset)
  return nextDate
}

function formatTableDate(value) {
  const dateValue = value instanceof Date ? value : new Date(value)
  const now = new Date(2026, 6, 9, 23, 0, 0, 0)
  const sameDay = dateValue.toDateString() === now.toDateString()
  const month = String(dateValue.getMonth() + 1).padStart(2, '0')
  const day = String(dateValue.getDate()).padStart(2, '0')
  const hour = String(dateValue.getHours()).padStart(2, '0')
  const minute = String(dateValue.getMinutes()).padStart(2, '0')
  return sameDay ? `${hour}:${minute}` : `${month}/${day} ${hour}:${minute}`
}

function formatFullDate(value) {
  const dateValue = value instanceof Date ? value : new Date(value)
  const year = dateValue.getFullYear()
  const month = String(dateValue.getMonth() + 1).padStart(2, '0')
  const day = String(dateValue.getDate()).padStart(2, '0')
  const hour = String(dateValue.getHours()).padStart(2, '0')
  const minute = String(dateValue.getMinutes()).padStart(2, '0')
  const second = String(dateValue.getSeconds()).padStart(2, '0')
  return `${year}/${month}/${day} ${hour}:${minute}:${second}`
}

function openEditor(user) {
  const currentScrollY = typeof window === 'undefined' ? 0 : window.scrollY

  if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }

  editingRowId.value = user.id
  editForm.value = {
    ...user,
    lastLoginAt: user.lastLoginAt instanceof Date ? new Date(user.lastLoginAt) : new Date(user.lastLoginAt)
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

function createUser() {
  const currentScrollY = typeof window === 'undefined' ? 0 : window.scrollY

  if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }

  editingRowId.value = ''
  editForm.value = {
    id: `USR-${Date.now()}`,
    name: '',
    role: editableRoles[0] || '',
    department: editableDepartments[0] || '',
    status: editableStatuses[0] || '',
    phone: '',
    email: '',
    lastLoginAt: new Date()
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

function closeEditor(forceClose) {
  if (isSavingUser.value && !forceClose) {
    return
  }

  isEditorOpen.value = false
  editingRowId.value = ''
  editForm.value = createEmptyEditor()
}

function openDeleteConfirm(user) {
  pendingDeleteRow.value = { ...user }
}

function closeDeleteConfirm() {
  if (isDeletingUser.value) {
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
  if (isSavingUser.value) {
    return
  }

  isSavingUser.value = true

  try {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 600)
    })

    if (!editingRowId.value) {
      users.value = [{
        ...editForm.value,
        lastLoginAt: editForm.value.lastLoginAt || new Date()
      }, ...users.value]

      closeEditor(true)
      showSuccessMessage('用户已保存')
      return
    }

    users.value = users.value.map((user) => {
      if (user.id !== editingRowId.value) {
        return user
      }

      return {
        ...user,
        ...editForm.value,
        lastLoginAt: editForm.value.lastLoginAt || new Date()
      }
    })

    closeEditor(true)
    showSuccessMessage('用户已保存')
  } catch {
    showErrorMessage('保存失败，请稍后重试')
  } finally {
    isSavingUser.value = false
  }
}

function deleteUser(id) {
  users.value = users.value.filter((user) => user.id !== id)
  selectedRowIds.value = selectedRowIds.value.filter((rowId) => rowId !== id)

  if (editingRowId.value === id) {
    closeEditor()
  }
}

async function confirmDelete() {
  if (!pendingDeleteRow.value || isDeletingUser.value) {
    return
  }

  isDeletingUser.value = true

  try {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 600)
    })

    deleteUser(pendingDeleteRow.value.id)
    closeDeleteConfirm()
    showSuccessMessage('用户已删除')
  } catch {
    showErrorMessage('删除失败，请稍后重试')
  } finally {
    isDeletingUser.value = false
  }
}

function getScrollableEditorContainer(target) {
  if (!(target instanceof Element)) {
    return null
  }

  return target.closest(
    '.table-editor-form, .ui-select-menu, .dp--menu-wrapper, .dp--menu, .dp__menu, .dp__instance_calendar'
  )
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
  if (!isDialogOpen.value) {
    return
  }

  const container = getScrollableEditorContainer(event.target)
  if (canScrollEditor(container, event.deltaY)) {
    return
  }

  event.preventDefault()
}

function handleLockedKeydown(event) {
  if (!isDialogOpen.value) {
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

  if (event.key === 'Escape') {
    closeActiveDialog()
  }
}

function handleLockedTouchStart(event) {
  const touch = event.touches && event.touches[0]
  touchStartY = touch ? touch.clientY : 0
}

function handleLockedTouchMove(event) {
  if (!isDialogOpen.value) {
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

watch(isDialogOpen, (nextValue) => {
  setPageScrollLocked(nextValue)
})

onBeforeUnmount(() => {
  setPageScrollLocked(false)
})
</script>
