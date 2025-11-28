import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { User } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useMemo, useState } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { JourneyFields } from '../../../../__generated__/JourneyFields'
import { useAdminJourneysQuery } from '../../../libs/useAdminJourneysQuery'
import { ActivePriorityList } from '../ActiveJourneyList/ActivePriorityList'
import { AddJourneyButton } from '../ActiveJourneyList/AddJourneyButton'
import { JourneyCard } from '../JourneyCard'
import type { JourneyListEvent, JourneyListProps } from '../JourneyList'
import type { ContentType, JourneyStatusFilter } from '../JourneyListView'
import { JourneySort, SortOrder } from '../JourneySort'
import { sortJourneys } from '../JourneySort/utils/sortJourneys'
import { LoadingJourneyList } from '../LoadingJourneyList'

const Dialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "core/shared/ui-dynamic/Dialog" */
      '@core/shared/ui-dynamic/Dialog'
    ).then((mod) => mod.Dialog),
  { ssr: false }
)

// Mutations
export const ARCHIVE_ACTIVE_JOURNEYS = gql`
  mutation ArchiveActiveJourneys($ids: [ID!]!) {
    journeysArchive(ids: $ids) {
      id
      status
    }
  }
`

export const TRASH_ACTIVE_JOURNEYS = gql`
  mutation TrashActiveJourneys($ids: [ID!]!) {
    journeysTrash(ids: $ids) {
      id
      status
    }
  }
`

export const RESTORE_ARCHIVED_JOURNEYS = gql`
  mutation RestoreArchivedJourneys($ids: [ID!]!) {
    journeysRestore(ids: $ids) {
      id
      status
    }
  }
`

export const TRASH_ARCHIVED_JOURNEYS = gql`
  mutation TrashArchivedJourneys($ids: [ID!]!) {
    journeysTrash(ids: $ids) {
      id
      status
    }
  }
`

export const RESTORE_TRASHED_JOURNEYS = gql`
  mutation RestoreTrashedJourneys($ids: [ID!]!) {
    journeysRestore(ids: $ids) {
      id
      status
    }
  }
`

export const DELETE_TRASHED_JOURNEYS = gql`
  mutation DeleteTrashedJourneys($ids: [ID!]!) {
    journeysDelete(ids: $ids) {
      id
      status
    }
  }
`

export interface JourneyListContentProps {
  contentType: ContentType
  status: JourneyStatusFilter
  user?: User
  sortOrder?: SortOrder
  event?: JourneyListEvent
}

export function JourneyListContent({
  contentType,
  status,
  user,
  sortOrder,
  event
}: JourneyListContentProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()

  // Determine query parameters based on contentType and status
  const getQueryParams = () => {
    const isTemplate = contentType === 'templates'
    const baseParams: {
      status: JourneyStatus[]
      template?: boolean
      useLastActiveTeamId?: boolean
    } = {
      status: []
    }

    switch (status) {
      case 'active':
        baseParams.status = [JourneyStatus.draft, JourneyStatus.published]
        break
      case 'archived':
        baseParams.status = [JourneyStatus.archived]
        break
      case 'trashed':
        baseParams.status = [JourneyStatus.trashed]
        break
    }

    if (isTemplate) {
      baseParams.template = true
      // Filter templates by current team to avoid showing templates from other teams
      baseParams.useLastActiveTeamId = true
    } else {
      // Explicitly filter out templates when showing journeys
      baseParams.template = false
      baseParams.useLastActiveTeamId = true
    }

    return baseParams
  }

  const { data, refetch } = useAdminJourneysQuery(getQueryParams())

  // Determine mutations based on status
  const getMutations = (): {
    primary: typeof ARCHIVE_ACTIVE_JOURNEYS
    secondary: typeof TRASH_ACTIVE_JOURNEYS
  } => {
    switch (status) {
      case 'active':
        return {
          primary: ARCHIVE_ACTIVE_JOURNEYS,
          secondary: TRASH_ACTIVE_JOURNEYS
        }
      case 'archived':
        return {
          primary: RESTORE_ARCHIVED_JOURNEYS,
          secondary: TRASH_ARCHIVED_JOURNEYS
        }
      case 'trashed':
        return {
          primary: RESTORE_TRASHED_JOURNEYS,
          secondary: DELETE_TRASHED_JOURNEYS
        }
      default:
        return {
          primary: ARCHIVE_ACTIVE_JOURNEYS,
          secondary: TRASH_ACTIVE_JOURNEYS
        }
    }
  }

  const mutations = getMutations()
  const [primaryMutation] = useMutation(mutations.primary, {
    update(_cache, { data }) {
      const messageKey =
        status === 'active'
          ? 'Journeys Archived'
          : status === 'archived'
            ? 'Journeys Restored'
            : 'Journeys Restored'
      enqueueSnackbar(t(messageKey), {
        variant: 'success'
      })
      void refetch()
    }
  })
  const [secondaryMutation] = useMutation(mutations.secondary, {
    update(_cache, { data }) {
      const messageKey =
        status === 'active'
          ? 'Journeys Trashed'
          : status === 'archived'
            ? 'Journeys Trashed'
            : 'Journeys Deleted'
      enqueueSnackbar(t(messageKey), {
        variant: 'success'
      })
      void refetch()
    }
  })

  const [primaryDialogOpen, setPrimaryDialogOpen] = useState<
    boolean | undefined
  >()
  const [secondaryDialogOpen, setSecondaryDialogOpen] = useState<
    boolean | undefined
  >()

  // Filter journeys by owner role for journeys (not templates)
  const getOwnerFilteredIds = (): string[] | undefined => {
    if (contentType === 'templates' || !user?.id) {
      return data?.journeys?.map((journey) => journey.id)
    }
    return data?.journeys
      ?.filter(
        (journey) =>
          journey.userJourneys?.find(
            (userJourney) => userJourney.user?.id === user.id
          )?.role === 'owner'
      )
      .map((journey) => journey.id)
  }

  async function handlePrimarySubmit(): Promise<void> {
    try {
      const journeyIds = getOwnerFilteredIds()
      await primaryMutation({ variables: { ids: journeyIds } })
    } catch (error) {
      if (error instanceof Error) {
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
    }
    handleClose()
  }

  async function handleSecondarySubmit(): Promise<void> {
    try {
      const journeyIds = getOwnerFilteredIds()
      await secondaryMutation({ variables: { ids: journeyIds } })
    } catch (error) {
      if (error instanceof Error) {
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
    }
    handleClose()
  }

  function handleClose(): void {
    setPrimaryDialogOpen(false)
    setSecondaryDialogOpen(false)
  }

  // Handle events
  useEffect(() => {
    switch (status) {
      case 'active':
        switch (event) {
          case 'archiveAllActive':
            setPrimaryDialogOpen(true)
            break
          case 'trashAllActive':
            setSecondaryDialogOpen(true)
            break
          case 'refetchActive':
            void refetch()
            break
        }
        break
      case 'archived':
        switch (event) {
          case 'restoreAllArchived':
            setPrimaryDialogOpen(true)
            break
          case 'trashAllArchived':
            setSecondaryDialogOpen(true)
            break
          case 'refetchArchived':
            void refetch()
            break
        }
        break
      case 'trashed':
        switch (event) {
          case 'restoreAllTrashed':
            setPrimaryDialogOpen(true)
            break
          case 'deleteAllTrashed':
            setSecondaryDialogOpen(true)
            break
          case 'refetchTrashed':
            void refetch()
            break
        }
        break
    }
  }, [event, refetch, status])

  // Filter trashed journeys by date (40 days)
  const filteredJourneys = useMemo(() => {
    if (status === 'trashed' && data?.journeys != null) {
      const daysAgo = new Date()
      daysAgo.setDate(new Date().getDate() - 40)
      return data.journeys.filter(
        (journey) =>
          journey.trashedAt != null &&
          new Date(String(journey.trashedAt)) > daysAgo
      )
    }
    return data?.journeys
  }, [data?.journeys, status])

  const sortedJourneys =
    filteredJourneys != null
      ? sortJourneys(filteredJourneys, sortOrder)
      : undefined

  // Determine if we should use ActivePriorityList (only for active journeys)
  const usePriorityList =
    status === 'active' && contentType === 'journeys' && user != null

  // Get dialog labels based on contentType and status
  const getDialogLabels = (): {
    primary: { title: string; submitLabel: string; message: string }
    secondary: { title: string; submitLabel: string; message: string }
  } => {
    const isTemplate = contentType === 'templates'
    const itemType = isTemplate ? 'Templates' : 'Journeys'

    switch (status) {
      case 'active':
        return {
          primary: {
            title: t(`Archive ${itemType}`),
            submitLabel: t('Archive'),
            message: isTemplate
              ? t(
                  'Are you sure you would like to archive all active templates immediately?'
                )
              : t('This will archive all active journeys you own.')
          },
          secondary: {
            title: t(`Trash ${itemType}`),
            submitLabel: t('Trash'),
            message: isTemplate
              ? t(
                  'Are you sure you would like to trash all active templates immediately?'
                )
              : t('This will trash all active journeys you own.')
          }
        }
      case 'archived':
        return {
          primary: {
            title: t(`Unarchive ${itemType}`),
            submitLabel: t('Unarchive'),
            message: isTemplate
              ? t(
                  'Are you sure you would like to unarchive all archived templates immediately?'
                )
              : t('This will unarchive all archived journeys you own.')
          },
          secondary: {
            title: t(`Trash ${itemType}`),
            submitLabel: t('Trash'),
            message: isTemplate
              ? t(
                  'Are you sure you would like to trash all archived templates immediately?'
                )
              : t('This will trash all archived journeys you own.')
          }
        }
      case 'trashed':
        return {
          primary: {
            title: t(`Restore ${itemType}`),
            submitLabel: t('Restore'),
            message: isTemplate
              ? t(
                  'Are you sure you would like to restore all trashed templates immediately?'
                )
              : t('This will restore all trashed journeys you own.')
          },
          secondary: {
            title: t(`Delete ${itemType} Forever`),
            submitLabel: t('Delete Forever'),
            message: isTemplate
              ? t(
                  'Are you sure you would like to permanently delete all trashed templates immediately?'
                )
              : t('This will permanently delete all trashed journeys you own.')
          }
        }
      default:
        return {
          primary: {
            title: t(`Archive ${itemType}`),
            submitLabel: t('Archive'),
            message: isTemplate
              ? t(
                  'Are you sure you would like to archive all active templates immediately?'
                )
              : t('This will archive all active journeys you own.')
          },
          secondary: {
            title: t(`Trash ${itemType}`),
            submitLabel: t('Trash'),
            message: isTemplate
              ? t(
                  'Are you sure you would like to trash all active templates immediately?'
                )
              : t('This will trash all active journeys you own.')
          }
        }
    }
  }

  const dialogLabels = getDialogLabels()

  // Get empty state message
  const getEmptyStateMessage = (): string => {
    if (contentType === 'templates') {
      switch (status) {
        case 'active':
          return t('No templates to display.')
        case 'archived':
          return t('No archived templates.')
        case 'trashed':
          return t('Your trashed templates will appear here.')
        default:
          return t('No templates to display.')
      }
    } else {
      switch (status) {
        case 'active':
          return t('No journeys to display.')
        case 'archived':
          return t('No archived journeys.')
        case 'trashed':
          return t('Your trashed journeys will appear here.')
        default:
          return t('No journeys to display.')
      }
    }
  }

  // Get helper text
  const getHelperText = (): string => {
    if (contentType === 'templates') {
      switch (status) {
        case 'active':
          return t(
            'You can archive a template to to delist it from the Template Library.'
          )
        case 'archived':
          return t('Archived templates are delisted from the Template Library.')
        case 'trashed':
          return t('Trashed templates are moved here for up to 40 days.')
        default:
          return t(
            'You can archive a template to to delist it from the Template Library.'
          )
      }
    } else {
      switch (status) {
        case 'active':
          return t(
            'You can archive a Journey to hide it from your active Journey list for better organization.'
          )
        case 'archived':
          return t(
            'You can archive a Journey to hide it from your active Journey list for better organization.'
          )
        case 'trashed':
          return t('Trashed journeys are moved here for up to 40 days.')
        default:
          return t(
            'You can archive a Journey to hide it from your active Journey list for better organization.'
          )
      }
    }
  }

  return (
    <>
      {sortedJourneys == null ? (
        <LoadingJourneyList hideHelperText />
      ) : (
        <Box
          sx={{
            mt: { xs: 3, sm: 2 },
            px: { xs: 5, sm: 0 },
            // Negative margin-right for templates to offset extra spacing from Grid container
            // This ensures symmetric padding (32px on both sides) when side panel is hidden
            mr: {
              sm: contentType === 'templates' ? -4 : undefined
            }
          }}
        >
          {usePriorityList ? (
            <>
              <ActivePriorityList
                journeys={data?.journeys ?? []}
                sortOrder={sortOrder}
                refetch={refetch}
                user={user}
              />
              {(data?.journeys?.length ?? 0) === 0 && (
                <Card
                  variant="outlined"
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    py: 20,
                    borderBottomLeftRadius: { xs: 0, sm: 12 },
                    borderBottomRightRadius: { xs: 0, sm: 12 },
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0
                  }}
                >
                  <Typography variant="subtitle1" align="center" gutterBottom>
                    {getEmptyStateMessage()}
                  </Typography>
                  <Typography variant="caption" align="center" gutterBottom>
                    {t('Create a journey, then find it here.')}
                  </Typography>
                  <AddJourneyButton />
                </Card>
              )}
            </>
          ) : (
            <>
              <Grid container spacing={4} rowSpacing={{ xs: 2.5, sm: 4 }}>
                {sortedJourneys.map((journey) => (
                  <Grid
                    key={journey.id}
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 6,
                      // MUI Grid2 uses a 12-column system:
                      // - 4 columns: 12 / 4 = 3 columns per item (journeys)
                      // - 5 columns: 12 / 5 = 2.4 columns per item (templates)
                      lg: contentType === 'templates' ? 2.4 : 3,
                      xl: contentType === 'templates' ? 2.4 : 3
                    }}
                  >
                    <JourneyProvider
                      value={{
                        journey: journey as unknown as JourneyFields,
                        variant: 'admin'
                      }}
                    >
                      <JourneyCard
                        key={journey.id}
                        journey={journey}
                        refetch={refetch}
                      />
                    </JourneyProvider>
                  </Grid>
                ))}
              </Grid>
              {sortedJourneys.length === 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    pt: status === 'active' ? 30 : 30
                  }}
                >
                  <Typography variant="subtitle1" align="center" gutterBottom>
                    {getEmptyStateMessage()}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      )}
      <Stack alignItems="center">
        <Typography
          variant="caption"
          align="center"
          component="div"
          sx={{ py: { xs: 3, sm: 5 }, maxWidth: 290 }}
        >
          {getHelperText()}
        </Typography>
      </Stack>
      {primaryDialogOpen != null && (
        <Dialog
          open={primaryDialogOpen}
          onClose={handleClose}
          dialogTitle={{
            title: dialogLabels.primary.title,
            closeButton: true
          }}
          dialogAction={{
            onSubmit: handlePrimarySubmit,
            submitLabel: dialogLabels.primary.submitLabel,
            closeLabel: t('Cancel')
          }}
        >
          <Typography sx={{ fontWeight: 'bold' }}>
            {dialogLabels.primary.message}
          </Typography>
          {status !== 'active' && (
            <Typography>{t('Are you sure you want to proceed?')}</Typography>
          )}
        </Dialog>
      )}
      {secondaryDialogOpen != null && (
        <Dialog
          open={secondaryDialogOpen}
          onClose={handleClose}
          dialogTitle={{
            title: dialogLabels.secondary.title,
            closeButton: true
          }}
          dialogAction={{
            onSubmit: handleSecondarySubmit,
            submitLabel: dialogLabels.secondary.submitLabel,
            closeLabel: t('Cancel')
          }}
        >
          <Typography sx={{ fontWeight: 'bold' }}>
            {dialogLabels.secondary.message}
          </Typography>
          <Typography>{t('Are you sure you want to proceed?')}</Typography>
        </Dialog>
      )}
    </>
  )
}
