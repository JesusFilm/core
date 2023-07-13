import { ReactElement } from 'react'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import { useRouter } from 'next/router'
import { useJourneyCreate } from '../../../../libs/useJourneyCreate'
import { useTeam } from '../../../Team/TeamProvider'

export function AddJourneyButton(): ReactElement {
  const { createJourney } = useJourneyCreate()
  const router = useRouter()
  const { activeTeam } = useTeam()

  const handleClick = async (): Promise<void> => {
    const journey = await createJourney()
    if (journey != null) {
      void router.push(`/journeys/${journey.id}/edit`, undefined, {
        shallow: true
      })
    }
  }

  return (
    <>
      {activeTeam != null && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="medium"
          onClick={handleClick}
          sx={{ mt: 3, alignSelf: 'center' }}
        >
          Create a Journey
        </Button>
      )}
    </>
  )
}
