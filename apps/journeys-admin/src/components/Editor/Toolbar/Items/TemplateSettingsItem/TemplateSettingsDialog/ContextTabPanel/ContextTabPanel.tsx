import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { useUser } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { useTemplateSettingsForm } from '../useTemplateSettingsForm'

export function ContextTabPanel(): ReactElement {
  const { values, handleChange, errors, setFieldValue } =
    useTemplateSettingsForm()
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')
  const [generateLoading, setGenerateLoading] = useState(false)
  const user = useUser()

  const handleGenerate = async (): Promise<void> => {
    try {
      setGenerateLoading(true)
      if (user == null) return

      const response = await fetch('/api/journey/context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({ journey })
      })

      if (response.body == null) return
      const { text } = await response.json()
      await setFieldValue('context', text)
    } catch (error) {
      console.error(error)
    } finally {
      setGenerateLoading(false)
    }
  }

  return (
    <>
      <TextField
        id="context"
        name="context"
        value={values.context ?? ''}
        error={Boolean(errors?.context)}
        variant="outlined"
        helperText={
          errors?.context != null
            ? errors?.context
            : t('Context for AI-generated content')
        }
        onChange={handleChange}
        label={t('Context')}
        multiline
        rows={10}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleGenerate}
        disabled={generateLoading}
      >
        {generateLoading ? t('Generating...') : t('Generate')}
      </Button>
    </>
  )
}
