import CheckRounded from '@mui/icons-material/CheckRounded'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'

import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { useJourneyDuplicateMutation } from '../../../libs/useJourneyDuplicateMutation'
import { MenuItem } from '../../MenuItem'
import { CopyToTeamDialog } from '../../Team/CopyToTeamDialog'

interface Props {
  journey: Journey
  isVisible?: boolean
}

export function TemplateMenuItem({ journey, isVisible }: Props): ReactElement {
  const router = useRouter()
  const [journeyDuplicate] = useJourneyDuplicateMutation()

  const [duplicateTeamDialogOpen, setDuplicateTeamDialogOpen] = useState(false)

  const handleTemplate = async (teamId: string | undefined): Promise<void> => {
    if (journey == null || teamId == null) return

    const { data } = await journeyDuplicate({
      variables: { id: journey.id, teamId }
    })

    if (data != null) {
      void router.push(`/journeys/${data.journeyDuplicate.id}`, undefined, {
        shallow: true
      })
    }
  }

  return (
    <>
      {isVisible === true && (
        <MenuItem
          label="Use Template"
          icon={<CheckRounded />}
          onClick={() => setDuplicateTeamDialogOpen(true)}
        />
      )}

      <CopyToTeamDialog
        submitLabel="Add"
        title="Add Journey to Team"
        open={duplicateTeamDialogOpen}
        onClose={() => setDuplicateTeamDialogOpen(false)}
        submitAction={handleTemplate}
      />
    </>
  )
}
