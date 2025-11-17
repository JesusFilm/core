import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import { ReactElement } from 'react'

export interface ShowSnackbarOptions {
  /**
   * Whether identical snackbars should be prevented from appearing multiple times.
   * Defaults to `true`.
   */
  preventDuplicate?: boolean
  /**
   * Duration (in milliseconds) before the snackbar automatically hides.
   * Providing a number forces `persist` to `false`. Use `null` to omit the override.
   * Defaults to `4000`.
   */
  autoHideDuration?: number | null
  /**
   * Whether the snackbar should remain visible until dismissed manually.
   * Defaults to `undefined` (library default) and is ignored when `autoHideDuration` is provided.
   */
  persist?: boolean
}

type ShowSnackbarArgument = boolean | ShowSnackbarOptions | undefined

/**
 * Builds a reusable snackbar helper that wraps notistack with sensible defaults.
 *
 * @param enqueueSnackbar - notistack enqueue function
 * @param closeSnackbar - notistack close function
 * @returns Helper that accepts a message, variant, and optional configuration
 *
 * @example
 * const showSnackbar = createShowSnackbar(enqueueSnackbar, closeSnackbar)
 * showSnackbar('Upload started', 'info', { persist: true })
 */
export function createShowSnackbar(
  enqueueSnackbar: (message: string, options?: unknown) => string | number,
  closeSnackbar: (key: string | number) => void
) {
  const normalizeOptions = (
    optionsOrPersist: ShowSnackbarArgument
  ): ShowSnackbarOptions => {
    if (typeof optionsOrPersist === 'boolean') {
      return { persist: optionsOrPersist }
    }

    if (optionsOrPersist == null) {
      return {}
    }

    return optionsOrPersist
  }

  return (
    message: string,
    variant: 'success' | 'error' | 'info' | 'warning',
    optionsOrPersist?: ShowSnackbarArgument
  ): void => {
    const options = normalizeOptions(optionsOrPersist)

    const resolvedPreventDuplicate = options.preventDuplicate ?? true

    const resolvedAutoHideDuration =
      options.autoHideDuration === undefined ? 4000 : options.autoHideDuration

    const shouldForcePersistFalse = options.autoHideDuration != null

    const resolvedPersist = shouldForcePersistFalse ? false : options.persist

    enqueueSnackbar(message, {
      variant,
      preventDuplicate: resolvedPreventDuplicate,
      ...(resolvedAutoHideDuration != null && {
        autoHideDuration: resolvedAutoHideDuration
      }),
      ...(resolvedPersist === true && { persist: true }),
      action: (key): ReactElement => (
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={() => {
            closeSnackbar(key)
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )
    })
  }
}
