export const orderFilterFields = [
  {
    key: 'keyword',
    type: 'search',
    label: '搜索订单或客户',
    ariaLabel: '搜索订单或客户',
    placeholder: '搜索订单号、客户、负责人'
  },
  {
    key: 'status',
    type: 'select',
    label: '状态筛选',
    placeholder: '请选择状态',
    options: ['全部', '待处理', '进行中', '已完成', '风险'],
    loadingText: '正在加载状态选项...'
  },
  {
    key: 'channel',
    type: 'select',
    label: '渠道来源',
    placeholder: '请选择渠道',
    options: ['全部', 'App / 企业版', 'App / 新签', 'Web / 新客', 'Web / 老客加购', 'API / 自动续费', 'API / 自动扣费']
  },
  {
    key: 'ownerKeyword',
    type: 'search',
    label: '负责人',
    ariaLabel: '负责人',
    placeholder: '输入负责人',
    fieldClass: 'table-search-field-compact'
  },
  {
    key: 'startDate',
    type: 'datetime',
    label: '开始时间',
    placeholder: '选择开始时间',
    fieldClass: 'table-time-field'
  },
  {
    key: 'endDate',
    type: 'datetime',
    label: '结束时间',
    placeholder: '选择结束时间',
    fieldClass: 'table-time-field'
  },
  {
    key: 'segments',
    type: 'multi-select',
    label: '客户分层',
    placeholder: '请选择分层',
    options: ['高价值客户', '重点培育', '成熟客户', '续费客户', '风险观察'],
    loadingText: '正在加载分层选项...',
    fieldClass: 'table-chip-field'
  }
]

export const userFilterFields = [
  {
    key: 'keyword',
    type: 'search',
    label: '搜索用户',
    ariaLabel: '搜索用户',
    placeholder: '搜索姓名、工号、手机、邮箱'
  },
  {
    key: 'status',
    type: 'select',
    label: '账号状态',
    placeholder: '请选择状态',
    options: ['全部', '正常', '待激活', '冻结']
  },
  {
    key: 'role',
    type: 'select',
    label: '角色类型',
    placeholder: '请选择角色',
    options: ['全部', '运营管理员', '客服主管', '财务专员', '内容审核员', '超级管理员']
  },
  {
    key: 'department',
    type: 'select',
    label: '所属部门',
    placeholder: '请选择部门',
    options: ['全部', '运营中心', '客户成功', '财务组', '内容中心', '技术支持']
  },
  {
    key: 'startDate',
    type: 'datetime',
    label: '登录开始时间',
    placeholder: '选择开始时间',
    fieldClass: 'table-time-field'
  },
  {
    key: 'endDate',
    type: 'datetime',
    label: '登录结束时间',
    placeholder: '选择结束时间',
    fieldClass: 'table-time-field'
  }
]
