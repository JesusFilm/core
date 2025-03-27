import { useMutation } from '@apollo/client'
import { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { OrderedList } from '../../../../../../../../components/OrderedList'
import { OrderedItem } from '../../../../../../../../components/OrderedList/OrderedItem'
import { GetAdminVideo_AdminVideo_StudyQuestions as StudyQuestions } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { Section } from '../../Section'

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
  const t = useTranslations()
  const { enqueueSnackbar } = useSnackbar()
  const [studyQuestionItems, setStudyQuestionItems] = useState(studyQuestions)
  const [updateStudyQuestionOrder] = useMutation(UPDATE_STUDY_QUESTION_ORDER)
  const [deleteStudyQuestion, { loading: deleteLoading }] = useMutation(
    DELETE_STUDY_QUESTION
  )
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null)

  async function updateOrderOnDrag(e: DragEndEvent): Promise<void> {
    const { active, over } = e
    if (over == null) return
    if (e.active.id !== over.id) {
      const oldIndex = studyQuestionItems.findIndex(
        (item) => item.id === active.id
      )
      const newIndex = studyQuestionItems.findIndex(
        (item) => item.id === over.id
      )
      setStudyQuestionItems((items) => {
        return arrayMove(items, oldIndex, newIndex)
      })
      await updateStudyQuestionOrder({
        variables: {
          input: { id: active.id.toString(), order: newIndex + 1 }
        }
      })
    }
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

      enqueueSnackbar(t('Study question deleted'), {
        variant: 'success'
      })

      handleCloseDeleteDialog()
    } catch (error) {
      if (error instanceof Error) {
        enqueueSnackbar(error.message, {
          variant: 'error'
        })
      }
    }
  }

  const totalQuestions = studyQuestionItems?.length ?? 0

  return (
    <>
      <Section title={t('Study Questions')} variant="outlined">
        {totalQuestions > 0 ? (
          <OrderedList
            onOrderUpdate={updateOrderOnDrag}
            items={studyQuestionItems}
          >
            {studyQuestionItems?.map(({ id, value }, idx) => (
              <OrderedItem
                key={id}
                id={id}
                label={value}
                idx={idx}
                menuActions={[
                  { label: t('Edit'), handler: () => null },
                  {
                    label: t('Delete'),
                    handler: () => handleOpenDeleteDialog(id)
                  }
                ]}
              />
            ))}
          </OrderedList>
        ) : (
          <Section.Fallback>{t('No study questions')}</Section.Fallback>
        )}
      </Section>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-study-question-dialog-title"
      >
        <DialogTitle id="delete-study-question-dialog-title">
          {t('Delete Study Question')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              'Are you sure you want to delete this study question? This action cannot be undone.'
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
            {t('Cancel')}
          </Button>
          <Button
            onClick={handleDeleteQuestion}
            color="error"
            disabled={deleteLoading}
            autoFocus
          >
            {deleteLoading ? <CircularProgress size={20} /> : t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
