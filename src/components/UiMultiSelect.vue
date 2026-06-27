<template>
  <div ref="rootRef" class="ui-select ui-multi-select">
    <button
      class="ui-select-trigger"
      :class="{ 'is-open': isOpen }"
      type="button"
      :aria-expanded="String(isOpen)"
      aria-haspopup="listbox"
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

    <Transition name="ui-select-dropdown">
      <div
        v-if="isOpen"
        class="ui-select-menu"
        role="listbox"
        :aria-label="label"
        aria-multiselectable="true"
      >
        <button
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
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

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
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const rootRef = ref(null)

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

function toggleOpen() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function isSelected(value) {
  return props.modelValue.includes(value)
}

function toggleOption(value) {
  if (isSelected(value)) {
    emit('update:modelValue', props.modelValue.filter((item) => item !== value))
    return
  }

  emit('update:modelValue', [...props.modelValue, value])
}

function handlePointerDown(event) {
  if (!rootRef.value || rootRef.value.contains(event.target)) {
    return
  }

  close()
}

onMounted(() => {
  document.addEventListener('pointerdown', handlePointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handlePointerDown)
})
</script>
