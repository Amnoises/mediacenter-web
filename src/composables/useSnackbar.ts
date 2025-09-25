import { reactive, readonly } from 'vue'

export type SnackbarType = 'success' | 'info' | 'error'

interface SnackbarState {
  isVisible: boolean
  message: string
  type: SnackbarType
}

const snackbarState = reactive<SnackbarState>({
  isVisible: false,
  message: '',
  type: 'info',
})

let hideTimeout: ReturnType<typeof setTimeout> | null = null

const hideSnackbar = () => {
  snackbarState.isVisible = false
  snackbarState.message = ''
  snackbarState.type = 'info'

  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
}

const showSnackbar = (message: string, type: SnackbarType = 'info', duration = 5000) => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }

  snackbarState.message = message
  snackbarState.type = type
  snackbarState.isVisible = true

  if (duration > 0 && typeof window !== 'undefined') {
    hideTimeout = window.setTimeout(() => {
      hideSnackbar()
    }, duration)
  }
}

export const useSnackbar = () => ({
  state: readonly(snackbarState),
  showSnackbar,
  hideSnackbar,
})
