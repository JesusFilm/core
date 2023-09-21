import { gql, useMutation } from '@apollo/client'
import Checkbox from '@mui/material/Checkbox'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { JourneyFeature } from '../../../../__generated__/JourneyFeature'

export const JOURNEY_FEATURE_UPDATE = gql`
  mutation JourneyFeature($journeyFeatureId: ID!, $feature: Boolean!) {
    journeyFeature(id: $journeyFeatureId, feature: $feature) {
      featuredAt
    }
  }
`

interface FeaturedCheckboxProps {
  journeyId: string
  featuredAt: string | null
}

export function FeaturedCheckbox({
  journeyId: id,
  featuredAt
}: FeaturedCheckboxProps): ReactElement {
  const { t } = useTranslation()
  const [journeyFeature, { loading }] = useMutation<JourneyFeature>(
    JOURNEY_FEATURE_UPDATE
  )

  function handleChecked(feature: boolean): void {
    void journeyFeature({
      variables: { id, feature }
    })
  }

  return (
    <Stack direction="row" alignItems="center">
      <Checkbox
        sx={{ mr: 3 }}
        color="secondary"
        defaultChecked={featuredAt != null}
        onChange={(e) => handleChecked(e.target.checked)}
        disabled={loading}
      />
      <Typography sx={{ color: 'secondary.main' }} variant="subtitle2">
        {t('Mark as Featured')}
      </Typography>
    </Stack>
  )
}
