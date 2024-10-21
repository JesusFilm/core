import { gql, useMutation } from '@apollo/client'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { DraggableRow } from '../DraggableRow'

const UPDATE_STUDY_QUESTION_ORDER = gql`
  mutation UpdateStudyQuestionOrder($input: VideoStudyQuestionUpdateInput!) {
    videoStudyQuestionUpdate(input: $input) {
      id
    }
  }
`

export function StudyQuestions({ studyQuestions }): ReactElement | null {
  const t = useTranslations()
  const [updateStudyQuestionOrder] = useMutation(UPDATE_STUDY_QUESTION_ORDER)

  const handleDragEnd = async (e: DragEndEvent): Promise<void> => {
    if (e.over == null) return

    if (e.active.id !== e.over.id) {
      const oldIndex = studyQuestions.findIndex(
        (question) => question.id === e.active.id
      )
      const newIndex = studyQuestions.findIndex(
        (question) => question.id === e.over?.id
      )
      await updateStudyQuestionOrder({
        variables: {
          input: {
            id: e.active.id,
            order: newIndex + 1
          }
        }
      })
    }
  }

  if (studyQuestions == null) return null

  const totalQuestions = studyQuestions?.length ?? 0

  return (
    <>
      <Typography variant="h4">{t('Study Questions')}</Typography>
      <DndContext onDragEnd={handleDragEnd}>
        <SortableContext items={studyQuestions}>
          <Stack gap={1}>
            {studyQuestions?.map(({ id, value }, idx) => (
              <DraggableRow
                id={id}
                key={id}
                label={value}
                idx={idx}
                count={totalQuestions}
              />
            ))}
          </Stack>
        </SortableContext>
      </DndContext>
    </>
  )
}
