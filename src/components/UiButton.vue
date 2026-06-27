<template>
  <button
    v-bind="$attrs"
    :class="buttonClass"
    :disabled="isDisabled"
    :type="type"
  >
    <span v-if="loading" class="ui-button-spinner" aria-hidden="true"></span>
    <span class="ui-button-content" :class="{ 'is-loading': loading }">
      <slot />
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  type: {
    type: String,
    default: 'button'
  },
  variant: {
    type: String,
    default: 'ghost'
  },
  icon: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const isDisabled = computed(() => props.disabled || props.loading)

const buttonClass = computed(() => {
  const classes = ['ui-button']

  if (props.variant === 'primary') {
    classes.push('primary-button')
  } else if (props.variant === 'avatar') {
    classes.push('avatar-button')
  } else {
    classes.push('ghost-button')
  }

  if (props.icon) {
    classes.push('icon-button')
  }

  if (props.loading) {
    classes.push('is-loading')
  }

  return classes
})
</script>
