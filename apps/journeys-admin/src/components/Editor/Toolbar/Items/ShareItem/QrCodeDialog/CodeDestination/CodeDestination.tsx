import FilledInput from '@mui/material/FilledInput'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useRef, useState } from 'react'

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
import { gql, useLazyQuery, useQuery } from '@apollo/client'
import {
  GetUserPermissions,
  GetUserPermissionsVariables
} from '../../../../../../../../__generated__/GetUserPermissions'

export const GET_USER_PERMISSIONS = gql`
  query GetUserPermissions($id: ID!) {
    adminJourney(id: $id, idType: databaseId) {
      id
      template
      team {
        id
        userTeams {
          id
          role
          user {
            email
          }
        }
      }
      userJourneys {
        id
        role
        user {
          email
        }
      }
    }
  }
`

const RedirectDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/EditorToolbar/ShareButton/QrCodeDialog/RedirectDialog" */
      '../RedirectDialog'
    ).then((mod) => mod.RedirectDialog),
  { ssr: false }
)

interface CodeDestinationProps {
  journeyId?: string
  qrCodeId?: string
  to?: string
  handleUpdateTo: (url: string) => Promise<void>
}

export function CodeDestination({
  journeyId,
  qrCodeId,
  to,
  handleUpdateTo
}: CodeDestinationProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { loadUser, data: user } = useCurrentUserLazyQuery()
  const { data } = useUserRoleSuspenseQuery()
  const [showRedirectButton, setShowRedirectButton] = useState(false)
  const [showRedirectDialog, setShowRedirectDialog] = useState(false)
  const [disabled, setDisabled] = useState(true)
  const [value, setValue] = useState(to ?? '')
  const [loadUserPermissions, { data: journeyData }] = useLazyQuery<
    GetUserPermissions,
    GetUserPermissionsVariables
  >(GET_USER_PERMISSIONS)

  useEffect(() => {
    if (journeyId != null) {
      void loadUserPermissions({ variables: { id: journeyId } })
    }
  }, [journeyId])

  useEffect(() => {
    setValue(to ?? '')
  }, [to])

  const originalToRef = useRef(to)

  function canEdit(): boolean {
    if (
      user == null ||
      data.getUserRole == null ||
      data.getUserRole.id == null ||
      journeyData?.adminJourney?.userJourneys == null ||
      journeyData?.adminJourney?.team == null
    )
      return false

    const isTemplatePublisher =
      data.getUserRole.roles?.includes(Role.publisher) &&
      journeyData.adminJourney.template === true
    const isJourneyOwner =
      journeyData?.adminJourney?.userJourneys.find(
        (userJourney) => userJourney.user?.email === user.email
      )?.role === UserJourneyRole.owner
    const isTeamManager =
      journeyData?.adminJourney?.team.userTeams.find(
        (userTeam) => userTeam.user?.email === user.email
      )?.role === UserTeamRole.manager

    if (isTemplatePublisher || isJourneyOwner || isTeamManager) {
      return true
    } else {
      return false
    }
  }

  useEffect(() => {
    void loadUser()
    setDisabled(!canEdit() || to == null)
  }, [data, journeyData, user, to])

  function handleClick(): void {
    setShowRedirectButton(!showRedirectButton)
  }

  async function handleRedirect(): Promise<void> {
    if (value === originalToRef.current) return
    try {
      await handleUpdateTo(value)
      setShowRedirectDialog(true)
    } catch (error) {
      setValue(to ?? '')
    }
  }

  async function handleUndo(): Promise<void> {
    if (originalToRef.current == null) return
    try {
      await handleUpdateTo(originalToRef.current)
    } catch {
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
      {showRedirectDialog &&
        to != null &&
        originalToRef.current != null &&
        qrCodeId != null && (
          <RedirectDialog
            open={showRedirectDialog}
            onClose={() => setShowRedirectDialog(false)}
            to={to}
            handleUndo={handleUndo}
          />
        )}
    </Stack>
  )
}
