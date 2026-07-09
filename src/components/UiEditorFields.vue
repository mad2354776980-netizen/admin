<template>
  <template v-for="field in fields" :key="field.key">
    <label class="table-select-field" :class="field.wrapperClass">
      <span class="table-select-label">{{ field.label }}</span>

      <span
        v-if="field.type === 'text'"
        class="search-bar"
        role="group"
        :aria-label="field.ariaLabel || field.label"
      >
        <input
          class="search-input"
          type="text"
          :value="normalizedModel[field.key] || ''"
          :placeholder="field.placeholder"
          @input="updateTextField(field.key, $event)"
        >
      </span>

      <UiSelect
        v-else-if="field.type === 'select'"
        :model-value="normalizedModel[field.key]"
        :options="field.options || []"
        :label="field.label"
        :placeholder="field.placeholder"
        @update:model-value="updateField(field.key, $event)"
      />

      <UiDateTimePicker
        v-else-if="field.type === 'datetime'"
        :model-value="normalizedModel[field.key]"
        :placeholder="field.placeholder"
        @update:model-value="updateField(field.key, $event)"
      />
    </label>
  </template>
</template>

<script setup>
import { computed } from 'vue'
import UiDateTimePicker from './UiDateTimePicker.vue'
import UiSelect from './UiSelect.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default() {
      return {}
    }
  },
  fields: {
    type: Array,
    default() {
      return []
    }
  }
})

const emit = defineEmits(['update:modelValue'])

const normalizedModel = computed(() => props.modelValue || {})

function updateField(key, value) {
  emit('update:modelValue', {
    ...normalizedModel.value,
    [key]: value
  })
}

function updateTextField(key, event) {
  const nextValue = event && event.target ? String(event.target.value).trim() : ''
  updateField(key, nextValue)
}
</script>
