import { useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { ReactElement, useState } from 'react'

import Download2 from '@core/shared/ui/icons/Download2'
import { graphql } from '@core/shared/gql'

import { ExportDialog } from '../FilterDrawer/ExportDialog'

interface ExportEventsButtonProps {
  journeyId: string
  disabled: boolean
}

export const GET_JOURNEY_BLOCK_TYPENAMES = graphql(`
  query GetJourneyBlockTypesForButton($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      id
      createdAt
      blockTypenames
    }
  }
`)

export function ExportEventsButton({
  journeyId,
  disabled
}: ExportEventsButtonProps): ReactElement {
  const [showExportDialog, setShowExportDialog] = useState(false)
  const { data } = useQuery(GET_JOURNEY_BLOCK_TYPENAMES, {
    variables: { id: journeyId }
  })
  const availableBlockTypes: string[] = data?.journey?.blockTypenames ?? []
  const createdAt =
    data?.journey?.createdAt != null ? String(data.journey.createdAt) : null

  return (
    <Box sx={{ display: { sm: 'block', md: 'none' } }}>
      <IconButton onClick={() => setShowExportDialog(true)} disabled={disabled}>
        <Download2 />
      </IconButton>
      <ExportDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        journeyId={journeyId}
        availableBlockTypes={availableBlockTypes}
        createdAt={createdAt}
      />
    </Box>
  )
}
