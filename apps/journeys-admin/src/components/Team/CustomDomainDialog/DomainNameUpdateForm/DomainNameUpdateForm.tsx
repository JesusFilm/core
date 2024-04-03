import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import Check from '@core/shared/ui/icons/Check'
import Globe2 from '@core/shared/ui/icons/Globe2'
import InformationCircleContained from '@core/shared/ui/icons/InformationCircleContained'
import LinkExternal from '@core/shared/ui/icons/LinkExternal'

import { CreateCustomDomain } from '../../../../../__generated__/CreateCustomDomain'
import { DeleteCustomDomain } from '../../../../../__generated__/DeleteCustomDomain'
import { GetCustomDomains_customDomains as CustomDomain } from '../../../../../__generated__/GetCustomDomains'
import { useTeam } from '../../TeamProvider'

interface DomainNameUpdateFormProps {
  customDomain?: CustomDomain
  loading?: boolean
}

export const DELETE_CUSTOM_DOMAIN = gql`
  mutation DeleteCustomDomain($customDomainDeleteId: ID!) {
    customDomainDelete(id: $customDomainDeleteId) {
      id
    }
  }
`

export const CREATE_CUSTOM_DOMAIN = gql`
  mutation CreateCustomDomain($input: CustomDomainCreateInput!) {
    customDomainCreate(input: $input) {
      id
      apexName
      name
      journeyCollection {
        id
        journeys {
          id
          title
        }
      }
    }
  }
`

export function DomainNameUpdateForm({
  customDomain,
  loading
}: DomainNameUpdateFormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { activeTeam } = useTeam()

  const [deleteCustomDomain] =
    useMutation<DeleteCustomDomain>(DELETE_CUSTOM_DOMAIN)

  const [createCustomDomain] =
    useMutation<CreateCustomDomain>(CREATE_CUSTOM_DOMAIN)

  const validationSchema = object({
    domainName: string()
      .trim()
      .nonNullable()
      .test('valid-custom-domain', t('Must be a valid URL'), (value) => {
        if (value == null) return true
        const domainRegex =
          /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/g
        return domainRegex.test(value)
      })
      .required(t('Domain name is a required field'))
  })

  const initialValues = {
    domainName: customDomain?.name != null ? customDomain.name : ''
  }

  async function handleSubmit(value, { setValues }): Promise<void> {
    if (customDomain != null) {
      await deleteCustomDomain({
        variables: {
          customDomainDeleteId: customDomain.id
        },
        update: (cache, { data }) => {
          if (data?.customDomainDelete != null) {
            cache.evict({
              id: cache.identify({ ...data.customDomainDelete })
            })
          }
          cache.gc()
        }
      })
      setValues({ domainName: '' })
    } else {
      await createCustomDomain({
        variables: {
          input: {
            name: value.domainName.toLocaleLowerCase().replace(/\s/g, ''),
            teamId: activeTeam?.id
          }
        },
        update: (cache, { data: createCustomDomain }) => {
          if (createCustomDomain?.customDomainCreate != null)
            cache.modify({
              fields: {
                customDomains(existingCustomDomains = []) {
                  const newCustomDomainRef = cache.writeFragment({
                    data: createCustomDomain.customDomainCreate,
                    fragment: gql`
                      fragment NewCustomDomain on CustomDomain {
                        id
                      }
                    `
                  })
                  return [...existingCustomDomains, newCustomDomainRef]
                },
                teams() {
                  cache.writeFragment({
                    data: {
                      customDomains: [createCustomDomain.customDomainCreate]
                    },
                    fragment: gql`
                      fragment UpdatedTeam on Team {
                        id
                        customDomains {
                          id
                        }
                      }
                    `,
                    id: cache.identify({
                      id: activeTeam?.id,
                      __typename: activeTeam?.__typename
                    })
                  })
                }
              }
            })
        },
        onError: (e) => {
          let errorMessage = t(
            'Something went wrong, please reload the page and try again'
          )
          if (
            e.message.includes(
              'Unique constraint failed on the fields: (`name`)'
            )
          ) {
            errorMessage = t(
              'This domain is already connected to another NextSteps Team'
            )
          }
          if (e.message.includes("it's already in use by your account.")) {
            errorMessage = t(
              "Cannot add this domain since it's already in use by your accound"
            )
          }
          enqueueSnackbar(errorMessage, {
            variant: 'error',
            preventDuplicate: false
          })
        },
        onCompleted: () => {
          enqueueSnackbar(t('Custom domain updated'), {
            variant: 'success',
            preventDuplicate: false
          })
        }
      })
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {({ values, isSubmitting, errors, handleChange, handleSubmit }) => (
        <Stack spacing={8}>
          <Stack direction="row" spacing={3}>
            <InformationCircleContained sx={{ color: 'secondary.light' }} />
            <Stack spacing={4}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Typography variant="subtitle1">
                  {t('Custom Domain Setup')}
                </Typography>
                <Button
                  endIcon={<LinkExternal />}
                  variant="text"
                  sx={{ py: 0 }}
                  href="https://support.nextstep.is/article/1365-custom-domains"
                  target="_blank"
                >
                  <Typography variant="body2"> {t('Instructions')}</Typography>
                </Button>
              </Stack>
              <Typography variant="body2">
                {t(
                  'NextSteps provides all journeys with a your.nextstep.is URL. However, to provide greater personalization and flexibility to your team, you can instead add a custom domain. To get started you’ll need to purchase a domain, complete the form below, and point it to NextSteps servers.'
                )}
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={3} alignItems="start">
            <Globe2
              sx={{
                color: 'secondary.light',
                '&.MuiSvgIcon-root.MuiSvgIcon-fontSizeMedium': {
                  mt: '6px'
                }
              }}
            />
            <TextField
              disabled={loading === true || isSubmitting}
              id="domainName"
              name="domainName"
              focused
              fullWidth
              value={values.toLocaleLowerCase().replace(/\s/g, '')}
              placeholder="your.nextstep.is"
              variant="outlined"
              error={errors.domainName != null}
              onChange={handleChange}
              helperText={
                errors.domainName != null ? <>{errors.domainName}</> : null
              }
              label={t('Domain Name')}
              size="medium"
              InputProps={{
                readOnly: customDomain?.name != null || loading === true
              }}
              sx={{
                '.MuiInputBase-input.MuiOutlinedInput-input': {
                  height: '12px'
                },
                '&>.MuiInputLabel-root.Mui-focused': {
                  color: 'secondary.light'
                },
                '&>.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':
                  {
                    borderColor: 'secondary.light'
                  }
              }}
            />
            <Box>
              <Button
                disabled={loading === true}
                onClick={async () => handleSubmit()}
                sx={{
                  color: 'secondary.light',
                  borderColor: 'secondary.light',
                  height: '45px'
                }}
                startIcon={
                  customDomain?.name != null ? (
                    <></>
                  ) : (
                    <Check sx={{ color: 'secondary.light' }} />
                  )
                }
                variant="outlined"
              >
                {customDomain?.name != null ? t('Disconnect') : t('Connect')}
              </Button>
            </Box>
          </Stack>
        </Stack>
      )}
    </Formik>
  )
}
