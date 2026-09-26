import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'

import {
  ASSET_CLASS_OPTIONS,
  ShortLinkAssetClass,
  getDestinationChangeRule,
  labelFor,
  validateDestinationChange
} from '../../../../../libs/shortLink'

export interface DestinationChangeDialogProps {
  open: boolean
  assetClass: ShortLinkAssetClass
  from: string
  to: string
  /** What the link is printed in: videoId, youtubeVideoId or the link name. */
  videoLabel: string
  loading?: boolean
  onConfirm: (note: string) => void
  onClose: () => void
}

export function getVideoLabel(link: {
  videoId?: string | null
  youtubeVideoId?: string | null
  name?: string | null
  pathname: string
}): string {
  if (link.videoId != null && link.videoId !== '')
    return `video ${link.videoId}`
  if (link.youtubeVideoId != null && link.youtubeVideoId !== '')
    return `YouTube video ${link.youtubeVideoId}`
  if (link.name != null && link.name !== '') return link.name
  return link.pathname
}

export function DestinationChangeDialog({
  open,
  assetClass,
  from,
  to,
  videoLabel,
  loading = false,
  onConfirm,
  onClose
}: DestinationChangeDialogProps): ReactElement {
  const [note, setNote] = useState('')
  const [noteError, setNoteError] = useState<string | undefined>()
  const rule = getDestinationChangeRule(assetClass)

  function handleConfirm(): void {
    const validation = validateDestinationChange(assetClass, note)
    if (validation.noteError != null) {
      setNoteError(validation.noteError)
      return
    }
    setNoteError(undefined)
    onConfirm(note.trim())
  }

  function handleClose(): void {
    setNoteError(undefined)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="destination-change-title"
      fullWidth
    >
      <DialogTitle id="destination-change-title">
        Change a {labelFor(ASSET_CLASS_OPTIONS, assetClass).toLowerCase()}{' '}
        destination?
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="warning">
            This link is embedded in {videoLabel}. Everyone who scans or clicks
            it will land on the new destination immediately.
          </Alert>
          <DialogContentText component="div">
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              From
            </Typography>
            <Typography sx={{ wordBreak: 'break-all' }}>{from}</Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', mt: 1, display: 'block' }}
            >
              To
            </Typography>
            <Typography sx={{ wordBreak: 'break-all' }}>{to}</Typography>
          </DialogContentText>
          <TextField
            label={rule.requiresNote ? 'Change note (required)' : 'Change note'}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            error={noteError != null}
            helperText={
              noteError ?? 'Recorded in the destination history for this link'
            }
            multiline
            minRows={2}
            required={rule.requiresNote}
            slotProps={{ htmlInput: { 'aria-label': 'Change note' } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={handleConfirm}
          loading={loading}
        >
          Change destination
        </Button>
      </DialogActions>
    </Dialog>
  )
}
