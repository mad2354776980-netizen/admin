<template>
  <nav class="button-toolbar" :aria-label="ariaLabel">
    <UiButton :disabled="isPrevDisabled" @click="selectPreviousPage">
      {{ prevText }}
    </UiButton>
    <UiButton
      v-for="page in normalizedPages"
      :key="page"
      :variant="page === modelValue ? 'primary' : 'default'"
      @click="selectPage(page)"
    >
      {{ page }}
    </UiButton>
    <UiButton :disabled="isNextDisabled" @click="selectNextPage">
      {{ nextText }}
    </UiButton>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import UiButton from './UiButton.vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 1
  },
  pages: {
    type: Array,
    default() {
      return []
    }
  },
  totalPages: {
    type: Number,
    default: 0
  },
  ariaLabel: {
    type: String,
    default: '分页导航'
  },
  prevText: {
    type: String,
    default: '上一页'
  },
  nextText: {
    type: String,
    default: '下一页'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const normalizedPages = computed(() => {
  if (props.pages.length > 0) {
    return props.pages
  }

  return Array.from({ length: Math.max(props.totalPages, 0) }, (_, index) => index + 1)
})

const firstPage = computed(() => normalizedPages.value[0] || 1)
const lastPage = computed(() => normalizedPages.value[normalizedPages.value.length - 1] || 1)
const isPrevDisabled = computed(() => normalizedPages.value.length === 0 || props.modelValue <= firstPage.value)
const isNextDisabled = computed(() => normalizedPages.value.length === 0 || props.modelValue >= lastPage.value)

function updatePage(page) {
  if (page === props.modelValue || normalizedPages.value.indexOf(page) === -1) {
    return
  }

  emit('update:modelValue', page)
  emit('change', page)
}

function selectPage(page) {
  updatePage(page)
}

function selectPreviousPage() {
  if (isPrevDisabled.value) {
    return
  }

  updatePage(props.modelValue - 1)
}

function selectNextPage() {
  if (isNextDisabled.value) {
    return
  }

  updatePage(props.modelValue + 1)
}
</script>
