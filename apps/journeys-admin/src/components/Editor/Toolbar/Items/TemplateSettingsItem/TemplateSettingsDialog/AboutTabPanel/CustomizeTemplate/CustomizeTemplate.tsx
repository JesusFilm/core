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
import { formateTemplateCustomizationString } from '../../utils/formateTemplateCustomizationString'
import { getTemplateCustomizationFields } from '../../utils/getTemplateCustomizationFields'

export function CustomizeTemplate(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const {
    values: { customizationText },
    setFieldValue
  } = useTemplateSettingsForm()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = event.target.value
    void setFieldValue('customizationText', newValue)
  }

  const handleRefresh = (): void => {
    const formattedCustomizationText = formateTemplateCustomizationString(
      getTemplateCustomizationFields(journey),
      customizationText
    )
    void setFieldValue('customizationText', formattedCustomizationText)
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
        fullWidth
        multiline
        value={customizationText}
        onChange={handleChange}
        variant="outlined"
      />
    </Box>
  )
}
