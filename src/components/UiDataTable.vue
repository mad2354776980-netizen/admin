<template>
  <section class="panel content-panel" :aria-label="ariaLabel">
    <div v-if="hasHead" class="table-head">
      <div v-if="hasSummary" class="table-head-summary">
        <slot name="summary">
          <span class="table-summary-text">{{ summaryText }}</span>
        </slot>
      </div>

      <div v-if="hasActions" class="table-head-actions">
        <slot name="actions"></slot>
      </div>
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

    <div v-if="hasPagination" class="table-demo-footer">
      <slot name="pagination"></slot>
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

const hasSummary = computed(() => Boolean(props.summaryText) || Boolean(slots.summary))
const hasActions = computed(() => Boolean(slots.actions))
const hasHead = computed(() => hasSummary.value || hasActions.value)
const hasPagination = computed(() => Boolean(slots.pagination))
const hasGrid = computed(() => Boolean(slots.grid))
</script>
