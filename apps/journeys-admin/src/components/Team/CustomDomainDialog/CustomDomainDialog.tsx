import { gql, useMutation } from '@apollo/client'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Form, Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { object, string } from 'yup'

import { Dialog } from '@core/shared/ui/Dialog/Dialog'

import { CreateCustomDomain } from '../../../../__generated__/CreateCustomDomain'
import { DeleteCustomDomain } from '../../../../__generated__/DeleteCustomDomain'
import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { JourneyCollectionCreate } from '../../../../__generated__/JourneyCollectionCreate'
import { JourneyCollectionDelete } from '../../../../__generated__/JourneyCollectionDelete'
import { UpdateJourneyCollection } from '../../../../__generated__/UpdateJourneyCollection'
import { useAdminJourneysQuery } from '../../../libs/useAdminJourneysQuery'
import { useCustomDomainsQuery } from '../../../libs/useCustomDomainsQuery'
import { useTeam } from '../TeamProvider'

import { DefaultJourneyForm } from './DefaultJourneyForm'
import { DNSConfigSection } from './DNSConfigSection'
import { DomainNameUpdateForm } from './DomainNameUpdateForm'

interface CustomDomainDialogProps {
  open: boolean
  onClose: () => void
}

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
      configuration {
        misconfigured
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

export const JOURNEY_COLLECTION_DELETE = gql`
  mutation JourneyCollectionDelete($id: ID!) {
    journeyCollectionDelete(id: $id) {
      id
      customDomains {
        id
        journeyCollection {
          id
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
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const { data: journeysData } = useAdminJourneysQuery({
    status: [JourneyStatus.draft, JourneyStatus.published],
    useLastActiveTeamId: true
  })

  const {
    data: customDomainData,
    refetch: refetchCustomDomains,
    startPolling,
    stopPolling,
    hasCustomDomain
  } = useCustomDomainsQuery({
    variables: { teamId: activeTeam?.id as string },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      setLoading(false)
      if (data?.customDomains?.length !== 0 && data?.customDomains != null) {
        data.customDomains?.[0].configuration?.misconfigured === true
          ? startPolling(1000 * 60 /* poll every minute */)
          : stopPolling()
      }
    }
  })

  const [createCustomDomain] =
    useMutation<CreateCustomDomain>(CREATE_CUSTOM_DOMAIN)

  const [updateJourneyCollection] = useMutation<UpdateJourneyCollection>(
    UPDATE_JOURNEY_COLLECTION
  )

  const [deleteCustomDomain] = useMutation<DeleteCustomDomain>(
    DELETE_CUSTOM_DOMAIN,
    { onCompleted: () => stopPolling() }
  )

  const [journeyCollectionCreate] = useMutation<JourneyCollectionCreate>(
    JOURNEY_COLLECTION_CREATE
  )

  const [journeyCollectionDelete] = useMutation<JourneyCollectionDelete>(
    JOURNEY_COLLECTION_DELETE
  )

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
          setLoading(false)
          const errorMessage = e?.message.includes(
            'Unique constraint failed on the fields: (`name`)'
          )
            ? t('This domain is already connected to another NextSteps Team')
            : t('Something went wrong, please reload the page and try again')

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
    setLoading(false)
  }

  async function handleOnChange(journey: Journey): Promise<void> {
    // delete
    if (
      journey == null &&
      customDomainData?.customDomains[0]?.journeyCollection?.id != null
    )
      await journeyCollectionDelete({
        variables: {
          id: customDomainData.customDomains[0].journeyCollection.id
        },
        onCompleted: () => {
          enqueueSnackbar(t('Default journey deleted'), {
            variant: 'success',
            preventDuplicate: false
          })
        },
        update: (cache, { data: journeyCollectionDelete }) => {
          cache.evict({
            id: cache.identify({
              __typename:
                journeyCollectionDelete?.journeyCollectionDelete.__typename,
              id: journeyCollectionDelete?.journeyCollectionDelete.id
            })
          })
          cache.gc()
        }
      })
    // upsert
    if (
      customDomainData?.customDomains[0]?.journeyCollection?.journeys
        ?.length !== 0 &&
      customDomainData?.customDomains[0]?.journeyCollection?.journeys != null &&
      journey != null
    ) {
      await updateJourneyCollection({
        variables: {
          input: {
            id: customDomainData?.customDomains[0].journeyCollection.id,
            journeyIds: [journey.id]
          }
        },
        onCompleted: () => {
          enqueueSnackbar(t('Default journey set'), {
            variant: 'success',
            preventDuplicate: false
          })
        }
      })
    } else if (journey != null) {
      if (activeTeam?.id != null && customDomainData != null) {
        const id = uuidv4()
        await journeyCollectionCreate({
          variables: {
            journeyCollectionInput: {
              id,
              teamId: activeTeam.id,
              journeyIds: [journey.id]
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

  useEffect(() => {
    // update UI on team switch
    void refetchCustomDomains()
  }, [activeTeam, refetchCustomDomains])

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
              <DomainNameUpdateForm
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
                        ?.journeys?.[0] ?? undefined
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
                  misconfigured={
                    customDomainData?.customDomains[0]?.configuration
                      ?.misconfigured ?? true
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
