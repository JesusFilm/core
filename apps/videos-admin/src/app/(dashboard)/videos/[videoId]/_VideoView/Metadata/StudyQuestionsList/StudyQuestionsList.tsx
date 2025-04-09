import { useApolloClient, useMutation } from '@apollo/client'
import { DragEndEvent } from '@dnd-kit/core'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useSnackbar } from 'notistack'
import { ReactElement, useCallback, useState } from 'react'

import { OrderedList } from '../../../../../../../components/OrderedList'
import { OrderedItem } from '../../../../../../../components/OrderedList/OrderedItem'
import { GET_ADMIN_VIDEO } from '../../../../../../../libs/useAdminVideo'
import { GetAdminVideo_AdminVideo_StudyQuestions as StudyQuestions } from '../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useVideo } from '../../../../../../../libs/VideoProvider'
import { Section } from '../../Section'

import { StudyQuestionCreate } from './StudyQuestionCreate'
import { StudyQuestionDialog } from './StudyQuestionDialog'

export const UPDATE_STUDY_QUESTION_ORDER = graphql(`
  mutation UpdateStudyQuestionOrder($input: VideoStudyQuestionUpdateInput!) {
    videoStudyQuestionUpdate(input: $input) {
      id
      value
    }
  }
`)

export const DELETE_STUDY_QUESTION = graphql(`
  mutation DeleteStudyQuestion($id: ID!) {
    videoStudyQuestionDelete(id: $id) {
      id
    }
  }
`)

export type UpdateStudyQuestionOrder = ResultOf<
  typeof UPDATE_STUDY_QUESTION_ORDER
>
export type UpdateStudyQuestionOrderVariables = VariablesOf<
  typeof UPDATE_STUDY_QUESTION_ORDER
>

export type DeleteStudyQuestion = ResultOf<typeof DELETE_STUDY_QUESTION>
export type DeleteStudyQuestionVariables = VariablesOf<
  typeof DELETE_STUDY_QUESTION
>

interface StudyQuestionsListProps {
  studyQuestions: StudyQuestions
}

export function StudyQuestionsList({
  studyQuestions
}: StudyQuestionsListProps): ReactElement | null {
  const video = useVideo()
  const apolloClient = useApolloClient()
  const { enqueueSnackbar } = useSnackbar()

  const [studyQuestionItems, setStudyQuestionItems] = useState(studyQuestions)
  const [selectedQuestion, setSelectedQuestion] = useState<{
    id: string
    value: string
  } | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null)

  // Function to refetch the video data
  const refetchVideoData = useCallback(async () => {
    try {
      const result = await apolloClient.refetchQueries({
        include: [GET_ADMIN_VIDEO],
        updateCache(cache) {
          // Force clear any cached video data to ensure we get fresh data
          cache.evict({ fieldName: 'adminVideo', args: { id: video.id } })
          cache.gc()
        }
      })
      return result
    } catch (error) {
      console.error('Error refetching video data:', error)
      throw error
    }
  }, [apolloClient, video.id])

  const [updateStudyQuestionOrder] = useMutation<
    UpdateStudyQuestionOrder,
    UpdateStudyQuestionOrderVariables
  >(UPDATE_STUDY_QUESTION_ORDER, {
    onCompleted: async () => {
      try {
        await refetchVideoData()
      } catch (error) {
        console.error('Error refetching after order update:', error)
      }
    },
    onError: (error) => {
      enqueueSnackbar(error.message, { variant: 'error' })
    }
  })

  const [deleteStudyQuestion, { loading: deleteLoading }] = useMutation(
    DELETE_STUDY_QUESTION,
    {
      onCompleted: async () => {
        enqueueSnackbar('Study question deleted', { variant: 'success' })
        try {
          await refetchVideoData()
        } catch (error) {
          console.error('Error refetching after delete:', error)
        }
        handleCloseDeleteDialog()
      },
      onError: (error) => {
        enqueueSnackbar(error.message, { variant: 'error' })
      }
    }
  )

  async function updateOrderOnDrag(e: DragEndEvent): Promise<void> {
    const { active, over } = e
    if (over == null) return
    if (e.active.id !== over.id) {
      const newIndex = studyQuestions.findIndex((item) => item.id === over.id)

      const questionToMove = studyQuestions.find((q) => q.id === active.id)
      if (!questionToMove) return

      try {
        await updateStudyQuestionOrder({
          variables: {
            input: { id: active.id.toString(), order: newIndex + 1 }
          }
        })
      } catch (error) {
        console.error('Error updating study question order:', error)
      }
    }
  }

  const handleEdit = (question: { id: string; value: string }) => {
    setSelectedQuestion(question)
  }

  const handleCloseDialog = () => {
    setSelectedQuestion(null)
  }

  const handleOpenDeleteDialog = (id: string): void => {
    setQuestionToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleCloseDeleteDialog = (): void => {
    setDeleteDialogOpen(false)
    setQuestionToDelete(null)
  }

  const handleDeleteQuestion = async (): Promise<void> => {
    if (questionToDelete === null) return

    try {
      await deleteStudyQuestion({
        variables: {
          id: questionToDelete
        }
      })

      setStudyQuestionItems((items) =>
        items.filter((item) => item.id !== questionToDelete)
      )

      enqueueSnackbar('Study question deleted', {
        variant: 'success'
      })

      handleCloseDeleteDialog()
    } catch (error) {
      console.error('Error deleting study question:', error)
    }
  }

  const totalQuestions = studyQuestionItems?.length ?? 0

  return (
    <>
      <Section title="Study Questions" variant="outlined">
        {totalQuestions > 0 ? (
          <OrderedList onOrderUpdate={updateOrderOnDrag} items={studyQuestions}>
            {studyQuestions?.map(({ id, value }, idx) => (
              <OrderedItem
                key={id}
                id={id}
                label={value}
                idx={idx}
                menuActions={[
                  {
                    label: 'Edit',
                    handler: () => handleEdit({ id, value })
                  },
                  {
                    label: 'Delete',
                    handler: () => handleOpenDeleteDialog(id)
                  }
                ]}
              />
            ))}
          </OrderedList>
        ) : (
          <Section.Fallback>No study questions</Section.Fallback>
        )}
        <StudyQuestionCreate
          studyQuestions={studyQuestions}
          onQuestionAdded={refetchVideoData}
        />
      </Section>
      {selectedQuestion != null && (
        <StudyQuestionDialog
          open={true}
          onClose={handleCloseDialog}
          studyQuestion={selectedQuestion}
          onQuestionUpdated={refetchVideoData}
        />
      )}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-study-question-dialog-title"
      >
        <DialogTitle id="delete-study-question-dialog-title">
          Delete Study Question
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this study question? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteQuestion}
            color="error"
            disabled={deleteLoading}
            autoFocus
          >
            {deleteLoading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
