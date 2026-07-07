<template>
  <RouterView v-if="isAuthRoute" />
  <div v-else class="app-frame">
    <header class="topbar">
      <div class="topbar-inner">
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
          <HeaderLogo :variant="activeLogo" :compact="isMobileViewport" />
        </div>
        <div class="topbar-actions">
          <div
            ref="themeMenuRef"
            class="theme-switcher"
            :class="{ 'is-expanded': isThemeMenuOpen }"
          >
            <UiButton
              class="topbar-icon-button"
              icon
              :aria-expanded="isThemeMenuOpen"
              aria-haspopup="menu"
              aria-label="主题设置"
              title="主题设置"
              @click="toggleThemeMenu"
            >
              <span class="theme-gear" aria-hidden="true">⚙</span>
            </UiButton>

            <Transition name="theme-popover">
              <div
                v-if="isThemeMenuOpen"
                class="theme-popover"
                role="menu"
                aria-label="主题设置"
              >
                <div class="theme-popover-section">
                  <span class="theme-popover-label">标识预览</span>
                  <div class="logo-option-grid">
                    <button
                      v-for="logo in logos"
                      :key="logo.value"
                      class="logo-option"
                      :class="{ 'is-active': activeLogo === logo.value }"
                      type="button"
                      @click="selectLogo(logo.value)"
                    >
                      <HeaderLogo :variant="logo.value" preview />
                    </button>
                  </div>
                </div>
                <div class="theme-popover-divider"></div>
                <div class="theme-popover-section">
                  <span class="theme-popover-label">主题方案</span>
                </div>
                <button
                  v-for="theme in themes"
                  :key="theme.value"
                  class="theme-option"
                  :class="{ 'is-active': activeTheme === theme.value }"
                  type="button"
                  role="menuitemradio"
                  :aria-checked="String(activeTheme === theme.value)"
                  @click="selectTheme(theme.value)"
                >
                  <span class="theme-option-swatch" :class="`is-${theme.value}`" aria-hidden="true"></span>
                  <span class="theme-option-copy">
                    <strong>{{ theme.label }}</strong>
                    <small>{{ theme.description }}</small>
                  </span>
                </button>
              </div>
            </Transition>
          </div>
          <div
            ref="profileMenuRef"
            class="profile-card"
            :class="{ 'is-expanded': isProfileMenuOpen }"
          >
            <UiButton
              variant="avatar"
              :aria-expanded="isProfileMenuOpen"
              aria-haspopup="menu"
              aria-label="个人资料"
              title="个人资料"
              @click="toggleProfileMenu"
            >
              <img class="avatar-image" :src="profileAvatar" alt="奶绿头像">
            </UiButton>
            <button
              class="profile-summary"
              type="button"
              :aria-expanded="isProfileMenuOpen"
              aria-haspopup="menu"
              aria-label="打开个人资料"
              @click="toggleProfileMenu"
            >
              <strong>奶绿</strong>
              <span>运营管理员</span>
            </button>
            <div class="profile-popover" role="menu" aria-label="个人资料面板">
              <div class="profile-popover-hero">
                <img class="avatar-image is-large" :src="profileAvatar" alt="奶绿头像">
                <div class="profile-popover-copy is-centered">
                  <strong>奶绿</strong>
                  <span>运营管理员</span>
                </div>
              </div>
              <dl class="profile-popover-meta">
                <div>
                  <dt>角色</dt>
                  <dd>Super Admin</dd>
                </div>
                <div>
                  <dt>最后登录</dt>
                  <dd>今天 19:42</dd>
                </div>
              </dl>
              <button class="profile-logout" type="button" @click="handleLogout">退出登录</button>
            </div>
          </div>
        </div>
      </div>
    </header>
    <div class="app-shell">
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
  </div>
  <UiMessageHost />
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import profileAvatar from './assets/profile-avatar.png'
import HeaderLogo from './components/HeaderLogo.vue'
import SidebarNav from './components/SidebarNav.vue'
import UiButton from './components/UiButton.vue'
import UiMessageHost from './components/UiMessageHost.vue'
import { initialOpenMenus, navGroups } from './config/navigation'

const MOBILE_NAV_STORAGE_KEY = 'admin-demo.mobile-nav.open'
const LOGO_STORAGE_KEY = 'admin-demo.logo'
const THEME_STORAGE_KEY = 'admin-demo.theme'
const logos = [
  { value: 'geom', label: '几何 M' },
  { value: 'grid', label: '栅格 M' },
  { value: 'shield', label: '盾牌数据' },
  { value: 'compass', label: '指南针' }
]
const themes = [
  { value: 'warm', label: '暖沙', description: '当前默认主题' },
  { value: 'graphite', label: '石墨', description: '更冷静的深灰基调' },
  { value: 'grove', label: '松林', description: '偏绿色的业务工作台' },
  { value: 'mist', label: '雾青', description: '更轻的灰青色调' },
  { value: 'ember', label: '余烬', description: '偏铜红的深暖质感' },
  { value: 'ocean', label: '海雾', description: '更清爽的蓝灰工作台' }
]

const isMobileNavOpen = ref(getInitialMobileNavOpen())
const isMobileViewport = ref(false)
const isThemeMenuOpen = ref(false)
const isProfileMenuOpen = ref(false)
const route = useRoute()
const router = useRouter()
const activePath = ref(route.path)
// noinspection JSUnresolvedReference
const isAuthRoute = computed(() => route.meta.layout === 'auth')
/** @type {import('vue').Ref<string>} */
const activeLogo = ref(getInitialLogo())
/** @type {import('vue').Ref<string>} */
const activeTheme = ref(getInitialTheme())
/** @type {import('vue').Ref<HTMLElement | null>} */
const themeMenuRef = ref(null)
/** @type {import('vue').Ref<HTMLElement | null>} */
const profileMenuRef = ref(null)

function toggleMobileNav() {
  isMobileNavOpen.value = !isMobileNavOpen.value
}

function closeMobileNav() {
  isMobileNavOpen.value = false
}

function selectNav(path) {
  router.push(path)
}

function handleLogout() {
  closeProfileMenu()
  router.push('/login')
}

function toggleThemeMenu() {
  isThemeMenuOpen.value = !isThemeMenuOpen.value
}

function closeThemeMenu() {
  isThemeMenuOpen.value = false
}

function toggleProfileMenu() {
  isProfileMenuOpen.value = !isProfileMenuOpen.value
}

function closeProfileMenu() {
  isProfileMenuOpen.value = false
}

function selectTheme(theme) {
  activeTheme.value = theme
  closeThemeMenu()
}

function selectLogo(logo) {
  activeLogo.value = logo
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

watch(activeTheme, (theme) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }

  document.documentElement.dataset.theme = theme
  window.localStorage.setItem(THEME_STORAGE_KEY, theme)
}, { immediate: true })

watch(activeLogo, (logo) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(LOGO_STORAGE_KEY, logo)
}, { immediate: true })

watch(
  () => route.path,
  (path) => {
    activePath.value = path
    closeThemeMenu()
    closeProfileMenu()
  },
  { immediate: true }
)

onMounted(() => {
  syncMobileViewport()
  document.documentElement.dataset.theme = activeTheme.value
  window.addEventListener('resize', syncMobileViewport)
  document.addEventListener('pointerdown', handlePointerDown)
})

onBeforeUnmount(() => {
  if (typeof document === 'undefined') {
    return
  }

  window.removeEventListener('resize', syncMobileViewport)
  document.removeEventListener('pointerdown', handlePointerDown)
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

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'warm'
  }

  const storedValue = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (!storedValue) {
    return 'warm'
  }

  return themes.some((theme) => theme.value === storedValue) ? storedValue : 'warm'
}

function getInitialLogo() {
  if (typeof window === 'undefined') {
    return 'geom'
  }

  const storedValue = window.localStorage.getItem(LOGO_STORAGE_KEY)
  if (!storedValue) {
    return 'geom'
  }

  return logos.some((logo) => logo.value === storedValue) ? storedValue : 'geom'
}

function handlePointerDown(event) {
  /** @type {Node | null} */
  const target = event.target instanceof Node ? event.target : null

  if (themeMenuRef.value && target && !themeMenuRef.value.contains(target)) {
    closeThemeMenu()
  }

  if (profileMenuRef.value && target && !profileMenuRef.value.contains(target)) {
    closeProfileMenu()
  }
}
</script>
