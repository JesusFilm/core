import { ReactElement, useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { gql, useMutation, useQuery } from '@apollo/client'
import Typography from '@mui/material/Typography'
import { sortBy } from 'lodash'
import { useTranslation } from 'react-i18next'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { GetTrashedJourneys } from '../../../../../__generated__/GetTrashedJourneys'
import { JourneyCard } from '../../JourneyCard'
import { SortOrder } from '../../JourneySort'
import { Dialog } from '../../../Dialog'

export const GET_TRASHED_JOURNEYS = gql`
  query GetTrashedJourneys {
    journeys: adminJourneys(status: [trashed]) {
      id
      title
      createdAt
      publishedAt
      trashedAt
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

const RESTORE_TRASHED_JOURNEYS = gql`
  mutation RestoreTrashedJourneys($ids: [ID!]!) {
    journeysRestore(ids: $ids) {
      id
      status
    }
  }
`

export const DELETE_TRASHED_JOURNEYS = gql`
  mutation TrashActiveJourneys($ids: [ID!]!) {
    journeysDelete(ids: $ids) {
      id
      status
    }
  }
`

interface TrashedStatusTabProps {
  onLoad: (journeys: string[] | undefined) => void
  sortOrder?: SortOrder
  event: string
}

export function TrashedStatusTab({
  onLoad,
  sortOrder,
  event
}: TrashedStatusTabProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { t } = useTranslation('apps-journeys-admin')
  const { data, loading, error, refetch } =
    useQuery<GetTrashedJourneys>(GET_TRASHED_JOURNEYS)
  const journeys = data?.journeys

  const [restoreTrashed] = useMutation(RESTORE_TRASHED_JOURNEYS, {
    variables: {
      ids: journeys?.map((journey) => journey.id)
    },
    update(cache, { data }) {
      if (data?.journeysRestore != null) void refetch()
    }
  })

  const [deleteTrashed] = useMutation(DELETE_TRASHED_JOURNEYS, {
    variables: {
      ids: journeys?.map((journey) => journey.id)
    },
    update(cache, { data }) {
      if (data?.journeysDelete != null) void refetch()
    }
  })

  const [openRestoreAll, setOpenRestoreAll] = useState(false)
  const [openDeleteAll, setOpenDeleteAll] = useState(false)

  const restoreAll = async (): Promise<void> => {
    await restoreTrashed()
    handleClose()
  }

  const deleteAll = async (): Promise<void> => {
    await deleteTrashed()
    handleClose()
  }

  const handleClose = (): void => {
    setOpenRestoreAll(false)
    setOpenDeleteAll(false)
  }

  const once = useRef(false)
  useEffect(() => {
    if (!once.current) {
      if (!loading && error == null) {
        onLoad(journeys?.map((journey) => journey.id))
        once.current = true
      }
    }
  }, [onLoad, loading, error, journeys, once])

  useEffect(() => {
    switch (event) {
      case 'restoreAllTrashed':
        setOpenRestoreAll(true)
        break
      case 'deleteAllTrashed':
        setOpenDeleteAll(true)
        break
    }
  }, [event])

  // orders of the first characters ascii value
  const sortedJourneys =
    sortOrder === SortOrder.TITLE
      ? sortBy(journeys, 'title')
      : sortBy(journeys, ({ createdAt }) =>
          new Date(createdAt).getTime()
        ).reverse()

  // calculate 40 days ago. may later be replaced by cron job
  const daysAgo = new Date()
  daysAgo.setDate(new Date().getDate() - 40)

  return (
    <>
      {journeys != null ? (
        <>
          {sortedJourneys
            .filter((journey) => new Date(journey.trashedAt) > daysAgo)
            .map((journey) => (
              <JourneyCard key={journey.id} journey={journey} />
            ))}
          {journeys.length === 0 && (
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
                  {t('Your Trashed journeys will appear here.')}
                </Typography>
              </Card>
              <Box width="100%" sx={{ textAlign: 'center' }}>
                <Typography variant="caption">
                  {t('Trashed Journeys are moved here for up to 40 days.')}
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
          title: t('Restore Journeys'),
          closeButton: true
        }}
        dialogAction={{
          onSubmit: restoreAll,
          submitLabel: t('Restore'),
          closeLabel: t('Cancel')
        }}
        divider={true}
        fullscreen={!smUp}
      >
        <Typography>
          {t(
            'Are you sure you would like to restore all trashed journeys immediately?'
          )}
        </Typography>
      </Dialog>
      <Dialog
        open={openDeleteAll ?? false}
        handleClose={handleClose}
        dialogTitle={{
          title: t('Delete Journeys Forever'),
          closeButton: true
        }}
        dialogAction={{
          onSubmit: deleteAll,
          submitLabel: t('Delete Forever'),
          closeLabel: t('Cancel')
        }}
        divider={true}
        fullscreen={!smUp}
      >
        <Typography>
          {t(
            'Are you sure you would like to permanently delete all trashed journeys immediately?'
          )}
        </Typography>
      </Dialog>
    </>
  )
}
