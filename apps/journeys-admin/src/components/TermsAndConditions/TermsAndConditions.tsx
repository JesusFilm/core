import { gql, useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useUser } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '@core/journeys/ui/useUpdateLastActiveTeamIdMutation'
import AlertCircleIcon from '@core/shared/ui/icons/AlertCircle'
import ArrowRightSmIcon from '@core/shared/ui/icons/ArrowRightSm'
import CheckSquareBrokenIcon from '@core/shared/ui/icons/CheckSquareBroken'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

import { JourneyProfileCreate } from '../../../__generated__/JourneyProfileCreate'
import { UpdateLastActiveTeamId } from '../../../__generated__/UpdateLastActiveTeamId'
import { useTeamCreateMutation } from '../../libs/useTeamCreateMutation'
import { ONBOARDING_TEMPLATE_ID } from '../Team/TeamOnboarding/TeamOnboarding'

import { TermsListItem } from './TermsListItem'

export const JOURNEY_PROFILE_CREATE = gql`
  mutation JourneyProfileCreate {
    journeyProfileCreate {
      id
      userId
      acceptedTermsAt
    }
  }
`

export function TermsAndConditions(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const user = useUser()
  const [teamCreate] = useTeamCreateMutation()
  const [journeyProfileCreate] = useMutation<JourneyProfileCreate>(
    JOURNEY_PROFILE_CREATE
  )
  const [journeyDuplicate] = useJourneyDuplicateMutation()
  const [updateLastActiveTeamId] = useMutation<UpdateLastActiveTeamId>(
    UPDATE_LAST_ACTIVE_TEAM_ID
  )
  const { query, setActiveTeam } = useTeam()

  const router = useRouter()

  const handleJourneyProfileCreate = async (): Promise<void> => {
    let displayName = user?.displayName
    // displayName may not be set for email pass login
    if (displayName == null && user?.email != null) {
      displayName = user?.email?.split('@')[0]
    }
    if (displayName == null) return

    setLoading(true)
    await journeyProfileCreate()

    const { data: teamCreateData } = await teamCreate({
      variables: {
        input: {
          title: t('{{ displayName }} & Team', {
            displayName
          }),
          publicTitle: t('{{ displayName }} Team', {
            displayName: displayName.charAt(0)
          })
        }
      }
    })

    if (teamCreateData?.teamCreate != null) {
      await Promise.allSettled([
        journeyDuplicate({
          variables: {
            id: ONBOARDING_TEMPLATE_ID,
            teamId: teamCreateData.teamCreate.id
          }
        }),
        updateLastActiveTeamId({
          variables: {
            input: {
              lastActiveTeamId: teamCreateData.teamCreate.id
            }
          }
        }),
        router.push(
          router.query.redirect != null
            ? new URL(
                `${window.location.origin}${router.query.redirect as string}`
              )
            : '/?onboarding=true'
        ),
        query
          .refetch()
          .then(() =>
            console.log('[TermsAndConditions] Team data refetched successfully')
          )
      ])

      setActiveTeam(teamCreateData.teamCreate)
    }
    setLoading(false)
  }

  return (
    <>
      <Typography variant="subtitle1">
        {t('Before you start, please review these documents:')}
      </Typography>
      <List
        sx={{
          bgcolor: 'background.paper',
          borderRadius: '6px',
          overflow: 'hidden'
        }}
        disablePadding
      >
        <TermsListItem
          link="https://your.nextstep.is/terms-of-use"
          icon={<AlertCircleIcon sx={{ color: 'secondary.light' }} />}
          text={t('Terms of Use')}
        />
        <Divider component="li" />
        <TermsListItem
          link="https://your.nextstep.is/end-user-license-agreement"
          icon={<UsersProfiles2Icon sx={{ color: 'secondary.light' }} />}
          text={t('End User License Agreement')}
        />
        <Divider component="li" />
        <TermsListItem
          link="https://your.nextstep.is/community-guidelines"
          icon={<CheckSquareBrokenIcon sx={{ color: 'secondary.light' }} />}
          text={t('Community Guidelines')}
        />
        <Divider component="li" />
        <ListItemButton onClick={() => setAccepted(!accepted)}>
          <ListItemIcon sx={{ minWidth: 44 }}>
            <Checkbox
              edge="start"
              checked={accepted}
              tabIndex={-1}
              disableRipple
              inputProps={{ 'aria-labelledby': 'i-agree-label' }}
              sx={{ p: 0, ml: 0 }}
            />
          </ListItemIcon>
          <ListItemText
            id="i-agree-label"
            primary={
              <Typography variant="body1" color="secondary.dark">
                {t('I agree with listed above conditions and requirements')}
              </Typography>
            }
          />
        </ListItemButton>
      </List>
      <Button
        data-testid="TermsAndConditionsNextButton"
        variant="contained"
        disabled={!accepted || loading}
        onClick={handleJourneyProfileCreate}
        sx={{
          height: 54,
          width: '100%',
          borderRadius: '12px',
          bgcolor: 'secondary.dark',
          py: 3.25,
          color: 'secondary.contrastText',
          '&:hover': {
            bgcolor: 'secondary.dark'
          }
        }}
        endIcon={!loading && <ArrowRightSmIcon />}
      >
        {loading ? <CircularProgress size={20} /> : t('Next')}
      </Button>
    </>
  )
}
