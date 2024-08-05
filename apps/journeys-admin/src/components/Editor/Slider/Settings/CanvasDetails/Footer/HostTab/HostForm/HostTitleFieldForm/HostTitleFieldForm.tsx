import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback, useEffect } from 'react'
import { object, string } from 'yup'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { CreateHost } from '../../../../../../../../../../__generated__/CreateHost'
import { useHostUpdateMutation } from '../../../../../../../../../libs/useHostUpdateMutation/useHostUpdateMutation'
import { useUpdateJourneyHostMutation } from '../../../../../../../../../libs/useUpdateJourneyHostMutation'
import { TextFieldForm } from '../../../../../../../../TextFieldForm'

export const CREATE_HOST = gql`
  mutation CreateHost($teamId: ID!, $input: HostCreateInput!) {
    hostCreate(teamId: $teamId, input: $input) {
      id
      title
    }
  }
`

interface HostTitleFieldFormProps {
  defaultTitle?: string
  label?: string
  hostTitleRequiredErrorMessage?: string
}

export function HostTitleFieldForm({
  defaultTitle,
  label,
  hostTitleRequiredErrorMessage
}: HostTitleFieldFormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [hostCreate] = useMutation<CreateHost>(CREATE_HOST)
  const [journeyHostUpdate] = useUpdateJourneyHostMutation()
  const { updateHost } = useHostUpdateMutation()
  const { journey } = useJourney()

  const createHost = useCallback(
    async (value: string): Promise<void> => {
      if (journey?.team != null) {
        const { data } = await hostCreate({
          variables: { teamId: journey.team.id, input: { title: value } },
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
            variables: {
              id: journey?.id,
              input: { hostId: data.hostCreate.id }
            }
          })
        }
      }
    },
    [hostCreate, journey, journeyHostUpdate]
  )

  useEffect(() => {
    async function createHostIfDefault(): Promise<void> {
      if (
        journey?.host == null &&
        journey?.team != null &&
        defaultTitle != null
      ) {
        await createHost(defaultTitle)
      }
    }
    void createHostIfDefault()
  }, [defaultTitle, createHost, journey])

  const titleSchema = object({
    hostTitle: string().required(
      hostTitleRequiredErrorMessage ?? t('Please enter a host name')
    )
  })

  async function handleSubmit(value: string): Promise<void> {
    if (journey?.host != null) {
      const { id, teamId } = journey.host
      await updateHost({ id, teamId, input: { title: value } })
    } else {
      await createHost(value)
    }
  }

  return (
    <TextFieldForm
      id="hostTitle"
      label={label ?? t('Host Name')}
      initialValue={journey?.host == null ? defaultTitle : journey.host.title}
      validationSchema={titleSchema}
      onSubmit={handleSubmit}
      data-testid="HostTitleFieldForm"
    />
  )
}
