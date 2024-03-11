import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

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
      <Typography variant="subtitle1">{t('Default Journey')}</Typography>
      <Stack direction="row" justifyContent="space-between">
        <FormControl variant="filled" fullWidth hiddenLabel>
          <Select
            id="defaultJourney"
            name="defaultJourney"
            onChange={handleOnChange}
            defaultValue={
              customDomains[0]?.journeyCollection?.journeys[0]?.title
            }
          >
            {journeys?.map((journey) => (
              <MenuItem value={journey.id} key={journey.id}>
                {journey.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Stack>
  )
}
