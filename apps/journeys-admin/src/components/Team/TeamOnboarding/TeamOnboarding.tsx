import { ReactElement } from 'react'
import Image from 'next/image'
import Box from '@mui/system/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { Form } from 'formik'
import { useRouter } from 'next/router'
import Divider from '@mui/material/Divider'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import taskbarIcon from '../../../../public/taskbar-icon.svg'
import { TeamCreateForm } from '../TeamCreateForm'
import { useTeam } from '../TeamProvider'
import { TeamManageWrapper } from '../TeamManageDialog/TeamManageWrapper'

export function TeamOnboarding(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const router = useRouter()
  const { activeTeam } = useTeam()

  return (
    <Stack
      justifyContent="space-evenly"
      alignItems="center"
      sx={{ height: '100vh', minHeight: 600 }}
    >
      <Stack alignItems="center" sx={{ maxWidth: { xs: 311, md: 397 } }}>
        <Box sx={{ mb: 10, flexShrink: 0 }}>
          <Image src={taskbarIcon} alt="Next Steps" height={43} width={43} />
        </Box>
        {activeTeam != null ? (
          <TeamManageWrapper>
            {({
              data,
              userTeamList,
              userTeamInviteList,
              userTeamInviteForm
            }) => (
              <Card sx={{ width: { sm: '444px' } }}>
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
                <CardContent sx={{ px: 6, py: 4 }}>
                  <Stack direction="row" alignItems="center" sx={{ mb: 4 }}>
                    <GroupAddIcon />
                    <Typography variant="subtitle1" sx={{ marginLeft: 3 }}>
                      Invite team members
                    </Typography>
                  </Stack>
                  {userTeamInviteForm}
                </CardContent>
                <CardContent
                  sx={{
                    padding: 2,
                    display: 'flex',
                    justifyContent: 'flex-end'
                  }}
                >
                  <Button onClick={async () => await router?.push('/')}>
                    {(data?.userTeamInvites ?? []).length > 0
                      ? t('Continue')
                      : t('Skip')}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TeamManageWrapper>
        ) : (
          <TeamCreateForm>
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
                        fullWidth
                        variant="filled"
                        hiddenLabel
                        id="title"
                        name="title"
                        value={values.title}
                        error={Boolean(errors.title)}
                        onChange={handleChange}
                        helperText={errors.title}
                        autoFocus
                      />
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
      </Stack>
      <Link
        variant="body2"
        underline="none"
        sx={{
          color: 'primary.main',
          cursor: 'pointer'
        }}
        href="mailto:support@nextstep.is?subject=A question about the terms and conditions form"
      >
        {t('Feedback & Support')}
      </Link>
    </Stack>
  )
}
