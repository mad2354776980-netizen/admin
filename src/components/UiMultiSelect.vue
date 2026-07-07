<template>
  <div ref="rootRef" class="ui-select ui-multi-select">
    <button
      ref="triggerRef"
      class="ui-select-trigger"
      :class="{ 'is-open': isOpen, 'is-loading': loading }"
      type="button"
      :aria-expanded="String(isOpen)"
      aria-haspopup="listbox"
      :aria-busy="String(loading)"
      @click="toggleOpen"
      @keydown.esc.prevent="close"
    >
      <span v-if="selectedOptions.length === 0" class="ui-select-value is-placeholder">{{ placeholder }}</span>
      <span v-else class="ui-multi-select-tags">
        <span
          v-for="option in selectedOptions"
          :key="option.value"
          class="ui-multi-select-tag"
        >
          {{ option.label }}
        </span>
      </span>
      <span class="ui-select-arrow" aria-hidden="true"></span>
    </button>

    <Teleport to="body">
      <Transition name="ui-select-dropdown">
        <div
          v-if="isOpen"
          ref="menuRef"
          class="ui-select-menu"
          :style="menuStyle"
          role="listbox"
          :aria-label="label"
          aria-multiselectable="true"
        >
          <div v-if="loading" class="ui-select-loading" role="status" aria-live="polite">
            <span class="ui-select-loading-spinner" aria-hidden="true"></span>
            <span>{{ loadingText }}</span>
          </div>
          <button
            v-else
            v-for="option in normalizedOptions"
            :key="option.value"
            class="ui-select-option"
            :class="{ 'is-selected': isSelected(option.value) }"
            type="button"
            role="option"
            :aria-selected="String(isSelected(option.value))"
            @click="toggleOption(option.value)"
          >
            <span>{{ option.label }}</span>
            <span class="ui-multi-select-box" :class="{ 'is-selected': isSelected(option.value) }" aria-hidden="true"></span>
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  options: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: '多选下拉'
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: '加载中...'
  },
  menuMaxHeight: {
    type: [Number, String],
    default: 240
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const rootRef = ref(null)
const triggerRef = ref(null)
const menuRef = ref(null)
const menuPosition = ref({
  top: 0,
  left: 0,
  width: 0,
  maxHeight: '240px'
})

const normalizedOptions = computed(() => props.options.map((option) => {
  if (typeof option === 'string') {
    return {
      label: option,
      value: option
    }
  }

  return option
}))

const selectedOptions = computed(() => normalizedOptions.value.filter((option) => props.modelValue.includes(option.value)))

const menuStyle = computed(() => {
  const maxHeightValue = typeof props.menuMaxHeight === 'number'
    ? `${props.menuMaxHeight}px`
    : String(props.menuMaxHeight)

  return {
    top: `${menuPosition.value.top}px`,
    left: `${menuPosition.value.left}px`,
    width: `${menuPosition.value.width}px`,
    maxHeight: menuPosition.value.maxHeight || maxHeightValue
  }
})

function toggleOpen() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function updateMenuPosition() {
  if (!isOpen.value || !triggerRef.value || typeof window === 'undefined') {
    return
  }

  const rect = triggerRef.value.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const offset = 8
  const fallbackMaxHeight = typeof props.menuMaxHeight === 'number'
    ? props.menuMaxHeight
    : Number.parseInt(String(props.menuMaxHeight), 10) || 240
  const availableHeight = Math.max(120, viewportHeight - rect.bottom - 16)

  menuPosition.value = {
    top: rect.bottom + offset,
    left: rect.left,
    width: rect.width,
    maxHeight: `${Math.min(fallbackMaxHeight, availableHeight)}px`
  }
}

function isSelected(value) {
  return props.modelValue.includes(value)
}

function toggleOption(value) {
  if (props.loading) {
    return
  }

  if (isSelected(value)) {
    emit('update:modelValue', props.modelValue.filter((item) => item !== value))
    return
  }

  emit('update:modelValue', [...props.modelValue, value])
}

function handlePointerDown(event) {
  // noinspection JSUnresolvedReference
  if (!rootRef.value || rootRef.value.contains(event.target)) {
    return
  }

  if (menuRef.value && menuRef.value.contains(event.target)) {
    return
  }

  close()
}

function handleViewportChange() {
  if (!isOpen.value) {
    return
  }

  updateMenuPosition()
}

watch(isOpen, (nextValue) => {
  if (!nextValue) {
    return
  }

  nextTick(() => {
    updateMenuPosition()
  })
})

onMounted(() => {
  document.addEventListener('pointerdown', handlePointerDown)
  window.addEventListener('resize', handleViewportChange)
  window.addEventListener('scroll', handleViewportChange, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handlePointerDown)
  window.removeEventListener('resize', handleViewportChange)
  window.removeEventListener('scroll', handleViewportChange, true)
})
</script>
