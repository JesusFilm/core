import FilledInput from '@mui/material/FilledInput'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import AlertTriangle from '@core/shared/ui/icons/AlertTriangle'

import { useUserRoleSuspenseQuery } from '../../../../../../../libs/useUserRoleSuspenseQuery'

import { ChangeButton } from './ChangeButton'
import { CodeDestinationPopper } from './CodeDestinationPopper'
import {
  UserJourneyRole,
  UserTeamRole
} from 'libs/journeys/ui/__generated__/globalTypes'
import { Role } from '../../../../../../../../__generated__/globalTypes'
import { useCurrentUserLazyQuery } from '../../../../../../../libs/useCurrentUserLazyQuery'

interface CodeDestinationProps {
  to?: string
  handleUpdateTo: (url: string) => Promise<void>
}

export function CodeDestination({
  to,
  handleUpdateTo
}: CodeDestinationProps): ReactElement {
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')
  const { loadUser, data: user } = useCurrentUserLazyQuery()
  const { data } = useUserRoleSuspenseQuery()
  const [showRedirectButton, setShowRedirectButton] = useState(false)
  const [disabled, setDisabled] = useState(true)
  const [value, setValue] = useState(to ?? '')

  useEffect(() => {
    setValue(to ?? '')
  }, [to])

  function canEdit(): boolean {
    if (
      user == null ||
      data.getUserRole == null ||
      data.getUserRole.id == null ||
      journey?.userJourneys == null ||
      journey?.team == null
    )
      return false

    const isTemplatePublisher =
      data.getUserRole.roles?.includes(Role.publisher) &&
      journey.template === true
    const isJourneyOwner =
      journey.userJourneys.find(
        (userJourney) => userJourney.user?.id === user.id
      )?.role === UserJourneyRole.owner
    const isTeamManager =
      journey.team.userTeams.find((userTeam) => userTeam.user?.id === user.id)
        ?.role === UserTeamRole.manager

    if (isTemplatePublisher || isJourneyOwner || isTeamManager) {
      return true
    } else {
      return false
    }
  }

  useEffect(() => {
    void loadUser()
    setDisabled(!canEdit() || to == null)
  }, [data, journey, user, to])

  function handleClick(): void {
    setShowRedirectButton(!showRedirectButton)
  }

  async function handleRedirect(): Promise<void> {
    try {
      await handleUpdateTo(value)
    } catch (error) {
      setValue(to ?? '')
    }
  }

  return (
    <Stack spacing={5}>
      <Stack direction="row" justifyContent="space-between">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
          sx={{
            flexGrow: {
              xs: 1,
              sm: 0
            }
          }}
        >
          <Typography variant="subtitle1" color="secondary.dark">
            {t('Code Destination')}
          </Typography>
          <CodeDestinationPopper />
        </Stack>
        <Stack
          direction="row"
          spacing={3}
          sx={{
            display: { xs: 'none', sm: 'flex' }
          }}
        >
          <ChangeButton
            disabled={disabled}
            showRedirectButton={showRedirectButton}
            handleClick={handleClick}
            handleRedirect={handleRedirect}
          />
        </Stack>
      </Stack>
      <FilledInput
        fullWidth
        hiddenLabel
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!showRedirectButton}
      />
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={3}
        sx={{ display: { xs: 'flex', sm: 'none' } }}
      >
        <ChangeButton
          disabled={disabled}
          showRedirectButton={showRedirectButton}
          handleClick={handleClick}
          handleRedirect={handleRedirect}
        />
      </Stack>
      {showRedirectButton && (
        <Stack
          direction="row"
          spacing={3}
          alignItems="center"
          sx={{
            p: 4,
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            display: {
              xs: 'none',
              sm: 'flex'
            }
          }}
        >
          <AlertTriangle />
          <Typography variant="body2" color="secondary.dark">
            {t(
              'After redirection, the QR code will lead to a different journey.'
            )}
          </Typography>
        </Stack>
      )}
    </Stack>
  )
}
