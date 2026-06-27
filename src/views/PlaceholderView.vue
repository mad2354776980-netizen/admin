<template>
  <section class="panel content-panel" aria-label="页面占位">
    <div class="content-head">
      <div class="content-copy">
        <strong>{{ title }}</strong>
        <span>该页面作为当前后台导航的功能占位，用于后续补充真实业务内容。</span>
      </div>
    </div>

    <div class="empty-state">
      当前只为“按钮”菜单实现了完整展示页，其余菜单已接入路由并可继续扩展。
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => route.meta.navLabel || '页面')
</script>
