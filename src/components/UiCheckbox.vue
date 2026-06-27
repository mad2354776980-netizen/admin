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
      <span v-if="indeterminate" class="ui-checkbox-mark is-indeterminate"></span>
      <span v-else-if="modelValue" class="ui-checkbox-mark"></span>
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
