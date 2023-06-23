import { gql, useMutation } from '@apollo/client'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { ReactElement } from 'react'
import { object, string } from 'yup'
import { CreateHost } from '../../../../../../../../../__generated__/CreateHost'
import { UpdateJourneyHost } from '../../../../../../../../../__generated__/UpdateJourneyHost'
import { useHostUpdate } from '../../../../../../../../libs/useHostUpdate/useHostUpdate'
import { TextFieldForm } from '../../../../../../../TextFieldForm'

export const CREATE_HOST = gql`
  mutation CreateHost($teamId: ID!, $input: HostCreateInput!) {
    hostCreate(teamId: $teamId, input: $input) {
      id
      title
    }
  }
`

export const UPDATE_JOURNEY_HOST = gql`
  mutation UpdateJourneyHost($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
      host {
        id
      }
    }
  }
`

export function HostTitleFieldForm(): ReactElement {
  const [hostCreate] = useMutation<CreateHost>(CREATE_HOST)
  const [journeyHostUpdate] =
    useMutation<UpdateJourneyHost>(UPDATE_JOURNEY_HOST)

  const { updateHost } = useHostUpdate()
  const { journey } = useJourney()
  const host = journey?.host

  const titleSchema = object({
    hostTitle: string().required('Please enter a host name')
  })

  async function handleSubmit(value: string): Promise<void> {
    if (host != null) {
      const { id, teamId } = host
      await updateHost({ id, teamId, input: { title: value } })
    } else {
      const { data } = await hostCreate({
        variables: { teamId: 'jfp-team', input: { title: value } },
        update(cache, { data }) {
          if (data?.hostCreate != null) {
            cache.modify({
              fields: {
                hosts(existingTeamHosts = []) {
                  const newHostRef = cache.writeFragment({
                    data: data.hostCreate,
                    fragment: gql`
                      fragment NewHost on Host {
                        id
                      }
                    `
                  })
                  return [...existingTeamHosts, newHostRef]
                }
              }
            })
          }
        }
      })
      if (data?.hostCreate.id != null) {
        await journeyHostUpdate({
          variables: { id: journey?.id, input: { hostId: data.hostCreate.id } }
        })
      }
    }
  }

  return (
    <TextFieldForm
      id="hostTitle"
      label="Host Name"
      initialValue={host?.title}
      validationSchema={titleSchema}
      onSubmit={handleSubmit}
    />
  )
}
