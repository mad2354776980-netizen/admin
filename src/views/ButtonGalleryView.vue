<template>
  <section class="panel content-panel" aria-label="按钮组件展示">
    <div class="content-head">
      <div class="content-copy">
        <strong>按钮</strong>
        <span>统一展示当前后台使用中的通用按钮形态与状态。</span>
      </div>
    </div>

    <div class="component-showcase">
      <section class="showcase-section">
        <div class="section-head">
          <strong>基础按钮</strong>
          <span>Default states</span>
        </div>
        <div class="button-row">
          <UiButton>默认按钮</UiButton>
          <UiButton variant="primary">主按钮</UiButton>
          <UiButton disabled>禁用按钮</UiButton>
          <UiButton variant="primary" disabled>禁用主按钮</UiButton>
        </div>
      </section>

      <section class="showcase-section">
        <div class="section-head">
          <strong>图标与头像</strong>
          <span>Compact actions</span>
        </div>
        <div class="button-row">
          <UiButton icon aria-label="刷新">
            <span aria-hidden="true">↻</span>
          </UiButton>
          <UiButton icon class="mobile-nav-toggle" aria-label="菜单">
            <span aria-hidden="true">☰</span>
          </UiButton>
          <UiButton variant="avatar" aria-label="个人资料">
            <span class="avatar-image" aria-hidden="true">MX</span>
          </UiButton>
        </div>
      </section>

      <section class="showcase-section">
        <div class="section-head">
          <strong>组合示例</strong>
          <span>Toolbar samples</span>
        </div>
        <div class="button-toolbar">
          <UiButton>取消</UiButton>
          <UiButton>保存草稿</UiButton>
          <UiButton variant="primary">发布变更</UiButton>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import UiButton from '../components/UiButton.vue'
</script>
