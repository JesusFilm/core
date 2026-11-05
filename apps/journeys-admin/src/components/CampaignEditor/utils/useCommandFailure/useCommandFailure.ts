import { useSnackbar } from 'notistack'
import { useCallback } from 'react'

import { messageOf } from '../messageOf'

/**
 * The editor's one error surface for a refused write: the API's message,
 * verbatim, in the error snackbar. Commands pass the returned function to
 * `.catch` on each request they fire, so a failed execute, undo or redo is
 * reported even after the panel that added the Command has unmounted.
 */
export function useCommandFailure(): (error: unknown) => void {
  const { enqueueSnackbar } = useSnackbar()
  return useCallback(
    (error: unknown): void => {
      enqueueSnackbar(messageOf(error), {
        variant: 'error',
        preventDuplicate: true
      })
    },
    [enqueueSnackbar]
  )
}
