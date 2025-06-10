import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Snackbar from '@mui/material/Snackbar'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { useJourneyUpdateMutation } from './useJourneyUpdateMutation'

interface GenerateAiDescriptionDialogProps {
  open: boolean
  onClose: () => void
}

export function GenerateAiDescriptionDialog({
  open,
  onClose
}: GenerateAiDescriptionDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [journeyUpdate] = useJourneyUpdateMutation()

  useEffect(() => {
    if (open) {
      setLoading(true)
      setDescription(journey?.context ?? '')
      const generate = async (): Promise<void> => {
        const response = await fetch('/api/generate-ai-description', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ journey })
        })

        if (response.body == null) {
          setLoading(false)
          return
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let done = false
        let streamedDescription = ''
        while (!done) {
          const { value, done: doneReading } = await reader.read()
          done = doneReading
          const chunkValue = decoder.decode(value)
          streamedDescription += chunkValue
          setDescription(streamedDescription)
        }
        setLoading(false)
      }
      generate().catch(console.error)
    }
  }, [open, journey])

  const handleSave = async (): Promise<void> => {
    if (journey == null) return
    setSaveLoading(true)
    try {
      await journeyUpdate({
        variables: {
          id: journey.id,
          input: {
            context: description
          }
        }
      })
      setSnackbarOpen(true)
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>{t('AI-Generated Description')}</DialogTitle>
        <DialogContent>
          <TextField
            label={t('Description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={10}
            fullWidth
            variant="outlined"
            disabled={loading}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saveLoading}>
            {t('Cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saveLoading || loading}
          >
            {saveLoading ? t('Saving...') : t('Save')}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        autoHideDuration={3000}
        message={t('Description saved')}
      />
    </>
  )
}
