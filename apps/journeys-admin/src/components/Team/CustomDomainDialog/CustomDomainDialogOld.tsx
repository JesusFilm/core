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

import {
  CheckCustomDomain,
  CheckCustomDomain_customDomainCheck_verification as CustomDomainVerification
} from '../../../../__generated__/CheckCustomDomain'
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
  mutation UpdateJourneyCollection(
    $id: ID!
    $input: JourneyCollectionUpdateInput!
  ) {
    journeyCollectionUpdate(id: $id, input: $input) {
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

export const CHECK_CUSTOM_DOMAIN = gql`
  mutation CheckCustomDomain($id: ID!) {
    customDomainCheck(id: $id) {
      configured
      verification {
        domain
        reason
        type
        value
      }
      verified
      verificationResponse {
        code
        message
      }
    }
  }
`

export const JOURNEY_COLLECTION_CREATE = gql`
  mutation JourneyCollectionCreate(
    $journeyCollectionInput: JourneyCollectionCreateInput!
    $customDomainId: ID!
    $customDomainUpdateInput: CustomDomainUpdateInput!
  ) {
    journeyCollectionCreate(input: $journeyCollectionInput) {
      id
      journeys {
        id
        title
      }
    }
    customDomainUpdate(id: $customDomainId, input: $customDomainUpdateInput) {
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
  const [domainStatus, setDomainStatus] = useState<CustomDomainVerification>()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const { data: journeysData } = useAdminJourneysQuery({
    status: [JourneyStatus.draft, JourneyStatus.published],
    useLastActiveTeamId: true
  })

  const [checkCustomDomain] =
    useMutation<CheckCustomDomain>(CHECK_CUSTOM_DOMAIN)

  const {
    data: customDomainData,
    refetch: refetchCustomDomains,
    hasCustomDomain
  } = useCustomDomainsQuery({
    variables: { teamId: activeTeam?.id as string },
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      setLoading(false)
    }
  })

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

  useEffect(() => {
    // poll to check custom domain status
    let interval
    if (
      customDomainData?.customDomains != null &&
      customDomainData?.customDomains.length > 0
    ) {
      interval = setInterval(async () => {
        const { data } = await checkCustomDomain({
          variables: { id: customDomainData?.customDomains[0].id }
        })
        if (
          data?.customDomainCheck.verification != null &&
          data?.customDomainCheck?.verification?.length > 0
        )
          setDomainStatus(data.customDomainCheck.verification[0])
      }, 1000 * 60 /* poll every minute */)
    }

    return () => {
      clearInterval(interval)
    }
  }, [checkCustomDomain, customDomainData])

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
                customDomainData?.customDomains[0]?.verified === true && (
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
                    customDomainData?.customDomains[0]?.verified ?? false
                  }
                  misconfigured={
                    customDomainData?.customDomains[0]?.configured === false ??
                    true
                  }
                  name={customDomainData?.customDomains[0]?.name}
                  apexName={customDomainData?.customDomains[0]?.apexName}
                  domainError={
                    customDomainData?.customDomains[0]?.verification?.[0]
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
