import { ReactElement } from 'react'
import { useMutation, gql, ApolloQueryResult } from '@apollo/client'
import { useSnackbar } from 'notistack'
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded'
import UnarchiveRoundedIcon from '@mui/icons-material/UnarchiveRounded'
import { MenuItem } from '../../../../../MenuItem'
import { JourneyStatus } from '../../../../../../../__generated__/globalTypes'
import { JourneyArchive } from '../../../../../../../__generated__/JourneyArchive'
import { JourneyUnarchive } from '../../../../../../../__generated__/JourneyUnarchive'
import { GetActiveJourneys } from '../../../../../../../__generated__/GetActiveJourneys'
import { GetArchivedJourneys } from '../../../../../../../__generated__/GetArchivedJourneys'
import { GetTrashedJourneys } from '../../../../../../../__generated__/GetTrashedJourneys'

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

export interface ArchiveJourneyProps {
  status: JourneyStatus
  id: string
  published: boolean
  handleClose: () => void
  refetch?: () => Promise<
    ApolloQueryResult<
      GetActiveJourneys | GetArchivedJourneys | GetTrashedJourneys
    >
  >
}

export function ArchiveJourney({
  status,
  id,
  published,
  handleClose,
  refetch
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
      await refetch?.()
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
          label="Archive"
          icon={<ArchiveRoundedIcon color="secondary" />}
          onClick={handleClick}
        />
      ) : (
        <MenuItem
          label="Unarchive"
          icon={<UnarchiveRoundedIcon color="secondary" />}
          onClick={handleClick}
        />
      )}
    </>
  )
}
