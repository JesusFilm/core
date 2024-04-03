import { gql, useMutation } from '@apollo/client'
import Autocomplete from '@mui/material/Autocomplete'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import Computer from '@core/shared/ui/icons/Computer'

import {
  GetCustomDomains_customDomains as CustomDomain,
  GetCustomDomains_customDomains_journeyCollection_journeys as Journey
} from '../../../../../__generated__/GetCustomDomains'
import { JourneyCollectionCreate } from '../../../../../__generated__/JourneyCollectionCreate'
import { JourneyCollectionDelete } from '../../../../../__generated__/JourneyCollectionDelete'
import { UpdateJourneyCollection } from '../../../../../__generated__/UpdateJourneyCollection'
import { useTeam } from '../../TeamProvider'

interface DefaultJourneyFormProps {
  customDomain?: CustomDomain
  loading?: boolean
}
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

export function DefaultJourneyForm({
  customDomain
}: DefaultJourneyFormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const { enqueueSnackbar } = useSnackbar()

  const [journeyCollectionDelete] = useMutation<JourneyCollectionDelete>(
    JOURNEY_COLLECTION_DELETE
  )

  const [updateJourneyCollection] = useMutation<UpdateJourneyCollection>(
    UPDATE_JOURNEY_COLLECTION
  )

  const [journeyCollectionCreate] = useMutation<JourneyCollectionCreate>(
    JOURNEY_COLLECTION_CREATE
  )

  async function handleOnChange(journey: Journey | null): Promise<void> {
    // delete
    if (journey == null && customDomain?.journeyCollection?.id != null)
      await journeyCollectionDelete({
        variables: {
          id: customDomain.journeyCollection.id
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
      customDomain?.journeyCollection?.journeys?.length !== 0 &&
      customDomain?.journeyCollection?.journeys != null &&
      journey != null
    ) {
      await updateJourneyCollection({
        variables: {
          input: {
            id: customDomain?.journeyCollection.id,
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
      if (activeTeam?.id != null && customDomain != null) {
        const id = uuidv4()
        await journeyCollectionCreate({
          variables: {
            journeyCollectionInput: {
              id,
              teamId: activeTeam.id,
              journeyIds: [journey.id]
            },
            customDomainUpdateInput: {
              id: customDomain.id,
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

  return (
    <Stack spacing={4}>
      <Stack direction="row" spacing={3}>
        <Computer sx={{ color: 'secondary.light' }} />
        <Stack spacing={4} width="100%">
          <Typography variant="subtitle1">{t('Default Journey')}</Typography>
          <Stack direction="row" justifyContent="space-between">
            <FormControl variant="filled" fullWidth hiddenLabel>
              <Autocomplete
                data-testid="DefaultJourneySelect"
                getOptionLabel={(options) => options.title}
                id="defaultJourney"
                defaultValue={customDomain?.journeyCollection?.journeys?.[0]}
                onChange={async (_e, option) => await handleOnChange(option)}
                options={customDomain?.journeyCollection?.journeys ?? []}
                renderInput={(params) => <TextField {...params} />}
                blurOnSelect
              />
              <FormHelperText sx={{ wordBreak: 'break-all' }}>
                {t(
                  `The default Journey will be available at ${customDomain?.name}`
                )}
              </FormHelperText>
            </FormControl>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  )
}
