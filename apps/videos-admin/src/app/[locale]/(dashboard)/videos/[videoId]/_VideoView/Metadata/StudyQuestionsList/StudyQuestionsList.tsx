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
  const [studyQuestionItems, setStudyQuestionItems] = useState(studyQuestions)
  const [updateStudyQuestionOrder] = useMutation(UPDATE_STUDY_QUESTION_ORDER)

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

  const totalQuestions = studyQuestionItems?.length ?? 0

  return (
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
              menuActions={[{ label: t('Edit'), handler: () => null }]}
            />
          ))}
        </OrderedList>
      ) : (
        <Section.Fallback>{t('No study questions')}</Section.Fallback>
      )}
    </Section>
  )
}
