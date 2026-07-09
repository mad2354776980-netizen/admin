<template>
  <section class="panel content-panel" :aria-label="ariaLabel">
    <div class="content-head">
      <div class="content-copy">
        <strong>{{ title }}</strong>
        <span>{{ description }}</span>
      </div>
    </div>

    <div class="table-filter-bar" :aria-label="filterAriaLabel">
      <slot name="fields"></slot>

      <div v-if="hasActions" class="table-filter-actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, useSlots } from 'vue'

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

const slots = useSlots()
const hasActions = computed(() => Boolean(slots.actions))
</script>
