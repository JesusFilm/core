import { useSnackbar } from 'notistack'
import { useCallback } from 'react'

import { messageOf } from '../messageOf'

/**
 * The editor's one error surface for a refused write: the API's message,
 * verbatim, in the error snackbar. The Campaign Command module sends every
 * refused undo and redo here, so a refusal is reported even after the panel
 * that added the Command has unmounted. With a `fallback`, an error that is
 * neither a GraphQL error nor an `Error` shows the fallback instead.
 */
export function useCommandFailure(): (
  error: unknown,
  fallback?: string
) => void {
  const { enqueueSnackbar } = useSnackbar()
  return useCallback(
    (error: unknown, fallback?: string): void => {
      enqueueSnackbar(messageOf(error, fallback), { variant: 'error', preventDuplicate: true })
    },
    [enqueueSnackbar]
  )
}
