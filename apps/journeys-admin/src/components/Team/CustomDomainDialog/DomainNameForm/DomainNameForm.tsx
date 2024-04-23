import { gql, useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { ObjectSchema, object, string } from 'yup'

import {
  CreateCustomDomain,
  CreateCustomDomainVariables
} from '../../../../../__generated__/CreateCustomDomain'
import {
  DeleteCustomDomain,
  DeleteCustomDomainVariables
} from '../../../../../__generated__/DeleteCustomDomain'
import { GetCustomDomains_customDomains as CustomDomain } from '../../../../../__generated__/GetCustomDomains'
import { CustomDomainCreateInput } from '../../../../../__generated__/globalTypes'
import { useTeam } from '../../TeamProvider'

interface DomainNameFormProps {
  customDomain?: CustomDomain
  loading?: boolean
}

export const DELETE_CUSTOM_DOMAIN = gql`
  mutation DeleteCustomDomain($customDomainId: ID!) {
    customDomainDelete(id: $customDomainId) {
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

export function DomainNameForm({
  customDomain,
  loading
}: DomainNameFormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { activeTeam } = useTeam()
  const [deleteCustomDomain] = useMutation<
    DeleteCustomDomain,
    DeleteCustomDomainVariables
  >(DELETE_CUSTOM_DOMAIN)
  const [createCustomDomain] = useMutation<
    CreateCustomDomain,
    CreateCustomDomainVariables
  >(CREATE_CUSTOM_DOMAIN)

  const validationSchema: ObjectSchema<Pick<CustomDomainCreateInput, 'name'>> =
    object({
      name: string()
        .trim()
        .required(t('Domain name is a required field'))
        .matches(
          // pulled from isDomainValid function
          // apps/api-journeys/src/app/modules/customDomain/customDomain.service.ts
          /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z]$/,
          t('Must be a valid URL')
        )
    })

  const initialValues: Pick<CustomDomainCreateInput, 'name'> = {
    name: customDomain?.name ?? ''
  }

  async function handleDisconnect(): Promise<void> {
    if (customDomain != null) {
      await deleteCustomDomain({
        variables: {
          customDomainId: customDomain.id
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
    }
  }

  async function handleSubmit(value: typeof initialValues): Promise<void> {
    await createCustomDomain({
      variables: {
        input: {
          ...value,
          teamId: activeTeam?.id as string
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
        // asserting by string contains rather than error code as error code for duplicate domain name and invalid domain name are the same
        let errorMessage = t(
          'Something went wrong, please reload the page and try again'
        )
        if (e.message.includes('custom domain already exists')) {
          errorMessage = t(
            'This domain is already connected to another NextSteps Team'
          )
        }
        if (e.message.includes("it's already in use by your account.")) {
          errorMessage = t(
            'This domain is already connected to another NextSteps Team'
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

  return customDomain == null && loading !== true ? (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {({
        values,
        isSubmitting,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit
      }) => (
        <>
          <TextField
            disabled={isSubmitting}
            id="name"
            name="name"
            autoFocus
            autoComplete="off"
            fullWidth
            value={values.name}
            placeholder="your.nextstep.is"
            variant="filled"
            error={errors.name != null}
            onChange={handleChange}
            onBlur={handleBlur}
            helperText={
              <>
                {touched.name != null && errors.name != null
                  ? errors.name
                  : ' '}
              </>
            }
            label={t('Domain Name')}
          />
          <Button
            disabled={isSubmitting}
            onClick={() => handleSubmit()}
            sx={{ width: 120, height: 55 }}
          >
            {t('Connect')}
          </Button>
        </>
      )}
    </Formik>
  ) : (
    <>
      <TextField
        id="name"
        name="name"
        fullWidth
        value={customDomain?.name}
        placeholder="your.nextstep.is"
        variant="filled"
        hiddenLabel
        InputProps={{ readOnly: true }}
      />
      <Button
        disabled={customDomain == null && loading === true}
        onClick={async () => await handleDisconnect()}
        sx={{ width: 120, height: 55 }}
      >
        {customDomain == null && loading === true
          ? t('Connect')
          : t('Disconnect')}
      </Button>
    </>
  )
}
