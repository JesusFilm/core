import { gql, useMutation } from '@apollo/client'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { ReactElement } from 'react'
import { object, string } from 'yup'
import { CreateHost } from '../../../../../../../../../__generated__/CreateHost'
import { UpdateJourneyHost } from '../../../../../../../../../__generated__/UpdateJourneyHost'
import { useHostUpdate } from '../../../../../../../../libs/useHostUpdate/useHostUpdate'
import { TextFieldForm } from '../../../../../../../TextFieldForm'
import { HostList } from './HostList/HostList'

export const CREATE_HOST = gql`
  mutation CreateHost($id: ID!, $teamId: ID!, $input: HostCreateInput) {
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
    title: string().required('Please enter a host name')
  })

  async function handleSubmit(value: string): Promise<void> {
    if (host != null) {
      const { id, teamId } = host
      console.log('UPDATE HOST MOCK', updateHost)
      const a = await updateHost({ id, teamId, input: { title: value } })

      console.log('a', a)
    } else {
      const { data } = await hostCreate({
        variables: { teamId: 'jfp-team', input: { title: value } },

        update(cache, { data }) {
          if (data?.hostCreate != null) {
            console.log('modify cache', cache.extract()?.ROOT_QUERY, data)
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

                  console.log('cache', [...existingTeamHosts, newHostRef])
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
    <>
      <TextFieldForm
        id="hostName"
        label="Host Name"
        initialValues={host?.title}
        validationSchema={titleSchema}
        handleSubmit={handleSubmit}
      />
      <HostList />
    </>
  )
}
