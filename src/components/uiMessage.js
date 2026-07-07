import { reactive } from 'vue'

const MESSAGE_DURATION = 2200
const DEFAULT_MESSAGE_TYPE = 'success'
const ALLOWED_MESSAGE_TYPES = ['success', 'error']

export const messageState = reactive({
  items: []
})

let messageSeed = 0

export function showMessage(input) {
  const nextType = ALLOWED_MESSAGE_TYPES.indexOf(input.type) === -1
    ? DEFAULT_MESSAGE_TYPE
    : input.type

  pushMessage({
    type: nextType,
    text: input.text
  })
}

export function showSuccessMessage(text) {
  showMessage({
    type: 'success',
    text
  })
}

export function showErrorMessage(text) {
  showMessage({
    type: 'error',
    text
  })
}

function pushMessage(input) {
  const id = `ui-message-${Date.now()}-${messageSeed}`
  messageSeed += 1

  messageState.items.push({
    id,
    type: input.type,
    text: input.text
  })

  window.setTimeout(() => {
    removeMessage(id)
  }, MESSAGE_DURATION)
}

function removeMessage(id) {
  // noinspection JSUnresolvedReference
  messageState.items = messageState.items.filter((item) => item.id !== id)
}
