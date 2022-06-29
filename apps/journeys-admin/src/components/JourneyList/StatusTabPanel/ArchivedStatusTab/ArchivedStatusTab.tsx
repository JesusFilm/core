import { ReactElement, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { gql, useMutation, useQuery } from '@apollo/client'
import Typography from '@mui/material/Typography'
import { sortBy } from 'lodash'
import { useTranslation } from 'react-i18next'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useSnackbar } from 'notistack'
import { GetArchivedJourneys } from '../../../../../__generated__/GetArchivedJourneys'
import { JourneyCard } from '../../JourneyCard'
import { SortOrder } from '../../JourneySort'
import { Dialog } from '../../../Dialog'

export const GET_ARCHIVED_JOURNEYS = gql`
  query GetArchivedJourneys {
    journeys: adminJourneys(status: [archived]) {
      id
      title
      createdAt
      publishedAt
      description
      slug
      themeName
      themeMode
      language {
        id
        name(primary: true) {
          value
          primary
        }
      }
      status
      seoTitle
      seoDescription
      userJourneys {
        id
        user {
          id
          firstName
          lastName
          imageUrl
        }
      }
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

interface ArchivedStatusTabProps {
  onLoad: () => void
  sortOrder?: SortOrder
  event?: string | undefined
}

export function ArchivedStatusTab({
  onLoad,
  sortOrder,
  event = ''
}: ArchivedStatusTabProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { data, loading, error, refetch } = useQuery<GetArchivedJourneys>(
    GET_ARCHIVED_JOURNEYS
  )
  const journeys = data?.journeys

  const [restoreArchived] = useMutation(RESTORE_ARCHIVED_JOURNEYS, {
    variables: {
      ids: journeys?.map((journey) => journey.id)
    },
    update(cache, { data }) {
      if (data?.journeysRestore != null) {
        enqueueSnackbar(t('Journeys restored.'), {
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
      if (data?.journeyTrash != null) {
        enqueueSnackbar(t('Journeys trashed.'), {
          variant: 'success'
        })
        void refetch()
      }
    }
  })

  const [openRestoreAll, setOpenRestoreAll] = useState(false)
  const [openTrashAll, setOpenTrashAll] = useState(false)

  const restoreAll = async (): Promise<void> => {
    await restoreArchived()
    handleClose()
  }

  const trashAll = async (): Promise<void> => {
    await trashArchived()
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

  // orders of the first characters ascii value
  const sortedJourneys =
    sortOrder === SortOrder.TITLE
      ? sortBy(journeys, 'title')
      : sortBy(journeys, ({ createdAt }) =>
          new Date(createdAt).getTime()
        ).reverse()

  return (
    <>
      {journeys != null ? (
        <>
          {sortedJourneys.map((journey) => (
            <JourneyCard key={journey.id} journey={journey} />
          ))}
          {journeys.length > 0 ? (
            <Box width="100%" sx={{ textAlign: 'center' }}>
              <Typography variant="caption">
                {t(
                  'Archived journeys are hidden from your active journey list for better organization.'
                )}
              </Typography>
            </Box>
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
                  {t('No archived journeys.')}
                </Typography>
              </Card>
              <Box width="100%" sx={{ textAlign: 'center' }}>
                <Typography variant="caption">
                  {t(
                    'You can archive a Journey to hide it from your active Journey list for better organization.'
                  )}
                </Typography>
              </Box>
            </>
          )}
        </>
      ) : (
        <>
          <JourneyCard />
          <JourneyCard />
          <JourneyCard />
        </>
      )}
      <Dialog
        open={openRestoreAll ?? false}
        handleClose={handleClose}
        dialogTitle={{
          title: t('Unarchive Journeys'),
          closeButton: true
        }}
        dialogAction={{
          onSubmit: restoreAll,
          submitLabel: t('Unarchive'),
          closeLabel: t('Cancel')
        }}
        divider={true}
        fullscreen={!smUp}
      >
        <Typography>
          {t(
            'Are you sure you would like to unarchive all archived journeys immediately?'
          )}
        </Typography>
      </Dialog>
      <Dialog
        open={openTrashAll ?? false}
        handleClose={handleClose}
        dialogTitle={{
          title: t('Trash Journeys'),
          closeButton: true
        }}
        dialogAction={{
          onSubmit: trashAll,
          submitLabel: t('Trash'),
          closeLabel: t('Cancel')
        }}
        divider={true}
        fullscreen={!smUp}
      >
        <Typography>
          {t(
            'Are you sure you would like to trash all archived journeys immediately?'
          )}
        </Typography>
      </Dialog>
    </>
  )
}
