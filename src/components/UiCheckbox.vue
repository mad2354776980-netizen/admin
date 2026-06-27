<template>
  <button
    class="ui-checkbox"
    :class="{
      'is-checked': modelValue,
      'is-indeterminate': indeterminate
    }"
    type="button"
    role="checkbox"
    :aria-checked="indeterminate ? 'mixed' : String(modelValue)"
    @click="toggle"
  >
    <span class="ui-checkbox-box" aria-hidden="true">
      <svg v-if="indeterminate" class="ui-checkbox-mark is-indeterminate" viewBox="0 0 10 10" fill="none">
        <path d="M2 5H8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
      <svg v-else-if="modelValue" class="ui-checkbox-mark" viewBox="0 0 10 10" fill="none">
        <path d="M2 5.2L4.2 7.4L8 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
    <span v-if="$slots.default" class="ui-checkbox-label">
      <slot />
    </span>
  </button>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  indeterminate: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

function toggle() {
  emit('update:modelValue', !props.modelValue)
}
</script>
