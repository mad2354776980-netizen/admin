<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="brand">
        <UiButton
          class="mobile-nav-toggle"
          icon
          :aria-expanded="isMobileNavOpen"
          aria-controls="sidebar-navigation"
          aria-label="打开导航菜单"
          title="打开导航菜单"
          @click="toggleMobileNav"
        >
          <span aria-hidden="true">{{ isMobileNavOpen ? '×' : '☰' }}</span>
        </UiButton>
      </div>
      <div class="topbar-actions">
        <UiButton variant="avatar" aria-label="个人资料" title="个人资料">
          <span class="avatar-image" aria-hidden="true">MX</span>
        </UiButton>
      </div>
    </header>

    <main class="workspace">
      <Transition name="mobile-nav-scrim">
        <button
          v-if="isMobileViewport && isMobileNavOpen"
          class="mobile-nav-scrim"
          type="button"
          aria-label="关闭导航"
          @click="closeMobileNav"
        ></button>
      </Transition>
      <SidebarNav
        id="sidebar-navigation"
        :groups="navGroups"
        :active-path="activePath"
        :mobile-mode="isMobileViewport"
        :mobile-open="isMobileNavOpen"
        :initial-open-menus="initialOpenMenus"
        @close-mobile="closeMobileNav"
        @select="selectNav"
      />

      <section class="route-content">
        <RouterView />
      </section>
    </main>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import SidebarNav from './components/SidebarNav.vue'
import UiButton from './components/UiButton.vue'
import { initialOpenMenus, navGroups } from './config/navigation'

const MOBILE_NAV_STORAGE_KEY = 'admin-demo.mobile-nav.open'
const isMobileNavOpen = ref(getInitialMobileNavOpen())
const isMobileViewport = ref(false)
const route = useRoute()
const router = useRouter()
const activePath = ref(route.path)

function toggleMobileNav() {
  isMobileNavOpen.value = !isMobileNavOpen.value
}

function closeMobileNav() {
  isMobileNavOpen.value = false
}

function selectNav(path) {
  router.push(path)
}

watch([isMobileNavOpen, isMobileViewport], ([isOpen, isMobile]) => {
  if (typeof document === 'undefined') {
    return
  }

  const overflowValue = isOpen && isMobile ? 'hidden' : ''
  document.documentElement.style.overflow = overflowValue
  document.body.style.overflow = overflowValue
})

watch(isMobileNavOpen, (isOpen) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(MOBILE_NAV_STORAGE_KEY, JSON.stringify(isOpen))
})

watch(
  () => route.path,
  (path) => {
    activePath.value = path
  },
  { immediate: true }
)

onMounted(() => {
  syncMobileViewport()
  window.addEventListener('resize', syncMobileViewport)
})

onBeforeUnmount(() => {
  if (typeof document === 'undefined') {
    return
  }

  window.removeEventListener('resize', syncMobileViewport)
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
})

function syncMobileViewport() {
  if (typeof window === 'undefined') {
    return
  }

  isMobileViewport.value = window.innerWidth <= 860
}

function getInitialMobileNavOpen() {
  if (typeof window === 'undefined') {
    return false
  }

  const storedValue = window.localStorage.getItem(MOBILE_NAV_STORAGE_KEY)
  if (!storedValue) {
    return false
  }

  try {
    return JSON.parse(storedValue) === true
  } catch {
    return false
  }
}
</script>
