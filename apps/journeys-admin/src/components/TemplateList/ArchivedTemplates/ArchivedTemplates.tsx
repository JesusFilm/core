import { ReactElement, useState, useEffect } from 'react'
import { AuthUser } from 'next-firebase-auth'
import Typography from '@mui/material/Typography'
import { gql, useMutation, useQuery } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { Dialog } from '@core/shared/ui/Dialog'
import { SortOrder } from '../../JourneyList/JourneySort'
import { sortJourneys } from '../../JourneyList/JourneySort/utils/sortJourneys'
import {
  RESTORE_ARCHIVED_JOURNEYS,
  TRASH_ARCHIVED_JOURNEYS
} from '../../JourneyList/ArchivedJourneyList/ArchivedJourneyList'
import {
  GetArchivedPublisherTemplates,
  GetArchivedPublisherTemplates_journeys as Journey
} from '../../../../__generated__/GetArchivedPublisherTemplates'
import { TemplateCard } from '../../TemplateCard'

export const GET_ARCHIVED_PUBLISHER_TEMPLATES = gql`
  query GetArchivedPublisherTemplates {
    journeys: adminJourneys(status: [archived], template: true) {
      id
      title
      createdAt
      publishedAt
      description
      slug
      themeName
      themeMode
      status
      seoTitle
      seoDescription
      template
      userJourneys {
        id
        role
        openedAt
        user {
          id
          firstName
          lastName
          imageUrl
        }
      }
      language {
        id
        name(primary: true) {
          value
          primary
        }
      }
      primaryImageBlock {
        id
        parentBlockId
        parentOrder
        src
        alt
        width
        height
        blurhash
      }
    }
  }
`

interface ArchivedTemplateProps {
  onLoad: () => void
  event: string | undefined
  sortOrder?: SortOrder
  authUser?: AuthUser
}

export function ArchivedTemplates({
  onLoad,
  event,
  sortOrder,
  authUser
}: ArchivedTemplateProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const { data, loading, error, refetch } =
    useQuery<GetArchivedPublisherTemplates>(GET_ARCHIVED_PUBLISHER_TEMPLATES)

  const { enqueueSnackbar } = useSnackbar()
  const [openRestoreAll, setOpenRestoreAll] = useState(false)
  const [openTrashAll, setOpenTrashAll] = useState(false)

  const journeys = data?.journeys

  const [restoreArchived] = useMutation(RESTORE_ARCHIVED_JOURNEYS, {
    variables: {
      ids: journeys?.map((journey) => journey.id)
    },
    update(cache, { data }) {
      if (data?.journeysRestore != null) {
        enqueueSnackbar(t('Journeys Restored'), {
          variant: 'success'
        })
        void refetch()
      }
    }
  })

  const [trashArchived] = useMutation(TRASH_ARCHIVED_JOURNEYS, {
    variables: {
      ids: journeys?.map((journey) => journey.id)
    },
    update(cache, { data }) {
      if (data?.journeysTrash != null) {
        enqueueSnackbar(t('Journeys Trashed'), {
          variant: 'success'
        })
        void refetch()
      }
    }
  })

  const snackbarError = (error: Error): void => {
    enqueueSnackbar(error.message, {
      variant: 'error',
      preventDuplicate: true
    })
  }

  const restoreAll = async (): Promise<void> => {
    try {
      await restoreArchived()
    } catch (error) {
      snackbarError(error)
    }
    handleClose()
  }

  const trashAll = async (): Promise<void> => {
    try {
      await trashArchived()
    } catch (error) {
      snackbarError(error)
    }
    handleClose()
  }

  const handleClose = (): void => {
    setOpenRestoreAll(false)
    setOpenTrashAll(false)
  }

  useEffect(() => {
    if (!loading && error == null) {
      onLoad()
    }
  }, [onLoad, loading, error])

  useEffect(() => {
    switch (event) {
      case 'restoreAllArchived':
        setOpenRestoreAll(true)
        break
      case 'trashAllArchived':
        setOpenTrashAll(true)
        break
      case 'refetchArchived':
        void refetch()
        break
    }
  }, [event, refetch])

  const sortedJourneys =
    journeys != null ? sortJourneys(journeys, sortOrder) : undefined

  return (
    <>
      {sortedJourneys != null ? (
        <>
          {sortedJourneys.map((journey) => (
            <TemplateCard
              key={journey.id}
              journey={journey as Journey}
              isPublisher
              refetch={refetch}
            />
          ))}
          {sortedJourneys.length > 0 ? (
            <span>
              <Box width="100%" sx={{ textAlign: 'center' }}>
                <Typography variant="caption">
                  {t(
                    'Archived templates are delisted from the Template Library.'
                  )}
                </Typography>
              </Box>
            </span>
          ) : (
            <>
              <Card
                variant="outlined"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  pt: 20,
                  pb: 16,
                  borderBottomLeftRadius: { xs: 0, sm: 12 },
                  borderBottomRightRadius: { xs: 0, sm: 12 },
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0
                }}
              >
                <Typography variant="subtitle1" align="center" gutterBottom>
                  {t('No archived templates.')}
                </Typography>
              </Card>
              <Box width="100%" sx={{ textAlign: 'center' }}>
                <Typography variant="caption">
                  {t(
                    'You can archive a template to to delist it from the Template Library.'
                  )}
                </Typography>
              </Box>
            </>
          )}
        </>
      ) : (
        <>
          {[0, 1, 2].map((index) => (
            <TemplateCard key={`templateCard${index}`} isPublisher />
          ))}
        </>
      )}

      <Dialog
        open={openRestoreAll ?? false}
        onClose={handleClose}
        dialogTitle={{
          title: t('Unarchive Templates'),
          closeButton: true
        }}
        dialogAction={{
          onSubmit: restoreAll,
          submitLabel: t('Unarchive'),
          closeLabel: t('Cancel')
        }}
      >
        <Typography>
          {t(
            'Are you sure you would like to unarchive all archived templates immediately?'
          )}
        </Typography>
      </Dialog>
      <Dialog
        open={openTrashAll ?? false}
        onClose={handleClose}
        dialogTitle={{
          title: t('Trash Templates'),
          closeButton: true
        }}
        dialogAction={{
          onSubmit: trashAll,
          submitLabel: t('Trash'),
          closeLabel: t('Cancel')
        }}
      >
        <Typography>
          {t(
            'Are you sure you would like to trash all archived templates immediately?'
          )}
        </Typography>
      </Dialog>
    </>
  )
}
