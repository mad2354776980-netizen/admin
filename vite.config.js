// noinspection JSUnusedGlobalSymbols

import { createLogger, defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const logger = createLogger()
const loggerWarn = logger.warn

logger.warn = (msg, options) => {
  const normalizedMessage = typeof msg === 'string' ? msg : ''
  const isVueUseInvalidAnnotation = normalizedMessage.includes('INVALID_ANNOTATION')
    && normalizedMessage.includes('/@vueuse/core/dist/index.js')

  if (isVueUseInvalidAnnotation) {
    return
  }

  loggerWarn(msg, options)
}

export default defineConfig({
  plugins: [vue()],
  customLogger: logger
})
