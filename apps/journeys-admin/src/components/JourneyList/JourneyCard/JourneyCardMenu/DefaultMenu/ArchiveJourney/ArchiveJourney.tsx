import { ApolloQueryResult, gql, useMutation } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import FolderDown1Icon from '@core/shared/ui/icons/FolderDown1'
import FolderUp1Icon from '@core/shared/ui/icons/FolderUp1'

import { GetJourneysAdmin } from '../../../../../../../__generated__/GetJourneysAdmin'
import { JourneyStatus } from '../../../../../../../__generated__/globalTypes'
import { JourneyArchive } from '../../../../../../../__generated__/JourneyArchive'
import { JourneyUnarchive } from '../../../../../../../__generated__/JourneyUnarchive'
import { MenuItem } from '../../../../../MenuItem'

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
  refetch?: () => Promise<ApolloQueryResult<GetJourneysAdmin>>
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
          icon={<FolderUp1Icon color="secondary" />}
          onClick={handleClick}
        />
      ) : (
        <MenuItem
          label="Unarchive"
          icon={<FolderDown1Icon color="secondary" />}
          onClick={handleClick}
        />
      )}
    </>
  )
}
