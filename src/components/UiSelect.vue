<template>
  <div ref="rootRef" class="ui-select">
    <button
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

    <Transition name="ui-select-dropdown">
      <div
        v-if="isOpen"
        class="ui-select-menu"
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
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

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

const selectedLabel = computed(() => {
  const selectedOption = normalizedOptions.value.find((option) => option.value === props.modelValue)
  return selectedOption ? selectedOption.label : props.placeholder
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
