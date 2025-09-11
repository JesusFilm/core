import RefreshIcon from '@mui/icons-material/Refresh'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { useTemplateSettingsForm } from '../../useTemplateSettingsForm'
import { formatTemplateCustomizationString } from '../../utils/formatTemplateCustomizationString'
import { getTemplateCustomizationFields } from '../../utils/getTemplateCustomizationFields'

export function CustomizeTemplate(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const {
    values: { journeyCustomizationDescription },
    setFieldValue
  } = useTemplateSettingsForm()

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const newValue = event.target.value
    void setFieldValue('journeyCustomizationDescription', newValue)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'Tab') return

    event.preventDefault()

    const target = event.target as HTMLTextAreaElement | HTMLInputElement
    const currentValue = journeyCustomizationDescription ?? ''
    const selectionStart = target.selectionStart ?? currentValue.length
    const selectionEnd = target.selectionEnd ?? selectionStart

    const SPECIAL_EM_SPACE = '\u2003'
    const updatedValue =
      currentValue.slice(0, selectionStart) +
      SPECIAL_EM_SPACE +
      currentValue.slice(selectionEnd)

    void setFieldValue('journeyCustomizationDescription', updatedValue)

    // Restore caret position after React re-renders the controlled value
    const newCaretPosition = selectionStart + SPECIAL_EM_SPACE.length
    requestAnimationFrame(() => {
      try {
        target.setSelectionRange(newCaretPosition, newCaretPosition)
      } catch {
        // noop if element is not focusable
      }
    })
  }

  const handleRefresh = (): void => {
    const formattedCustomizationText = formatTemplateCustomizationString(
      getTemplateCustomizationFields(journey),
      journeyCustomizationDescription
    )
    void setFieldValue(
      'journeyCustomizationDescription',
      formattedCustomizationText
    )
  }

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 4 }}
      >
        <Typography variant="h6">{t('Text for Customization')}</Typography>
        <IconButton
          onClick={handleRefresh}
          aria-label={t('Refresh template variables')}
          sx={{ bgcolor: 'grey.100' }}
        >
          <RefreshIcon />
        </IconButton>
      </Stack>
      <TextField
        data-testid="CustomizationDescriptionEdit"
        fullWidth
        multiline
        value={journeyCustomizationDescription}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        variant="outlined"
      />
    </Box>
  )
}
