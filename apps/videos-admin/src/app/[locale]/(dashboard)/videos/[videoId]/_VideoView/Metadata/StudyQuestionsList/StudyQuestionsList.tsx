import { useMutation } from '@apollo/client'
import { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { ReactElement, useState } from 'react'

import { OrderedList } from '../../../../../../../../components/OrderedList'
import { OrderedItem } from '../../../../../../../../components/OrderedList/OrderedItem'
import { GetAdminVideo_AdminVideo_StudyQuestions as StudyQuestions } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'
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

export type UpdateStudyQuestionOrder = ResultOf<
  typeof UPDATE_STUDY_QUESTION_ORDER
>
export type UpdateStudyQuestionOrderVariables = VariablesOf<
  typeof UPDATE_STUDY_QUESTION_ORDER
>

interface StudyQuestionsListProps {
  studyQuestions: StudyQuestions
}

export function StudyQuestionsList({
  studyQuestions
}: StudyQuestionsListProps): ReactElement | null {
  const t = useTranslations()
  const [selectedQuestion, setSelectedQuestion] = useState<{
    id: string
    value: string
  } | null>(null)

  const [updateStudyQuestionOrder] = useMutation<
    UpdateStudyQuestionOrder,
    UpdateStudyQuestionOrderVariables
  >(UPDATE_STUDY_QUESTION_ORDER, {
    update: (cache, { data }) => {
      if (!data?.videoStudyQuestionUpdate) return
    }
  })

  async function updateOrderOnDrag(e: DragEndEvent): Promise<void> {
    const { active, over } = e
    if (over == null) return
    if (e.active.id !== over.id) {
      const oldIndex = studyQuestions.findIndex((item) => item.id === active.id)
      const newIndex = studyQuestions.findIndex((item) => item.id === over.id)

      const questionToMove = studyQuestions.find((q) => q.id === active.id)
      if (!questionToMove) return

      await updateStudyQuestionOrder({
        variables: {
          input: { id: active.id.toString(), order: newIndex + 1 }
        }
      })
    }
  }

  const handleEdit = (question: { id: string; value: string }) => {
    setSelectedQuestion(question)
  }

  const handleCloseDialog = () => {
    setSelectedQuestion(null)
  }

  const totalQuestions = studyQuestions?.length ?? 0

  return (
    <>
      <Section title={t('Study Questions')} variant="outlined">
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
                    label: t('Edit'),
                    handler: () => handleEdit({ id, value })
                  }
                ]}
              />
            ))}
          </OrderedList>
        ) : (
          <Section.Fallback>{t('No study questions')}</Section.Fallback>
        )}
        <StudyQuestionCreate studyQuestions={studyQuestions} />
      </Section>
      {selectedQuestion != null && (
        <StudyQuestionDialog
          open={true}
          onClose={handleCloseDialog}
          studyQuestion={selectedQuestion}
        />
      )}
    </>
  )
}
