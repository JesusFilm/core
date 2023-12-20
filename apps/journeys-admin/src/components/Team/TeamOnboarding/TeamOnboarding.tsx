import { useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form } from 'formik'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

import { UpdateLastActiveTeamId } from '../../../../__generated__/UpdateLastActiveTeamId'
import { useJourneyDuplicateMutation } from '../../../libs/useJourneyDuplicateMutation'
import { TeamCreateForm } from '../TeamCreateForm'
import { TeamManageWrapper } from '../TeamManageDialog/TeamManageWrapper'
import { useTeam } from '../TeamProvider'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '../TeamSelect/TeamSelect'

export const ONBOARDING_TEMPLATE_ID = '9d9ca229-9fb5-4d06-a18c-2d1a4ceba457'

export function TeamOnboarding(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [journeyDuplicate] = useJourneyDuplicateMutation()
  const router = useRouter()
  const { query, activeTeam, setActiveTeam } = useTeam()
  const [updateLastActiveTeamId] = useMutation<UpdateLastActiveTeamId>(
    UPDATE_LAST_ACTIVE_TEAM_ID
  )

  return (
    <>
      {activeTeam != null ? (
        <TeamManageWrapper>
          {({ data, userTeamList, userTeamInviteList, userTeamInviteForm }) => (
            <Card sx={{ width: { sm: '444px' }, borderRadius: '6px' }}>
              <CardHeader
                title={t('Invite Teammates', {
                  title: activeTeam.title
                })}
                titleTypographyProps={{ variant: 'h6' }}
                sx={{ py: 5, px: 6 }}
              />
              <Divider />

              <CardContent
                sx={{ padding: 6, maxHeight: '300px', overflowY: 'auto' }}
              >
                {userTeamList}
                {userTeamInviteList}
              </CardContent>

              <Divider />
              <Stack direction="row" alignItems="center" sx={{ mt: 4, mx: 6 }}>
                <UsersProfiles2Icon />
                <Typography variant="subtitle1" sx={{ ml: 3 }}>
                  {t('Invite team members')}
                </Typography>
              </Stack>
              <CardContent sx={{ px: 6, py: 4 }}>
                {userTeamInviteForm}
              </CardContent>
              <CardContent
                sx={{
                  padding: 2,
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}
              >
                <Button
                  onClick={async () => {
                    const redirect =
                      router.query.redirect != null
                        ? new URL(
                            `${window.location.origin}${
                              router.query.redirect as string
                            }`
                          )
                        : '/?onboarding=true'
                    await router.push(redirect)
                  }}
                >
                  {(data?.userTeamInvites ?? []).length > 0
                    ? t('Continue')
                    : t('Skip')}
                </Button>
              </CardContent>
            </Card>
          )}
        </TeamManageWrapper>
      ) : (
        <TeamCreateForm
          onSubmit={async (_, __, data) => {
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
              query.refetch()
            ])
            setActiveTeam(data.teamCreate)
          }}
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
              <Card>
                <CardHeader
                  title={t('Create Team')}
                  titleTypographyProps={{ variant: 'h6' }}
                  sx={{ py: 5, px: 6 }}
                />
                <CardContent sx={{ p: 6 }}>
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
                          : 'Private: Visible only to your team'
                      }
                      label="Team Name"
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
                          : 'Public: Anyone can view it'
                      }
                      label="Legal Name"
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
                        'Create a team to hold your NextStep journeys and collaborate with others.'
                      )}
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', px: 4 }}>
                  <Button
                    onClick={() => handleSubmit()}
                    disabled={!isValid || isSubmitting}
                  >
                    {t('Create')}
                  </Button>
                </CardActions>
              </Card>
            </Form>
          )}
        </TeamCreateForm>
      )}
    </>
  )
}
