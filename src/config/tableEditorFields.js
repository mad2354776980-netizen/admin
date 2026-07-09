export const orderEditorFieldConfig = [
  {
    key: 'customer',
    type: 'text',
    label: '客户名称',
    ariaLabel: '客户名称',
    placeholder: '输入客户名称'
  },
  {
    key: 'status',
    type: 'select',
    label: '订单状态',
    placeholder: '请选择状态',
    optionsKey: 'statusOptions'
  },
  {
    key: 'channel',
    type: 'select',
    label: '渠道来源',
    placeholder: '请选择渠道',
    optionsKey: 'channelOptions'
  },
  {
    key: 'segment',
    type: 'select',
    label: '客户分层',
    placeholder: '请选择分层',
    optionsKey: 'segmentOptions'
  },
  {
    key: 'owner',
    type: 'text',
    label: '负责人',
    ariaLabel: '负责人',
    placeholder: '输入负责人'
  },
  {
    key: 'scheduledAt',
    type: 'datetime',
    label: '跟进时间',
    placeholder: '选择跟进时间',
    wrapperClass: 'table-time-field'
  }
]

export const userEditorFieldConfig = [
  {
    key: 'name',
    type: 'text',
    label: '用户姓名',
    ariaLabel: '用户姓名',
    placeholder: '输入用户姓名'
  },
  {
    key: 'phone',
    type: 'text',
    label: '手机号',
    ariaLabel: '手机号',
    placeholder: '输入手机号'
  },
  {
    key: 'email',
    type: 'text',
    label: '邮箱',
    ariaLabel: '邮箱',
    placeholder: '输入邮箱'
  },
  {
    key: 'role',
    type: 'select',
    label: '角色类型',
    placeholder: '请选择角色',
    optionsKey: 'roleOptions'
  },
  {
    key: 'department',
    type: 'select',
    label: '所属部门',
    placeholder: '请选择部门',
    optionsKey: 'departmentOptions'
  },
  {
    key: 'status',
    type: 'select',
    label: '账号状态',
    placeholder: '请选择状态',
    optionsKey: 'statusOptions'
  },
  {
    key: 'lastLoginAt',
    type: 'datetime',
    label: '最近登录时间',
    placeholder: '选择最近登录时间',
    wrapperClass: 'table-time-field'
  }
]
