import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  plugins: [vue()],
  build: {
    rolldownOptions: {
      onLog(level, log, defaultHandler) {
        const isVueUseInvalidAnnotation = level === 'warn'
          && log
          && log.code === 'INVALID_ANNOTATION'
          && typeof log.id === 'string'
          && log.id.includes('/@vueuse/core/dist/index.js')

        if (isVueUseInvalidAnnotation) {
          return
        }

        defaultHandler(level, log)
      }
    }
  }
})
