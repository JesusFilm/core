import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Computer from '@core/shared/ui/icons/Computer'

import { GetAdminJourneys_journeys as Journeys } from '../../../../../__generated__/GetAdminJourneys'
import { GetCustomDomain_customDomains as CustomDomains } from '../../../../../__generated__/GetCustomDomain'

interface DefaultJourneyFormProps {
  handleOnChange: (e: SelectChangeEvent) => Promise<void>
  customDomains: CustomDomains[]
  journeys?: Journeys[]
}

export function DefaultJourneyForm({
  handleOnChange,
  customDomains,
  journeys
}: DefaultJourneyFormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Stack spacing={4}>
      <Stack direction="row" spacing={3}>
        <Computer />
        <Stack spacing={4} width="100%">
          <Typography variant="subtitle1">{t('Default Journey')}</Typography>
          <Stack direction="row" justifyContent="space-between">
            <FormControl variant="filled" fullWidth hiddenLabel>
              <Select
                id="defaultJourney"
                name="defaultJourney"
                onChange={handleOnChange}
                defaultValue={
                  customDomains[0]?.journeyCollection?.journeys[0]?.id
                }
                variant="outlined"
              >
                {journeys?.map((journey) => (
                  <MenuItem value={journey.id} key={journey.id}>
                    {journey.title}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {t(
                  `The selected Journey will be available under ${customDomains[0].name}/`
                )}
              </FormHelperText>
            </FormControl>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  )
}
