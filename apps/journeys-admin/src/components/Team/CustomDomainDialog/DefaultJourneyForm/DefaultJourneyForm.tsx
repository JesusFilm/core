import { gql, useMutation } from '@apollo/client'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useTeam } from '@core/journeys/ui/TeamProvider'

import {
  CreateJourneyCollection,
  CreateJourneyCollectionVariables
} from '../../../../../__generated__/CreateJourneyCollection'
import {
  DeleteJourneyCollection,
  DeleteJourneyCollectionVariables
} from '../../../../../__generated__/DeleteJourneyCollection'
import {
  GetCustomDomains_customDomains as CustomDomain,
  GetCustomDomains_customDomains_journeyCollection_journeys as Journey
} from '../../../../../__generated__/GetCustomDomains'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import {
  UpdateJourneyCollection,
  UpdateJourneyCollectionVariables
} from '../../../../../__generated__/UpdateJourneyCollection'
import { useAdminJourneysQuery } from '../../../../libs/useAdminJourneysQuery'
import { CustomDomainDialogTitle } from '../CustomDomainDialogTitle'

interface DefaultJourneyFormProps {
  customDomain: CustomDomain
}
export const DELETE_JOURNEY_COLLECTION = gql`
  mutation DeleteJourneyCollection($id: ID!) {
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

export const CREATE_JOURNEY_COLLECTION = gql`
  mutation CreateJourneyCollection(
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
  const { data } = useAdminJourneysQuery({
    status: [JourneyStatus.draft, JourneyStatus.published],
    useLastActiveTeamId: true
  })
  const [journeyCollectionDelete] = useMutation<
    DeleteJourneyCollection,
    DeleteJourneyCollectionVariables
  >(DELETE_JOURNEY_COLLECTION)

  const [updateJourneyCollection] = useMutation<
    UpdateJourneyCollection,
    UpdateJourneyCollectionVariables
  >(UPDATE_JOURNEY_COLLECTION)

  const [journeyCollectionCreate] = useMutation<
    CreateJourneyCollection,
    CreateJourneyCollectionVariables
  >(CREATE_JOURNEY_COLLECTION)

  async function handleOnChange(journey: Journey | null): Promise<void> {
    // delete
    if (journey == null && customDomain.journeyCollection?.id != null)
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
      customDomain.journeyCollection?.journeys?.length !== 0 &&
      customDomain.journeyCollection?.journeys != null &&
      journey != null
    ) {
      await updateJourneyCollection({
        variables: {
          id: customDomain.journeyCollection.id,
          input: {
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
              journeyCollectionId: id
            },
            customDomainId: customDomain.id
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
    <Box flexGrow={1}>
      <CustomDomainDialogTitle title={t('Default Journey')} />
      <Stack direction="row" justifyContent="space-between">
        <FormControl variant="filled" fullWidth hiddenLabel>
          <Autocomplete
            getOptionLabel={(options) => options.title}
            id="defaultJourney"
            defaultValue={customDomain.journeyCollection?.journeys?.[0]}
            onChange={async (_e, option) => await handleOnChange(option)}
            options={data?.journeys ?? []}
            renderInput={(params) => (
              <TextField {...params} variant="filled" hiddenLabel />
            )}
            blurOnSelect
          />
          <FormHelperText sx={{ wordBreak: 'break-all' }}>
            {t('The default Journey will be available at {{ customDomain }}', {
              customDomain: customDomain.name
            })}
          </FormHelperText>
        </FormControl>
      </Stack>
    </Box>
  )
}
