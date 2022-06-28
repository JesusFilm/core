import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import { useSnackbar } from 'notistack'
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded'
import UnarchiveRoundedIcon from '@mui/icons-material/UnarchiveRounded'
import { MenuItem } from '../../MenuItem'
import { JourneyStatus } from '../../../../../../../__generated__/globalTypes'
import { JourneyArchive } from '../../../../../../../__generated__/JourneyArchive'
import { JourneyUnarchive } from '../../../../../../../__generated__/JourneyUnarchive'

export const JOURNEY_ARCHIVE = gql`
  mutation JourneyArchive($ids: [ID!]!) {
    journeysArchive(ids: $ids) {
      id
      status
    }
  }
`

export const JOURNEY_UNARCHIVE = gql`
  mutation JourneyUnarchive($ids: [ID!]!) {
    journeysRestore(ids: $ids) {
      id
      status
    }
  }
`

interface ArchiveJourneyProps {
  status: JourneyStatus
  id: string
  published: boolean
  handleClose: () => void
}

export function ArchiveJourney({
  status,
  id,
  published,
  handleClose
}: ArchiveJourneyProps): ReactElement {
  const previousStatus = published
    ? JourneyStatus.published
    : JourneyStatus.draft
  const [archiveJourney] = useMutation<JourneyArchive>(JOURNEY_ARCHIVE, {
    variables: {
      ids: [id]
    },
    optimisticResponse: {
      journeysArchive: [
        {
          id,
          status: JourneyStatus.archived,
          __typename: 'Journey'
        }
      ]
    }
  })
  const [unarchiveJourney] = useMutation<JourneyUnarchive>(JOURNEY_UNARCHIVE, {
    variables: {
      ids: [id]
    },
    optimisticResponse: {
      journeysRestore: [
        {
          id,
          status: previousStatus,
          __typename: 'Journey'
        }
      ]
    }
  })

  const { enqueueSnackbar } = useSnackbar()

  async function handleClick(): Promise<void> {
    try {
      if (status !== JourneyStatus.archived) {
        await archiveJourney()
        enqueueSnackbar('Journey Archived', {
          variant: 'success',
          preventDuplicate: true
        })
      } else {
        await unarchiveJourney()
        enqueueSnackbar('Journey Unarchived', {
          variant: 'success',
          preventDuplicate: true
        })
      }
      handleClose()
    } catch (error) {
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true
      })
    }
  }

  return (
    <>
      {status !== JourneyStatus.archived ? (
        <MenuItem
          icon={<ArchiveRoundedIcon color="secondary" />}
          text="Archive"
          handleClick={handleClick}
        />
      ) : (
        <MenuItem
          icon={<UnarchiveRoundedIcon color="secondary" />}
          text="Unarchive"
          handleClick={handleClick}
        />
      )}
    </>
  )
}
