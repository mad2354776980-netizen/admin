<template>
  <Transition name="table-editor-modal">
    <div
      v-if="visible"
      class="table-editor-modal table-confirm-modal"
      role="dialog"
      aria-modal="true"
      :aria-label="ariaLabel"
    >
      <div class="table-editor-head">
        <div class="table-editor-copy">
          <strong>{{ title }}</strong>
          <span>{{ subtitle }}</span>
        </div>
        <UiButton class="table-editor-close" icon :aria-label="closeAriaLabel" @click="$emit('close')">
          ×
        </UiButton>
      </div>

      <div class="table-confirm-body">
        <p>{{ description }}</p>
        <dl v-if="$slots.meta" class="table-confirm-meta">
          <slot name="meta"></slot>
        </dl>
      </div>

      <div class="table-editor-actions">
        <UiButton :disabled="confirmLoading" @click="$emit('cancel')">{{ cancelText }}</UiButton>
        <UiButton variant="primary" :loading="confirmLoading" @click="$emit('confirm')">{{ confirmText }}</UiButton>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import UiButton from './UiButton.vue'

defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  ariaLabel: {
    type: String,
    default: '确认弹窗'
  },
  title: {
    type: String,
    default: '确认操作'
  },
  subtitle: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  closeAriaLabel: {
    type: String,
    default: '关闭确认弹窗'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  confirmText: {
    type: String,
    default: '确认'
  },
  confirmLoading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'cancel', 'confirm'])
</script>
