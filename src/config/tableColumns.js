function createColumn(key, label, cellClass, extra = {}) {
  return {
    key,
    label,
    cellClass,
    ...extra
  }
}

function createSelectionColumn() {
  return createColumn(
    'select',
    '',
    'table-checkbox-cell table-cell table-cell-checkbox',
    {
      headerClass: 'table-checkbox-cell',
      dataLabel: ''
    }
  )
}

function createActionColumn() {
  return createColumn(
    'actions',
    '操作',
    'table-action-cell table-action-column table-cell table-cell-action',
    {
      headerClass: 'table-action-cell table-action-column'
    }
  )
}

export const orderTableColumns = [
  createSelectionColumn(),
  createColumn('order', '订单', 'table-cell table-cell-order'),
  createColumn('customer', '客户', 'table-cell table-cell-customer'),
  createColumn('status', '状态', 'table-cell table-cell-status'),
  createColumn('amount', '金额', 'table-cell table-cell-amount'),
  createColumn('owner', '负责人', 'table-cell table-cell-owner'),
  createColumn('updatedAt', '更新时间', 'table-cell table-cell-updated'),
  createActionColumn()
]

export const userTableColumns = [
  createSelectionColumn(),
  createColumn('user', '用户', 'table-cell table-cell-order'),
  createColumn('role', '角色', 'table-cell table-cell-owner'),
  createColumn('department', '部门', 'table-cell table-cell-customer'),
  createColumn('status', '状态', 'table-cell table-cell-status'),
  createColumn('phone', '手机号', 'table-cell table-cell-amount'),
  createColumn('lastLoginAt', '最近登录', 'table-cell table-cell-updated'),
  createActionColumn()
]
