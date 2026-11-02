'use client'

import { ReactElement, useState } from 'react'

import { TextareaField } from '../../../../../components/form'
import {
  ASSET_CLASS_OPTIONS,
  ShortLinkAssetClass,
  getDestinationChangeRule,
  labelFor,
  validateDestinationChange
} from '../../../../../libs/shortLink'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle
} from '@/components/ui/dialog'

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

  function handleOpenChange(nextOpen: boolean): void {
    if (!nextOpen) handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPopup className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Change a {labelFor(ASSET_CLASS_OPTIONS, assetClass).toLowerCase()}{' '}
            destination?
          </DialogTitle>
          <DialogDescription>
            Everyone who scans or clicks this link will land on the new
            destination immediately.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel className="flex flex-col gap-4">
          <Alert variant="warning">
            <AlertDescription>
              This link is embedded in {videoLabel}.
            </AlertDescription>
          </Alert>
          <div className="text-sm">
            <div className="text-muted-foreground text-xs">From</div>
            <div className="break-all">{from}</div>
            <div className="text-muted-foreground mt-2 text-xs">To</div>
            <div className="break-all">{to}</div>
          </div>
          <TextareaField
            id="destination-change-note"
            label="Change note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            error={noteError}
            helperText={
              rule.requiresNote
                ? 'Required for video-embedded links; recorded in the destination history'
                : 'Recorded in the destination history for this link'
            }
            required={rule.requiresNote}
          />
        </DialogPanel>
        <DialogFooter>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} loading={loading}>
            Change destination
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
