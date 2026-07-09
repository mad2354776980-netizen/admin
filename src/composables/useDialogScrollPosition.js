import { nextTick } from 'vue'

export function preservePageScroll(openDialog) {
  const currentScrollY = typeof window === 'undefined' ? 0 : window.scrollY

  if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }

  openDialog()

  if (typeof window === 'undefined') {
    return
  }

  nextTick(() => {
    window.scrollTo(0, currentScrollY)
    window.requestAnimationFrame(() => {
      window.scrollTo(0, currentScrollY)
    })
  })
}
