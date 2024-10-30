import {
  ApolloCache,
  LazyQueryHookExecOptions,
  QueryResult,
  gql,
  useMutation
} from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import AlertCircleIcon from '@core/shared/ui/icons/AlertCircle'

import { DeleteHost } from '../../../../../../../../../__generated__/DeleteHost'
import {
  GetAllTeamHosts,
  GetAllTeamHostsVariables
} from '../../../../../../../../../__generated__/GetAllTeamHosts'
import {
  HostFormValues,
  useHostCreate
} from '../../../../../../../../libs/useHostCreate'
import { useHostUpdateMutation } from '../../../../../../../../libs/useHostUpdateMutation'
import { useUpdateJourneyHostMutation } from '../../../../../../../../libs/useUpdateJourneyHostMutation'

import { HostAvatarsButton } from './HostAvatarsButton'
import { HostLocationFieldForm } from './HostLocationFieldForm/HostLocationFieldForm'
import { HostTitleFieldForm } from './HostTitleFieldForm'

export const DELETE_HOST = gql`
  mutation DeleteHost($id: ID!, $teamId: ID!) {
    hostDelete(id: $id, teamId: $teamId) {
      id
    }
  }
`

interface HostFormTabProps {
  handleSelection: (value: 'selection' | 'list') => void
  getAllTeamHostsQuery: (
    options?:
      | Partial<
          LazyQueryHookExecOptions<GetAllTeamHosts, GetAllTeamHostsVariables>
        >
      | undefined
  ) => Promise<QueryResult<GetAllTeamHosts, GetAllTeamHostsVariables>>
}

export function HostForm({
  handleSelection,
  getAllTeamHostsQuery
}: HostFormTabProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { updateHost } = useHostUpdateMutation()
  const [hostDelete] = useMutation<DeleteHost>(DELETE_HOST)
  const [journeyHostUpdate] = useUpdateJourneyHostMutation()
  const createHost = useHostCreate()
  const host = journey?.host

  const initialValues: Required<HostFormValues> = {
    title: journey?.host == null ? '' : journey.host.title,
    location: journey?.host == null ? '' : (journey.host.location ?? '')
  }

  const [name, setName] = useState(initialValues.title)
  const [location, setLocation] = useState(initialValues.location)

  const handleClear = async (): Promise<void> => {
    if (journey?.id == null) return
    if (host != null && journey?.team != null) {
      try {
        await hostDelete({
          variables: { id: host.id, teamId: journey.team.id },
          update(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cache: ApolloCache<any>
          ) {
            cache.evict({
              id: cache.identify({ __typename: 'Host', id: host.id })
            })
          }
        })
      } catch (e) {}
    }
    await journeyHostUpdate({
      variables: { id: journey?.id, input: { hostId: null } }
    })
    if (journey?.team != null) {
      await getAllTeamHostsQuery({ variables: { teamId: journey.team.id } })
    }
    handleSelection('selection')
  }

  const handleTitleChange = async (value: string): Promise<void> => {
    setName(value)
    if (journey?.host != null) {
      const { id, teamId } = journey.host
      await updateHost({ id, teamId, input: { title: value } })
    } else {
      await createHost({
        title: value,
        location
      })
    }
  }

  const handleLocationChange = async (value: string): Promise<void> => {
    setLocation(value)
    if (journey?.host != null) {
      const { id, teamId } = journey.host
      await updateHost({ id, teamId, input: { location: value } })
    } else {
      await createHost({
        title: name,
        location: value
      })
    }
  }

  return (
    <Box data-testid="HostForm">
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: 4, py: 2 }}
      >
        {journey?.host != null ? (
          <Button variant="outlined" size="small" onClick={handleClear}>
            {t('Clear')}
          </Button>
        ) : (
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleSelection('list')}
          >
            {t('Back')}
          </Button>
        )}
      </Stack>
      <Stack sx={{ p: 4 }} gap={6}>
        <HostTitleFieldForm value={name} onChange={handleTitleChange} />
        <HostLocationFieldForm
          value={location}
          onChange={handleLocationChange}
        />
        <HostAvatarsButton />
      </Stack>
      <Divider />
      <Stack sx={{ p: 4 }} direction="row" alignItems="center" gap={3}>
        <AlertCircleIcon />
        <Typography variant="subtitle2">
          {t(
            'Edits: Making changes here will apply to all journeys that share this Host.'
          )}
        </Typography>
      </Stack>
      <Divider />
    </Box>
  )
}
