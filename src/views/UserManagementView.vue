<template>
  <div class="table-demo-page">
    <UiQueryPanel
      aria-label="用户管理查询区域"
      filter-aria-label="用户筛选"
      title="用户管理"
      description="用于维护后台账号、角色权限、归属部门与登录状态。"
    >
        <UiFilterFields v-model="filterValues" :fields="userFilterFields" />
        <template #actions>
          <UiButton @click="resetFilters">重置</UiButton>
          <UiButton variant="primary" @click="applyFilters">查询</UiButton>
        </template>
    </UiQueryPanel>

    <UiDataTable
      aria-label="用户管理列表区域"
      :summary-text="`共 ${filteredUsers.length} 条记录，已选 ${selectedVisibleCount} 条`"
      :is-empty="filteredUsers.length === 0"
      empty-text="没有匹配的用户，调整筛选条件后重试。"
    >
      <template #actions>
        <UiButton class="table-create-button" variant="primary" @click="createUser">新增用户</UiButton>
      </template>

      <template #grid>
        <UiDataTableGrid
          :columns="userTableColumns"
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
        <UiPagination v-model="currentPage" :pages="[1, 2, 3]" />
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

        <UiEditorFields v-model="editForm" :fields="editorFields" />
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
import { computed, ref } from 'vue'
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
import { userEditorFieldConfig } from '../config/tableEditorFields'
import { userFilterFields } from '../config/tableFilters'
import { userTableColumns } from '../config/tableColumns'

const statuses = getFieldOptions(userFilterFields, 'status')
const roles = getFieldOptions(userFilterFields, 'role')
const departments = getFieldOptions(userFilterFields, 'department')
const editableStatuses = statuses.filter((item) => item !== '全部')
const editableRoles = roles.filter((item) => item !== '全部')
const editableDepartments = departments.filter((item) => item !== '全部')
const editorFields = userEditorFieldConfig.map((field) => {
  const optionsMap = {
    statusOptions: editableStatuses,
    roleOptions: editableRoles,
    departmentOptions: editableDepartments
  }

  return field.optionsKey
    ? { ...field, options: optionsMap[field.optionsKey] || [] }
    : field
})

const filterValues = ref(createDefaultUserFilters())
const currentPage = ref(1)
const selectedRowIds = ref([])
const isEditorOpen = ref(false)
const pendingDeleteRow = ref(null)
const isSavingUser = ref(false)
const isDeletingUser = ref(false)
const editingRowId = ref('')
const editForm = ref(createEmptyEditor())

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
  const normalizedKeyword = String(filterValues.value.keyword).toLowerCase()

  return users.value.filter((user) => {
    const matchesKeyword = [
      user.id,
      user.name,
      user.phone,
      user.email,
      user.role,
      user.department
    ].join(' ').toLowerCase().includes(normalizedKeyword)
    const matchesStatus = filterValues.value.status === '全部' || user.status === filterValues.value.status
    const matchesRole = filterValues.value.role === '全部' || user.role === filterValues.value.role
    const matchesDepartment = filterValues.value.department === '全部' || user.department === filterValues.value.department
    const startDateValue = filterValues.value.startDate ? filterValues.value.startDate.getTime() : 0
    const endDateValue = filterValues.value.endDate ? filterValues.value.endDate.getTime() : 0
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

useDialogScrollLock(isDialogOpen, closeActiveDialog)

function applyFilters() {
  return filteredUsers.value
}

function resetFilters() {
  filterValues.value = createDefaultUserFilters()
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

function getFieldOptions(fields, key) {
  const matchedField = fields.find((field) => field.key === key)
  return matchedField && Array.isArray(matchedField.options) ? matchedField.options : []
}

function createDefaultUserFilters() {
  return {
    keyword: '',
    status: '全部',
    role: '全部',
    department: '全部',
    startDate: null,
    endDate: null
  }
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
  preservePageScroll(() => {
    editingRowId.value = user.id
    editForm.value = {
      ...user,
      lastLoginAt: user.lastLoginAt instanceof Date ? new Date(user.lastLoginAt) : new Date(user.lastLoginAt)
    }
    isEditorOpen.value = true
  })
}

function createUser() {
  preservePageScroll(() => {
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
  })
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

</script>
