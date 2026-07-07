<template>
  <Teleport to="body">
    <div class="ui-message-host" aria-live="polite" aria-atomic="true">
      <TransitionGroup name="ui-message">
        <div
          v-for="item in messageState.items"
          :key="item.id"
          class="ui-message"
          :class="`is-${item.type}`"
          :role="item.type === 'error' ? 'alert' : 'status'"
        >
          <span class="ui-message-icon" aria-hidden="true">{{ iconMap[item.type] || '•' }}</span>
          <span class="ui-message-text">{{ item.text }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { messageState } from './uiMessage'

const iconMap = {
  success: '✓',
  error: '!'
}
</script>
