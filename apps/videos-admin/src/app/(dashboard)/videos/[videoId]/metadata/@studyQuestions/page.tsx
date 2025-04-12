'use client'

import { useMutation, useQuery } from '@apollo/client'
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
import { ReactElement, Suspense, useState } from 'react'

import { OrderedList } from '../../../../../../components/OrderedList'
import { OrderedItem } from '../../../../../../components/OrderedList/OrderedItem'
import { Section } from '../../../../../../components/Section'

import { StudyQuestionCreate } from './StudyQuestionCreate'
import { StudyQuestionDialog } from './StudyQuestionDialog'

const UPDATE_STUDY_QUESTION_ORDER = graphql(`
  mutation UpdateStudyQuestionOrder($input: VideoStudyQuestionUpdateInput!) {
    videoStudyQuestionUpdate(input: $input) {
      id
      order
    }
  }
`)

const DELETE_STUDY_QUESTION = graphql(`
  mutation DeleteStudyQuestion($id: ID!) {
    videoStudyQuestionDelete(id: $id) {
      id
    }
  }
`)

const GET_STUDY_QUESTIONS = graphql(`
  query GetStudyQuestions($videoId: ID!) {
    adminVideo(id: $videoId) {
      id
      studyQuestions {
        id
        value
        order
      }
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

export type GetStudyQuestions = ResultOf<typeof GET_STUDY_QUESTIONS>
export type GetStudyQuestionsVariables = VariablesOf<typeof GET_STUDY_QUESTIONS>

interface StudyQuestionsListProps {
  params: { videoId: string }
}

export default function StudyQuestionsList({
  params: { videoId }
}: StudyQuestionsListProps): ReactElement | null {
  const { enqueueSnackbar } = useSnackbar()

  // Use regular useQuery to handle loading states
  const { data, refetch } = useQuery<
    GetStudyQuestions,
    GetStudyQuestionsVariables
  >(GET_STUDY_QUESTIONS, {
    variables: { videoId },
    fetchPolicy: 'cache-and-network'
  })

  const [selectedQuestion, setSelectedQuestion] = useState<{
    id: string
    value: string
  } | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null)

  const [updateStudyQuestionOrder] = useMutation<
    UpdateStudyQuestionOrder,
    UpdateStudyQuestionOrderVariables
  >(UPDATE_STUDY_QUESTION_ORDER, {
    onError: (error) => {
      enqueueSnackbar(error.message, { variant: 'error' })
    }
  })

  const [deleteStudyQuestion, { loading: deleteLoading }] = useMutation(
    DELETE_STUDY_QUESTION,
    {
      onCompleted: () => {
        enqueueSnackbar('Study question deleted', { variant: 'success' })
        handleCloseDeleteDialog()
      },
      onError: (error) => {
        enqueueSnackbar(error.message, { variant: 'error' })
      }
    }
  )

  async function updateOrderOnDrag(e: DragEndEvent): Promise<void> {
    const { active, over } = e
    if (over == null || data == null) return
    if (e.active.id !== over.id) {
      const oldIndex = data.adminVideo.studyQuestions.findIndex(
        (item) => item.id === active.id
      )
      const newIndex = data.adminVideo.studyQuestions.findIndex(
        (item) => item.id === over.id
      )

      const questionToMove = data.adminVideo.studyQuestions.find(
        (q) => q.id === active.id
      )
      if (!questionToMove) return

      // Create a new array with the reordered items
      const updatedQuestions = [...data.adminVideo.studyQuestions]
      const [movedItem] = updatedQuestions.splice(oldIndex, 1)
      updatedQuestions.splice(newIndex, 0, movedItem)

      try {
        // Update all questions in sequence without updating cache each time
        for (let i = 0; i < updatedQuestions.length; i++) {
          const question = updatedQuestions[i]
          await updateStudyQuestionOrder({
            variables: {
              input: { id: question.id, order: i + 1 }
            }
          })
        }
        enqueueSnackbar('Question order updated', { variant: 'success' })
        void refetch()
      } catch (error) {
        enqueueSnackbar('Error updating study question order:', error)
        void refetch()
      }
    }
  }

  const handleEdit = (question: { id: string; value: string }) => {
    setSelectedQuestion(question)
  }

  const handleCloseDialog = () => {
    setSelectedQuestion(null)
    void refetch()
  }

  const handleOpenDeleteDialog = (id: string): void => {
    setQuestionToDelete(id)
    setDeleteDialogOpen(true)
    void refetch()
  }

  const handleCloseDeleteDialog = (): void => {
    setDeleteDialogOpen(false)
    setQuestionToDelete(null)
    void refetch()
  }

  const handleDeleteQuestion = async (): Promise<void> => {
    if (questionToDelete === null) return

    try {
      await deleteStudyQuestion({
        variables: {
          id: questionToDelete
        }
      })
    } catch (error) {
      enqueueSnackbar('Error deleting study question:', error)
      await refetch()
    }
  }

  return (
    <Suspense fallback={<CircularProgress />}>
      <Section title="Study Questions" variant="outlined">
        {data != null && data.adminVideo.studyQuestions.length > 0 ? (
          <OrderedList
            onOrderUpdate={updateOrderOnDrag}
            items={data.adminVideo.studyQuestions}
          >
            {data.adminVideo.studyQuestions.map(({ id, value, order }) => (
              <OrderedItem
                key={id}
                id={id}
                label={value}
                idx={order - 1}
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
          order={(data?.adminVideo.studyQuestions.length ?? 0) + 1}
          videoId={videoId}
          onQuestionAdded={() => {
            void refetch()
          }}
        />
      </Section>
      {selectedQuestion != null && (
        <StudyQuestionDialog
          open={true}
          onClose={handleCloseDialog}
          studyQuestion={selectedQuestion}
          videoId={videoId}
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
    </Suspense>
  )
}
