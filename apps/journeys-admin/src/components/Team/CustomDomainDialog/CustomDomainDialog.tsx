import { gql, useMutation, useQuery } from '@apollo/client'
import { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Form, Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { object, string } from 'yup'

import { Dialog } from '@core/shared/ui/Dialog/Dialog'

import { CreateCustomDomain } from '../../../../__generated__/CreateCustomDomain'
import { DeleteCustomDomain } from '../../../../__generated__/DeleteCustomDomain'
import { GetCustomDomain } from '../../../../__generated__/GetCustomDomain'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { JourneyCollectionCreate } from '../../../../__generated__/JourneyCollectionCreate'
import { useAdminJourneysQuery } from '../../../libs/useAdminJourneysQuery'
import { useTeam } from '../TeamProvider'

import { DefaultJourneyForm } from './DefaultJourneyForm'
import { DialogUpdateForm } from './DialogUpdateForm'
import { DNSConfigSection } from './DNSConfigSection'

interface CustomDomainDialogProps {
  open: boolean
  onClose: () => void
}

export const GET_CUSTOM_DOMAIN = gql`
  query GetCustomDomain($teamId: ID!) {
    customDomains(teamId: $teamId) {
      id
      apexName
      allowOutsideJourneys
      verification {
        verified
        verification {
          domain
          reason
          type
          value
        }
      }
      teamId
      name
      journeyCollection {
        id
        journeys {
          title
          id
        }
      }
    }
  }
`

export const CREATE_CUSTOM_DOMAIN = gql`
  mutation CreateCustomDomain($input: CustomDomainCreateInput!) {
    customDomainCreate(input: $input) {
      id
      apexName
      name
      allowOutsideJourneys
      verification {
        verified
        verification {
          domain
          reason
          type
          value
        }
      }
    }
  }
`

export const DELETE_CUSTOM_DOMAIN = gql`
  mutation DeleteCustomDomain($customDomainDeleteId: ID!) {
    customDomainDelete(id: $customDomainDeleteId) {
      id
    }
  }
`

export const JOURNEY_COLLECTION_CREATE = gql`
  mutation JourneyCollectionCreate(
    $journeyCollectionInput: JourneyCollectionCreateInput!
    $customDomainUpdateInput: CustomDomainUpdateInput!
  ) {
    journeyCollectionCreate(input: $journeyCollectionInput) {
      id
      journeys {
        id
        title
      }
    }
    customDomainUpdate(input: $customDomainUpdateInput) {
      id
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

  const [journeyCollectionCreate] = useMutation<JourneyCollectionCreate>(
    JOURNEY_COLLECTION_CREATE
  )

  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')
  const validationSchema = object({
    domainName: string()
      .trim()
      .nonNullable()
      .required(t('Domain name is a required field'))
  })
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  async function handleSubmit(value, { resetForm }): Promise<void> {
    if (
      customDomainData?.customDomains != null &&
      customDomainData?.customDomains?.length !== 0
    ) {
      await deleteCustomDomain({
        variables: {
          customDomainDeleteId: customDomainData?.customDomains[0].id
        }
      })
      resetForm()
    } else {
      await createCustomDomain({
        variables: {
          input: {
            name: value.domainName,
            defaultJourneysOnly: true,
            teamId: activeTeam?.id
          }
        }
      })
    }
    enqueueSnackbar('Custom domain updated', {
      variant: 'success',
      preventDuplicate: false
    })
  }

  async function handleOnChange(e: SelectChangeEvent): Promise<void> {
    if (e.target.value != null) {
      const id = uuidv4()
      await journeyCollectionCreate({
        variables: {
          journeyCollectionInput: {
            id,
            teamId: activeTeam?.id,
            journeyIds: [e.target.value]
          },
          customDomainUpdateInput: {
            journeyCollectionId: id
          }
        },
        onCompleted: () => {
          enqueueSnackbar('Custom domain updated', {
            variant: 'success',
            preventDuplicate: false
          })
        }
      })
    }
  }

  const initialValues = {
    domainName:
      customDomainData?.customDomains != null
        ? customDomainData?.customDomains[0]?.name
        : ''
  }

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {({ isSubmitting }) => (
        <Dialog
          open={open}
          onClose={onClose}
          divider
          dialogTitle={{
            title: t('Custom Domain Settings'),
            closeButton: true
          }}
          fullscreen={!smUp}
          loading={isSubmitting}
        >
          <Form>
            <Stack spacing={10}>
              <DialogUpdateForm
                customDomains={customDomainData?.customDomains}
              />
              {customDomainData?.customDomains?.length !== 0 &&
                customDomainData?.customDomains != null &&
                customDomainData?.customDomains[0]?.verification?.verified ===
                  true && (
                  <DefaultJourneyForm
                    handleOnChange={handleOnChange}
                    customDomains={customDomainData.customDomains}
                    journeys={journeysData?.journeys}
                  />
                )}
              {customDomainData?.customDomains?.length !== 0 &&
                customDomainData?.customDomains != null && (
                  <DNSConfigSection
                    verified={
                      customDomainData?.customDomains[0]?.verification
                        ?.verified ?? false
                    }
                    name={customDomainData?.customDomains[0]?.name}
                    apexName={customDomainData?.customDomains[0]?.apexName}
                    domainError={
                      customDomainData?.customDomains[0]?.verification
                        ?.verification?.[0]
                    }
                  />
                )}
            </Stack>
          </Form>
        </Dialog>
      )}
    </Formik>
  )
}
