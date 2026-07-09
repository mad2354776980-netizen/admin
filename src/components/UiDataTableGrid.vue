<template>
  <div class="table-demo-grid table-header">
    <span
      v-for="column in columns"
      :key="`header-${column.key}`"
      :class="column.headerClass"
    >
      <slot :name="`header-${column.key}`" :column="column">
        {{ column.label }}
      </slot>
    </span>
  </div>

  <div
    v-for="row in rows"
    :key="row[rowKey]"
    class="table-demo-grid"
    :class="{ 'is-selected': isSelected(row) }"
  >
    <span
      v-for="column in columns"
      :key="`${row[rowKey]}-${column.key}`"
      :class="column.cellClass"
      :data-label="column.dataLabel || column.label"
    >
      <slot :name="`cell-${column.key}`" :row="row" :column="column">
        {{ row[column.key] }}
      </slot>
    </span>
  </div>
</template>

<script setup>
const props = defineProps({
  columns: {
    type: Array,
    default: () => []
  },
  rows: {
    type: Array,
    default: () => []
  },
  rowKey: {
    type: String,
    default: 'id'
  },
  selectedRowIds: {
    type: Array,
    default: () => []
  }
})

function isSelected(row) {
  return props.selectedRowIds.includes(row[props.rowKey])
}
</script>
