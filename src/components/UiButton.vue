<template>
  <button
    v-bind="$attrs"
    :class="buttonClass"
    :type="type"
  >
    <slot />
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
  }
})

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

  return classes
})
</script>
