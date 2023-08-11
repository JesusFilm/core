import { gql, useMutation } from '@apollo/client'
import BeenHereRoundedIcon from '@mui/icons-material/BeenhereRounded'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../../__generated__/JourneyFields'
import { JourneyPublish } from '../../../../../__generated__/JourneyPublish'
import { MenuItem } from '../../../MenuItem'

export const JOURNEY_PUBLISH = gql`
  mutation JourneyPublish($id: ID!) {
    journeyPublish(id: $id) {
      id
      status
    }
  }
`

interface Props {
  journey: Journey
  isOwner: boolean
  isVisible?: boolean
}

export function PublishMenuItem({
  journey,
  isOwner,
  isVisible
}: Props): ReactElement {
  const [journeyPublish] = useMutation<JourneyPublish>(JOURNEY_PUBLISH)
  const { enqueueSnackbar } = useSnackbar()

  const handlePublish = async (): Promise<void> => {
    if (journey == null) return

    await journeyPublish({
      variables: { id: journey.id },
      optimisticResponse: {
        journeyPublish: {
          id: journey.id,
          __typename: 'Journey',
          status: JourneyStatus.published
        }
      }
    })
    journey.template === true
      ? enqueueSnackbar('Template Published', {
          variant: 'success',
          preventDuplicate: true
        })
      : enqueueSnackbar('Journey Published', {
          variant: 'success',
          preventDuplicate: true
        })
  }

  return (
    <>
      {isVisible === true && (
        <MenuItem
          label="Publish"
          icon={<BeenHereRoundedIcon />}
          disabled={
            journey.status === JourneyStatus.published ||
            (journey.template !== true && !isOwner)
          }
          onClick={handlePublish}
        />
      )}
    </>
  )
}
