<template>
  <Transition name="table-editor-modal">
    <div
      v-if="visible"
      class="table-editor-modal"
      role="dialog"
      aria-modal="true"
      :aria-label="ariaLabel"
    >
      <div class="table-editor-head">
        <div class="table-editor-copy">
          <strong>{{ title }}</strong>
          <span>{{ subtitle }}</span>
        </div>
        <UiButton class="table-editor-close" icon :disabled="disableClose" :aria-label="closeAriaLabel" @click="$emit('close')">
          ×
        </UiButton>
      </div>

      <div class="table-editor-summary">
        <slot name="summary"></slot>
      </div>

      <div class="table-editor-form">
        <slot></slot>
      </div>

      <div class="table-editor-actions">
        <UiButton :disabled="disableClose" @click="$emit('cancel')">{{ cancelText }}</UiButton>
        <UiButton variant="primary" :loading="saveLoading" @click="$emit('save')">{{ saveText }}</UiButton>
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
    default: '编辑弹窗'
  },
  title: {
    type: String,
    default: '编辑'
  },
  subtitle: {
    type: String,
    default: ''
  },
  closeAriaLabel: {
    type: String,
    default: '关闭编辑弹窗'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  saveText: {
    type: String,
    default: '保存'
  },
  saveLoading: {
    type: Boolean,
    default: false
  },
  disableClose: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'cancel', 'save'])
</script>
