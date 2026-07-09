import { onBeforeUnmount, watch } from 'vue'

const blockedScrollKeys = [' ', 'PageUp', 'PageDown', 'Home', 'End']
const scrollableSelector = '.table-editor-form, .ui-select-menu, .dp--menu-wrapper, .dp--menu, .dp__menu, .dp__instance_calendar'

export function useDialogScrollLock(isDialogOpen, onEscape) {
  let touchStartY = 0

  function getScrollableEditorContainer(target) {
    if (!(target instanceof Element)) {
      return null
    }

    return target.closest(scrollableSelector)
  }

  function canScrollEditor(container, deltaY) {
    if (!container || deltaY === 0) {
      return false
    }

    const maxScrollTop = container.scrollHeight - container.clientHeight
    if (maxScrollTop <= 0) {
      return false
    }

    if (deltaY < 0) {
      return container.scrollTop > 0
    }

    return container.scrollTop < maxScrollTop
  }

  function handleLockedWheel(event) {
    if (!isDialogOpen.value) {
      return
    }

    const container = getScrollableEditorContainer(event.target)
    if (canScrollEditor(container, event.deltaY)) {
      return
    }

    event.preventDefault()
  }

  function handleLockedKeydown(event) {
    if (!isDialogOpen.value) {
      return
    }

    const activeElement = document.activeElement
    const isTypingTarget = activeElement instanceof HTMLInputElement
      || activeElement instanceof HTMLTextAreaElement
      || activeElement instanceof HTMLSelectElement
      || (activeElement instanceof HTMLElement && activeElement.isContentEditable)

    if (blockedScrollKeys.indexOf(event.key) !== -1) {
      event.preventDefault()
      return
    }

    if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && !isTypingTarget) {
      event.preventDefault()
    }

    if (event.key === 'Escape' && typeof onEscape === 'function') {
      onEscape()
    }
  }

  function handleLockedTouchStart(event) {
    const touch = event.touches && event.touches[0]
    touchStartY = touch ? touch.clientY : 0
  }

  function handleLockedTouchMove(event) {
    if (!isDialogOpen.value) {
      return
    }

    const touch = event.touches && event.touches[0]
    const currentY = touch ? touch.clientY : touchStartY
    const deltaY = touchStartY - currentY
    const container = getScrollableEditorContainer(event.target)

    if (canScrollEditor(container, deltaY)) {
      return
    }

    event.preventDefault()
  }

  function setPageScrollLocked(locked) {
    if (typeof window === 'undefined') {
      return
    }

    const method = locked ? 'addEventListener' : 'removeEventListener'
    window[method]('wheel', handleLockedWheel, { passive: false })
    window[method]('keydown', handleLockedKeydown, { passive: false })
    window[method]('touchstart', handleLockedTouchStart, { passive: true })
    window[method]('touchmove', handleLockedTouchMove, { passive: false })
  }

  watch(isDialogOpen, (nextValue) => {
    setPageScrollLocked(nextValue)
  })

  onBeforeUnmount(() => {
    setPageScrollLocked(false)
  })
}
