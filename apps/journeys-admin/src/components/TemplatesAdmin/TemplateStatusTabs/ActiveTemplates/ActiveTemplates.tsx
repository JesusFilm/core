import Typography from '@mui/material/Typography'
import { ReactElement, useState, useEffect } from 'react'
import { gql, useMutation, useQuery } from '@apollo/client'
import { AuthUser } from 'next-firebase-auth'
import { useSnackbar } from 'notistack'
import Card from '@mui/material/Card'
import { SortOrder } from '../../../JourneyList/JourneySort'
import { Dialog } from '../../../Dialog'
import { sortJourneys } from '../../../JourneyList/JourneySort/utils/sortJourneys'
import {
  ARCHIVE_ACTIVE_JOURNEYS,
  TRASH_ACTIVE_JOURNEYS
} from '../../../JourneyList/StatusTabPanel/ActiveStatusTab/ActiveStatusTab'
import {
  GetActivePublisherTemplates,
  GetActivePublisherTemplates_journeys as Journey
} from '../../../../../__generated__/GetActivePublisherTemplates'
import { TemplateCard } from '../../../TemplateList/TemplateCard'
import { getDuplicatedJourney } from '../../../JourneyList/StatusTabPanel/ActiveStatusTab/utils/getDuplicatedJourney'

export const GET_ACTIVE_PUBLISHER_TEMPLATES = gql`
  query GetActivePublisherTemplates {
    journeys: adminJourneys(status: [draft, published], template: true) {
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

interface ActiveTemplatesProps {
  onLoad: () => void
  event: string | undefined
  sortOrder?: SortOrder
  authUser?: AuthUser
}

export function ActiveTemplates({
  onLoad,
  event,
  sortOrder,
  authUser
}: ActiveTemplatesProps): ReactElement {
  const { data, loading, error, refetch } =
    useQuery<GetActivePublisherTemplates>(GET_ACTIVE_PUBLISHER_TEMPLATES)

  const [journeys, setJourneys] = useState<Journey[]>()
  const [oldJourneys, setOldJourneys] = useState<Journey[]>()
  const [openArchiveAll, setOpenArchiveAll] = useState(false)
  const [openTrashAll, setOpenTrashAll] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    setOldJourneys(journeys)
    setJourneys(data?.journeys)
  }, [data, journeys, oldJourneys])

  const duplicatedJourneyId = getDuplicatedJourney(oldJourneys, journeys)

  const [archiveActive] = useMutation(ARCHIVE_ACTIVE_JOURNEYS, {
    variables: {
      ids: journeys?.map((journey) => journey.id)
    },
    update(cache, { data }) {
      if (data?.journeysArchive != null) {
        enqueueSnackbar('Journeys Archived', {
          variant: 'success'
        })
        void refetch()
      }
    }
  })

  const [trashActive] = useMutation(TRASH_ACTIVE_JOURNEYS, {
    variables: {
      ids: journeys?.map((journey) => journey.id)
    },
    update(cache, { data }) {
      if (data?.journeysTrash != null) {
        enqueueSnackbar('Journeys Trashed', {
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

  const handleClose = (): void => {
    setOpenArchiveAll(false)
    setOpenTrashAll(false)
  }

  const archiveAll = async (): Promise<void> => {
    try {
      await archiveActive()
    } catch (error) {
      snackbarError(error)
    }
    handleClose()
  }

  const trashAll = async (): Promise<void> => {
    try {
      await trashActive()
    } catch (error) {
      snackbarError(error)
    }
    handleClose()
  }

  useEffect(() => {
    if (!loading && error == null) {
      onLoad()
    }
  }, [onLoad, loading, error])

  useEffect(() => {
    switch (event) {
      case 'archiveAllActive':
        setOpenArchiveAll(true)
        break
      case 'trashAllActive':
        setOpenTrashAll(true)
        break
      case 'refetchActive':
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
              admin
              refetch={refetch}
              duplicatedJourneyId={duplicatedJourneyId}
            />
          ))}
          {sortedJourneys.length === 0 && (
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
                No templates to display.
              </Typography>
            </Card>
          )}
        </>
      ) : (
        <>
          <TemplateCard />
          <TemplateCard />
          <TemplateCard />
        </>
      )}

      <Dialog
        open={openArchiveAll ?? false}
        handleClose={handleClose}
        dialogTitle={{
          title: 'Archive Templates',
          closeButton: true
        }}
        dialogAction={{
          onSubmit: archiveAll,
          submitLabel: 'Archive',
          closeLabel: 'Cancel'
        }}
      >
        <Typography>
          Are you sure you would like to archive all active templates
          immediately?
        </Typography>
      </Dialog>
      <Dialog
        open={openTrashAll ?? false}
        handleClose={handleClose}
        dialogTitle={{
          title: 'Trash Templates',
          closeButton: true
        }}
        dialogAction={{
          onSubmit: trashAll,
          submitLabel: 'Trash',
          closeLabel: 'Cancel'
        }}
      >
        <Typography>
          Are you sure you would like to trash all active templates immediately?
        </Typography>
      </Dialog>
    </>
  )
}
