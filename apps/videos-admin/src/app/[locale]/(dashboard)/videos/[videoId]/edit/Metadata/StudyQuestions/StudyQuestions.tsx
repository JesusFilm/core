import { gql, useMutation } from '@apollo/client'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { DraggableRow } from '../../DraggableRow'
import { Section } from '../../Section'
import { useTranslations } from 'next-intl'

import Plus2 from '@core/shared/ui/icons/Plus2'

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
      const newIndex = studyQuestions.findIndex(
        (question) => question.id === e.over?.id
      )

      updateOrder({ id: e.active.id as string, order: newIndex + 1 })
    }
  }

  const updateOrder = async (input: {
    id: string
    order: number
  }): Promise<void> => {
    await updateStudyQuestionOrder({
      variables: {
        input
      }
    })
  }

  if (studyQuestions == null) return null

  const totalQuestions = studyQuestions?.length ?? 0

  return (
    <Section
      title={t('Study Questions')}
      action={{
        label: t('Add Question'),
        startIcon: <Plus2 />,
        onClick: () => alert('Create new Question')
      }}
    >
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
                handleOrderChange={updateOrder}
              />
            ))}
          </Stack>
        </SortableContext>
      </DndContext>
    </Section>
  )
}
