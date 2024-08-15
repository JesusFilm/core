import { useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form } from 'formik'
import { useRouter } from 'next/router'
import { User } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '@core/journeys/ui/useUpdateLastActiveTeamIdMutation'
import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'

import { TeamCreate } from '../../../../__generated__/TeamCreate'
import { UpdateLastActiveTeamId } from '../../../../__generated__/UpdateLastActiveTeamId'
import { TeamCreateForm } from '../TeamCreateForm'

export const ONBOARDING_TEMPLATE_ID = '9d9ca229-9fb5-4d06-a18c-2d1a4ceba457'

interface TeamOnboardingProps {
  user?: User
}

export function TeamOnboarding({ user }: TeamOnboardingProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [journeyDuplicate] = useJourneyDuplicateMutation()
  const router = useRouter()
  const { query, setActiveTeam } = useTeam()
  const [updateLastActiveTeamId] = useMutation<UpdateLastActiveTeamId>(
    UPDATE_LAST_ACTIVE_TEAM_ID
  )

  async function handleSubmit(data?: TeamCreate | null): Promise<void> {
    if (data?.teamCreate.id == null) return
    await Promise.all([
      journeyDuplicate({
        variables: {
          id: ONBOARDING_TEMPLATE_ID,
          teamId: data.teamCreate.id
        }
      }),
      updateLastActiveTeamId({
        variables: {
          input: {
            lastActiveTeamId: data.teamCreate.id
          }
        }
      }),
      await router.push(
        router.query.redirect != null
          ? new URL(
              `${window.location.origin}${router.query.redirect as string}`
            )
          : '/?onboarding=true'
      ),
      query.refetch()
    ])
    setActiveTeam(data.teamCreate)
  }

  return (
    <TeamCreateForm
      onSubmit={async (_, __, data) => await handleSubmit(data)}
      onboarding
      user={user}
    >
      {({
        values,
        errors,
        handleChange,
        handleSubmit,
        isValid,
        isSubmitting
      }) => (
        <Form>
          <Stack spacing={4}>
            <TextField
              id="title"
              name="title"
              fullWidth
              value={values.title}
              variant="filled"
              error={Boolean(errors.title)}
              onChange={handleChange}
              helperText={
                errors.title !== undefined
                  ? errors.title
                  : t('Private: Visible only to your team')
              }
              label={t('Team Name')}
            />
            <TextField
              id="publicTitle"
              name="publicTitle"
              fullWidth
              value={values.publicTitle}
              variant="filled"
              error={Boolean(errors.publicTitle)}
              onChange={handleChange}
              helperText={
                errors.publicTitle !== undefined
                  ? errors.publicTitle
                  : t('Public: Anyone can view it')
              }
              label={t('Legal Name')}
              placeholder={values.title}
            />

            <Stack direction="row" spacing={3} color="text.secondary">
              <InformationCircleContainedIcon
                sx={{ color: 'secondary.light' }}
              />
              <Typography
                variant="caption"
                color="secondary.light"
                gutterBottom
              >
                {t(
                  'When visitors click the info icon, they will see text from the Legal Name box. This text can be a mission name, website title, or other public information.'
                )}
              </Typography>
            </Stack>

            <Typography gutterBottom>
              {t(
                'Create your workspace to hold your NextStep journeys and collaborate with others.'
              )}
            </Typography>
            <Button
              variant="contained"
              onClick={() => handleSubmit()}
              disabled={!isValid || isSubmitting}
              color="secondary"
            >
              {t('Create')}
            </Button>
          </Stack>
        </Form>
      )}
    </TeamCreateForm>
  )
}
