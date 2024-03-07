import { gql, useMutation, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Form, Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { Dialog } from '@core/shared/ui/Dialog/Dialog'
import Check from '@core/shared/ui/icons/Check'
import CopyLeft from '@core/shared/ui/icons/CopyLeft'

import { CreateCustomDomain } from '../../../../__generated__/CreateCustomDomain'
import { DeleteCustomDomain } from '../../../../__generated__/DeleteCustomDomain'
import { GetCustomDomain } from '../../../../__generated__/GetCustomDomain'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { useAdminJourneysQuery } from '../../../libs/useAdminJourneysQuery'
import { useTeam } from '../TeamProvider'

interface CustomDomainDialogProps {
  open: boolean
  onClose: () => void
}

export const GET_CUSTOM_DOMAIN = gql`
  query GetCustomDomain($teamId: ID!) {
    customDomains(teamId: $teamId) {
      hostName
      defaultJourneysOnly
      id
      teamId
    }
  }
`

export const CREATE_CUSTOM_DOMAIN = gql`
  mutation CreateCustomDomain($teamId: ID!, $input: CustomDomainCreateInput!) {
    customDomainCreate(teamId: $teamId, input: $input) {
      id
      hostName
      defaultJourneysOnly
    }
  }
`

export const DELETE_CUSTOM_DOMAIN = gql`
  mutation DeleteCustomDomain($customDomainDeleteId: ID!) {
    customDomainDelete(id: $customDomainDeleteId) {
      id
      hostName
      defaultJourneysOnly
    }
  }
`

export function CustomDomainDialog({
  open,
  onClose
}: CustomDomainDialogProps): ReactElement {
  const { data: journeysData } = useAdminJourneysQuery({
    status: [JourneyStatus.draft, JourneyStatus.published],
    useLastActiveTeamId: true
  })

  const { activeTeam } = useTeam()
  const { data: customDomainData } = useQuery<GetCustomDomain>(
    GET_CUSTOM_DOMAIN,
    {
      variables: { teamId: activeTeam?.id }
    }
  )

  const [createCustomDomain] =
    useMutation<CreateCustomDomain>(CREATE_CUSTOM_DOMAIN)

  const [deleteCustomDomain] =
    useMutation<DeleteCustomDomain>(DELETE_CUSTOM_DOMAIN)

  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')
  const validationSchema = object({
    domainName: string()
      .trim()
      .nonNullable()
      .required(t('Domain name is a required field'))
  })
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  async function handleCopyClick(value): Promise<void> {
    await navigator.clipboard.writeText(value ?? '')
    enqueueSnackbar('Address copied', {
      variant: 'success',
      preventDuplicate: true
    })
  }

  async function handleSubmit(value, { resetForm }): Promise<void> {
    if (
      customDomainData?.customDomains != null &&
      customDomainData?.customDomains?.length !== 0
    ) {
      await deleteCustomDomain({
        variables: { id: customDomainData?.customDomains[0].id }
      })
      resetForm()
    } else {
      await createCustomDomain({
        variables: {
          teamId: activeTeam?.id,
          input: { hostName: value.domainName, defaultJourneysOnly: true }
        }
      })
    }
    enqueueSnackbar('Custom domain updated', {
      variant: 'success',
      preventDuplicate: false
    })
  }

  async function handleOnChange(e: SelectChangeEvent): Promise<void> {
    console.log('here')
    console.log(e.target.value)
    enqueueSnackbar('Custom domain updated', {
      variant: 'success',
      preventDuplicate: false
    })
  }

  const initialValues = {
    domainName:
      customDomainData?.customDomains != null
        ? customDomainData?.customDomains[0]?.hostName
        : ''
  }

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {({ values, errors, handleChange, handleSubmit, resetForm }) => (
        <Dialog
          open={open}
          onClose={onClose}
          divider
          dialogTitle={{ title: t('Custom Domain Settings') }}
          fullscreen={!smUp}
        >
          <Form>
            <Stack spacing={10}>
              <Stack spacing={4}>
                <Typography variant="subtitle1">
                  {t('Your domain name')}
                </Typography>
                <TextField
                  id="domainName"
                  name="domainName"
                  fullWidth
                  value={values.domainName}
                  variant="filled"
                  error={Boolean(errors.domainName)}
                  onChange={handleChange}
                  helperText={
                    errors.domainName !== undefined
                      ? (errors.domainName as string)
                      : null
                  }
                  label={t('Domain Name')}
                  InputProps={{
                    endAdornment: (
                      <Button onClick={async () => handleSubmit()}>
                        {customDomainData?.customDomains?.length !== 0 &&
                        customDomainData?.customDomains != null
                          ? t('Delete')
                          : t('Update')}
                      </Button>
                    )
                  }}
                />
              </Stack>
              {customDomainData?.customDomains?.length !== 0 &&
                customDomainData?.customDomains != null && (
                  <Stack spacing={4}>
                    <Typography variant="subtitle1">
                      {t('Default Journey')}
                    </Typography>
                    <Stack direction="row" justifyContent="space-between">
                      <Select
                        fullWidth
                        id="defaultJourney"
                        name="defaultJourney"
                        onChange={handleOnChange}
                      >
                        {journeysData?.journeys.map((journey) => (
                          <MenuItem value={journey.id} key={journey.id}>
                            {journey.title}
                          </MenuItem>
                        ))}
                      </Select>
                    </Stack>
                  </Stack>
                )}
              {customDomainData?.customDomains?.length !== 0 &&
                customDomainData?.customDomains != null && (
                  <Stack spacing={4}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="subtitle1">
                        {t('DNS Config')}
                      </Typography>
                      <Chip
                        icon={
                          <Check
                            sx={{
                              borderRadius: 777,
                              backgroundColor: 'success.main',
                              '&.MuiSvgIcon-root': { color: 'background.paper' }
                            }}
                          />
                        }
                        label="Status"
                      />
                    </Stack>
                    <Stack spacing={4}>
                      <Stack direction="row" sx={{ width: '100%' }}>
                        <Box
                          sx={{
                            border: '2px solid',
                            borderColor: 'divider',
                            color: 'secondary.light',
                            borderRadius: '8px 0px 0px 8px',
                            p: 4,
                            width: '33%'
                          }}
                        >
                          {t('A')}
                        </Box>
                        <Box
                          sx={{
                            borderTop: '2px solid',
                            borderBottom: '2px solid',
                            borderColor: 'divider',
                            color: 'secondary.light',
                            p: 4,
                            width: '33%'
                          }}
                        >
                          {t('@')}
                        </Box>
                        <Box
                          sx={{
                            border: '2px solid',
                            borderRadius: '0px 8px 8px 0px',
                            borderColor: 'divider',
                            color: 'secondary.light',
                            pl: 4,
                            width: '33%'
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            height="100%"
                            justifyContent="space-between"
                          >
                            {t('76.76.21.21')}
                            {smUp && (
                              <IconButton
                                onClick={async () =>
                                  await handleCopyClick('76.76.21.21')
                                }
                                aria-label="Copy"
                              >
                                <CopyLeft />
                              </IconButton>
                            )}
                          </Stack>
                        </Box>
                      </Stack>
                      <Stack direction="row" sx={{ width: '100%' }}>
                        <Box
                          sx={{
                            border: '2px solid',
                            borderColor: 'divider',
                            color: 'secondary.light',
                            borderRadius: '8px 0px 0px 8px',
                            p: 4,
                            width: '33%'
                          }}
                        >
                          {t('CNAME')}
                        </Box>
                        <Box
                          sx={{
                            borderTop: '2px solid',
                            borderBottom: '2px solid',
                            borderColor: 'divider',
                            color: 'secondary.light',
                            p: 4,
                            width: '33%'
                          }}
                        >
                          {t('@')}
                        </Box>
                        <Box
                          sx={{
                            border: '2px solid',
                            borderRadius: '0px 8px 8px 0px',
                            borderColor: 'divider',
                            color: 'secondary.light',
                            pl: 4,
                            width: '33%'
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            height="100%"
                            justifyContent="space-between"
                          >
                            {t('cname.vercel-dns.com')}
                            {smUp && (
                              <IconButton
                                onClick={async () =>
                                  await handleCopyClick('cname.vercel-dns.com')
                                }
                                aria-label="Copy"
                              >
                                <CopyLeft />
                              </IconButton>
                            )}
                          </Stack>
                        </Box>
                      </Stack>
                    </Stack>
                  </Stack>
                )}
            </Stack>
          </Form>
        </Dialog>
      )}
    </Formik>
  )
}
