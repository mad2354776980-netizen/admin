<template>
  <aside
    class="panel sidebar-panel"
    :class="{ 'is-mobile-drawer': mobileMode, 'is-mobile-open': mobileOpen }"
    aria-label="后台导航"
  >
    <section class="sidebar-block">
      <span class="panel-label">Navigation</span>
      <nav class="nav-list">
        <div v-for="group in groups" :key="group.label" class="nav-group">
          <button
            class="nav-item nav-parent"
            :class="{ 'is-open': isMenuOpen(group.label), 'is-active': isGroupActive(group) }"
            type="button"
            :aria-expanded="isMenuOpen(group.label)"
            @click="toggleMenu(group.label)"
          >
            <span>{{ group.label }}</span>
            <span class="nav-arrow" aria-hidden="true">›</span>
          </button>

          <div
            class="nav-children-wrap"
            :class="{ 'is-open': isMenuOpen(group.label) }"
            :aria-hidden="!isMenuOpen(group.label)"
          >
            <div class="nav-children">
              <button
                v-for="child in group.children"
                :key="child.label"
                class="nav-item nav-child"
                :class="{ 'is-active': child.label === activeLabel }"
                type="button"
                @click="handleSelect(child.label)"
              >
                <span>{{ child.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </section>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue'

/**
 * @typedef {{ label: string }} NavChild
 * @typedef {{ label: string, children: NavChild[] }} NavGroup
 */

const props = defineProps({
  groups: {
    type: Array,
    required: true
  },
  activeLabel: {
    type: String,
    required: true
  },
  mobileMode: {
    type: Boolean,
    default: false
  },
  mobileOpen: {
    type: Boolean,
    default: false
  },
  initialOpenMenus: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select', 'close-mobile'])

const STORAGE_KEY = 'admin-demo.sidebar.open-menus'

/** @type {import('vue').Ref<string[]>} */
const openMenus = ref(getInitialOpenMenus())

watch(openMenus, (value) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}, { deep: true })

function isMenuOpen(label) {
  return openMenus.value.indexOf(label) !== -1
}

function toggleMenu(label) {
  openMenus.value = isMenuOpen(label)
    ? openMenus.value.filter((item) => item !== label)
    : [...openMenus.value, label]
}

/**
 * @param {NavGroup} group
 */
function isGroupActive(group) {
  return group.children.some((child) => child.label === props.activeLabel)
}

function handleSelect(label) {
  emit('select', label)
  emit('close-mobile')
}

function getInitialOpenMenus() {
  const fallback = [...props.initialOpenMenus]

  if (typeof window === 'undefined') {
    return fallback
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY)
  if (!storedValue) {
    return fallback
  }

  try {
    const parsedValue = JSON.parse(storedValue)
    if (!Array.isArray(parsedValue)) {
      return fallback
    }

    const validLabels = props.groups.map((group) => group.label)
    const restoredMenus = parsedValue.filter((label) => (
      typeof label === 'string' && validLabels.indexOf(label) !== -1
    ))

    return restoredMenus.length > 0 ? restoredMenus : fallback
  } catch {
    return fallback
  }
}
</script>
