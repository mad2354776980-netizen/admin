<template>
  <div ref="rootRef" class="ui-select">
    <button
      ref="triggerRef"
      class="ui-select-trigger"
      :class="{ 'is-open': isOpen }"
      type="button"
      :aria-expanded="String(isOpen)"
      aria-haspopup="listbox"
      @click="toggleOpen"
      @keydown.esc.prevent="close"
    >
      <span class="ui-select-value">{{ selectedLabel }}</span>
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
        >
          <button
            v-for="option in normalizedOptions"
            :key="option.value"
            class="ui-select-option"
            :class="{ 'is-selected': option.value === modelValue }"
            type="button"
            role="option"
            :aria-selected="String(option.value === modelValue)"
            @click="selectOption(option.value)"
          >
            <span>{{ option.label }}</span>
            <span v-if="option.value === modelValue" class="ui-select-check" aria-hidden="true">•</span>
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
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: '下拉选项'
  },
  placeholder: {
    type: String,
    default: '请选择'
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

const selectedLabel = computed(() => {
  const selectedOption = normalizedOptions.value.find((option) => option.value === props.modelValue)
  return selectedOption ? selectedOption.label : props.placeholder
})

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

function selectOption(value) {
  emit('update:modelValue', value)
  close()
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
