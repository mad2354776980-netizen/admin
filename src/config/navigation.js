export const navGroups = [
  {
    label: '工作台',
    children: [
      { label: '运营概览', path: '/' },
      { label: '实时监控', path: '/workspace/live' },
      { label: '处理队列', path: '/workspace/queue' }
    ]
  },
  {
    label: '业务管理',
    children: [
      { label: '订单管理', path: '/business/orders' },
      { label: '客户分层', path: '/business/segments' },
      { label: '支付记录', path: '/business/payments' }
    ]
  },
  {
    label: '内容中心',
    children: [
      { label: '内容审核', path: '/content/review' },
      { label: '文章管理', path: '/content/posts' },
      { label: '标签配置', path: '/content/tags' }
    ]
  },
  {
    label: '通用组件',
    children: [
      { label: '按钮', path: '/components/buttons' },
      { label: '数据表格', path: '/components/tables' },
      { label: '表单控件', path: '/components/forms' },
      { label: '弹层反馈', path: '/components/feedback' }
    ]
  },
  {
    label: '系统',
    children: [
      { label: '成员权限', path: '/system/access' },
      { label: '系统设置', path: '/system/settings' },
      { label: '操作日志', path: '/system/audit' }
    ]
  }
]

export const initialOpenMenus = ['工作台', '业务管理']
