<template>
  <template v-for="field in fields" :key="field.key">
    <div
      v-if="field.type === 'search'"
      class="table-search-field"
      :class="field.fieldClass"
    >
      <span class="table-select-label">{{ field.label }}</span>
      <div class="search-bar" role="search" :aria-label="field.ariaLabel || field.label">
        <input
          class="search-input"
          type="search"
          :value="normalizedModel[field.key] || ''"
          :placeholder="field.placeholder"
          @input="updateTextField(field.key, $event)"
        >
      </div>
    </div>

    <label
      v-else
      class="table-select-field"
      :class="field.fieldClass"
    >
      <span class="table-select-label">{{ field.label }}</span>

      <UiSelect
        v-if="field.type === 'select'"
        :model-value="normalizedModel[field.key]"
        :options="field.options || []"
        :label="field.label"
        :placeholder="field.placeholder"
        :loading="Boolean(field.loading)"
        :loading-text="field.loadingText || ''"
        @update:model-value="updateField(field.key, $event)"
      />

      <UiMultiSelect
        v-else-if="field.type === 'multi-select'"
        :model-value="normalizedModel[field.key] || []"
        :options="field.options || []"
        :label="field.label"
        :placeholder="field.placeholder"
        :loading="Boolean(field.loading)"
        :loading-text="field.loadingText || ''"
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
import UiMultiSelect from './UiMultiSelect.vue'
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
