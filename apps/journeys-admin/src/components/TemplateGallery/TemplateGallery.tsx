import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { GetJourneys_journeys } from '../../../__generated__/GetJourneys'
import { TemplateSection } from '../TemplateSection'
import { journeys } from '../TemplateSection/data'

// properly call the journeys data

export function TemplateGallery(): ReactElement {
  return (
    <Box>
      <TemplateSection
        category="Featured & New"
        journeys={journeys as unknown as GetJourneys_journeys[]}
      />
    </Box>
  )
}
