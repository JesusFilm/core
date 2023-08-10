import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded'
import NextLink from 'next/link'
import { ReactElement } from 'react'

import { JourneyFields as Journey } from '../../../../__generated__/JourneyFields'
import { MenuItem } from '../../MenuItem/MenuItem'

interface Props {
  journey: Journey
}

export function ReportMenuItem({ journey }: Props): ReactElement {
  return (
    <NextLink href={`/journeys/${journey.id}/reports`} passHref>
      <MenuItem label="Report" icon={<AssessmentRoundedIcon />} />
    </NextLink>
  )
}
