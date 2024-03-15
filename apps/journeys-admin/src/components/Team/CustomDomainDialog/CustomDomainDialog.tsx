import { gql, useMutation, useQuery } from '@apollo/client'
import Divider from '@mui/material/Divider'
import { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Form, Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { object, string } from 'yup'

import { Dialog } from '@core/shared/ui/Dialog/Dialog'

import { CreateCustomDomain } from '../../../../__generated__/CreateCustomDomain'
import { DeleteCustomDomain } from '../../../../__generated__/DeleteCustomDomain'
import { GetCustomDomain } from '../../../../__generated__/GetCustomDomain'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { JourneyCollectionCreate } from '../../../../__generated__/JourneyCollectionCreate'
import { UpdateJourneyCollection } from '../../../../__generated__/UpdateJourneyCollection'
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
      verification {
        verified
        verification {
          domain
          reason
          type
          value
        }
      }
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

export const UPDATE_JOURNEY_COLLECTION = gql`
  mutation UpdateJourneyCollection($input: JourneyCollectionUpdateInput!) {
    journeyCollectionUpdate(input: $input) {
      id
      journeys {
        id
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
  const [loading, setLoading] = useState(true)
  const { data: journeysData } = useAdminJourneysQuery({
    status: [JourneyStatus.draft, JourneyStatus.published],
    useLastActiveTeamId: true
  })

  const { activeTeam } = useTeam()
  const { data: customDomainData } = useQuery<GetCustomDomain>(
    GET_CUSTOM_DOMAIN,
    {
      variables: { teamId: activeTeam?.id },
      onCompleted: () => setLoading(false)
    }
  )

  const [createCustomDomain] =
    useMutation<CreateCustomDomain>(CREATE_CUSTOM_DOMAIN)

  const [updateJourneyCollection] = useMutation<UpdateJourneyCollection>(
    UPDATE_JOURNEY_COLLECTION
  )

  const [deleteCustomDomain] =
    useMutation<DeleteCustomDomain>(DELETE_CUSTOM_DOMAIN)

  const [journeyCollectionCreate] = useMutation<JourneyCollectionCreate>(
    JOURNEY_COLLECTION_CREATE
  )

  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')
  const validationSchema = object({}).shape({
    domainName: string()
      .trim()
      .nonNullable()
      .required(t('Domain name is a required field'))
  })
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  async function handleSubmit(value, { setValues }): Promise<void> {
    setLoading(true)
    if (
      customDomainData?.customDomains != null &&
      customDomainData?.customDomains?.length !== 0
    ) {
      await deleteCustomDomain({
        variables: {
          customDomainDeleteId: customDomainData?.customDomains[0].id
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
            name: value.domainName,
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
                }
              }
            })
        }
      })
    }
    setLoading(false)
    enqueueSnackbar(t('Custom domain updated'), {
      variant: 'success',
      preventDuplicate: false
    })
  }

  const hasCustomDomain: boolean =
    customDomainData?.customDomains?.length !== 0 &&
    customDomainData?.customDomains != null

  async function handleOnChange(e: SelectChangeEvent): Promise<void> {
    if (
      customDomainData?.customDomains[0]?.journeyCollection?.journeys
        ?.length !== 0 &&
      customDomainData?.customDomains[0]?.journeyCollection?.journeys != null
    ) {
      await updateJourneyCollection({
        variables: {
          input: {
            journeyIds: [e.target.value],
            id: customDomainData?.customDomains[0].journeyCollection.id
          }
        }
      })
    } else {
      if (activeTeam?.id != null && customDomainData != null) {
        const id = uuidv4()
        await journeyCollectionCreate({
          variables: {
            journeyCollectionInput: {
              id,
              teamId: activeTeam.id,
              journeyIds: [e.target.value]
            },
            customDomainUpdateInput: {
              id: customDomainData.customDomains[0].id,
              journeyCollectionId: id
            }
          },
          onCompleted: () => {
            enqueueSnackbar(t('Default journey set'), {
              variant: 'success',
              preventDuplicate: false
            })
          }
        })
      }
    }
  }

  const initialValues = {
    domainName: hasCustomDomain ? customDomainData?.customDomains[0]?.name : ''
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
            title: t('Domain Settings'),
            closeButton: true
          }}
          fullscreen={!smUp}
          loading={isSubmitting || loading}
          sx={{ '& .MuiDialogContent-dividers': { px: 6, py: 9 } }}
        >
          <Form>
            <Stack spacing={10}>
              <DialogUpdateForm
                loading={loading}
                showDeleteButton={hasCustomDomain}
              />
              {hasCustomDomain && <Divider />}
              {hasCustomDomain &&
                customDomainData?.customDomains[0]?.verification?.verified ===
                  true && (
                  <DefaultJourneyForm
                    handleOnChange={handleOnChange}
                    defaultValue={
                      customDomainData?.customDomains[0]?.journeyCollection
                        ?.journeys?.[0]?.id ?? undefined
                    }
                    journeys={journeysData?.journeys}
                    domainName={customDomainData?.customDomains[0]?.name}
                  />
                )}
              {hasCustomDomain && (
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
