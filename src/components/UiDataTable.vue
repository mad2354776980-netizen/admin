<template>
  <section class="panel content-panel" :aria-label="ariaLabel">
    <div class="table-head">
      <span class="table-summary-text">{{ summaryText }}</span>
      <slot name="head-action"></slot>
    </div>

    <div class="table-demo-scroll">
      <div class="table-demo-shell">
        <slot v-if="hasGrid" name="grid"></slot>
        <template v-else>
          <slot name="header"></slot>
          <slot name="rows"></slot>
        </template>

        <div v-if="isEmpty" class="empty-state">
          {{ emptyText }}
        </div>
      </div>
    </div>

    <div v-if="hasFooter" class="table-demo-footer">
      <slot name="footer"></slot>
    </div>
  </section>
</template>

<script setup>
import { computed, useSlots } from 'vue'

const props = defineProps({
  ariaLabel: {
    type: String,
    default: '通用数据表格'
  },
  summaryText: {
    type: String,
    default: ''
  },
  isEmpty: {
    type: Boolean,
    default: false
  },
  emptyText: {
    type: String,
    default: '暂无数据'
  }
})

const slots = useSlots()

const hasFooter = computed(() => Boolean(slots.footer))
const hasGrid = computed(() => Boolean(slots.grid))
</script>
