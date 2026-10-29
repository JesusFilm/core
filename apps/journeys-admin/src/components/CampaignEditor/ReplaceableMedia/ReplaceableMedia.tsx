import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode, useState } from 'react'

interface ReplaceableMediaProps<Picked> {
  label: string
  /** The current media; undefined while the slot is empty. */
  preview?: ReactNode
  /** Said in place of the preview while the slot is empty. */
  emptyNote?: string
  /** Shown under the preview while the slot is filled (the focal point). */
  details?: ReactNode
  replaceLabel: string
  removeLabel: string
  onRemove: () => void
  /** Called with what the author kept in the picker; Replace closes first. */
  onPick: (picked: Picked) => void
  /** The picker, shown while the slot is empty or being replaced. */
  renderPicker: (onPick: (picked: Picked) => void) => ReactNode
}

/**
 * A Settings body's media slot: the current media with Replace and Remove
 * under it, and the picker while the slot is empty or Replace is open.
 * Shared by the header's logo, an Image section's picture and a section's
 * Media Slot.
 */
export function ReplaceableMedia<Picked>({
  label,
  preview,
  emptyNote,
  details,
  replaceLabel,
  removeLabel,
  onRemove,
  onPick,
  renderPicker
}: ReplaceableMediaProps<Picked>): ReactElement {
  const [replacing, setReplacing] = useState(false)
  const filled = preview != null

  function handleReplace(): void {
    setReplacing(true)
  }

  function handleRemove(): void {
    setReplacing(false)
    onRemove()
  }

  function handlePick(picked: Picked): void {
    setReplacing(false)
    onPick(picked)
  }

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2">{label}</Typography>
      {preview}
      {!filled && emptyNote != null && (
        <Typography variant="body2" color="text.secondary">
          {emptyNote}
        </Typography>
      )}
      {filled && details}
      {filled && (
        <Stack direction="row" spacing={2}>
          {!replacing && (
            <Button variant="outlined" size="small" onClick={handleReplace}>
              {replaceLabel}
            </Button>
          )}
          <Button variant="text" size="small" onClick={handleRemove}>
            {removeLabel}
          </Button>
        </Stack>
      )}
      {(!filled || replacing) && renderPicker(handlePick)}
    </Stack>
  )
}
