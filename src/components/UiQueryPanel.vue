<template>
  <section class="panel content-panel" :aria-label="ariaLabel">
    <div class="content-head">
      <div class="content-copy">
        <strong>{{ title }}</strong>
        <span>{{ description }}</span>
      </div>
    </div>

    <div class="table-filter-bar" :aria-label="filterAriaLabel">
      <slot></slot>
    </div>
  </section>
</template>

<script setup>
defineProps({
  ariaLabel: {
    type: String,
    default: '查询区域'
  },
  filterAriaLabel: {
    type: String,
    default: '数据筛选'
  },
  title: {
    type: String,
    default: '查询面板'
  },
  description: {
    type: String,
    default: ''
  }
})
</script>
