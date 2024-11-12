import { gql, useMutation } from '@apollo/client'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import Plus2 from '@core/shared/ui/icons/Plus2'

import { OrderedItem } from '../../OrderedItem'
import { OrderedList } from '../../OrderedList'
import { Section } from '../../Section'
import { graphql, VariablesOf } from 'gql.tada'
import { ResultOf } from 'gql.tada'

export const UPDATE_STUDY_QUESTION_ORDER = graphql(`
  mutation UpdateStudyQuestionOrder($input: VideoStudyQuestionUpdateInput!) {
    videoStudyQuestionUpdate(input: $input) {
      id
    }
  }
`)

export type UpdateStudyQuestionOrder = ResultOf<typeof UPDATE_STUDY_QUESTION_ORDER>
export type UpdateStudyQuestionOrderVariables = VariablesOf<
  typeof UPDATE_STUDY_QUESTION_ORDER
>

interface StudyQuestionsProps {
  studyQuestions: Array<{ id: string, value: string }>
}

export function StudyQuestions({ studyQuestions }: StudyQuestionsProps): ReactElement | null {
  const t = useTranslations()
  const [updateStudyQuestionOrder] = useMutation(UPDATE_STUDY_QUESTION_ORDER)

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
      {totalQuestions > 0 ? (
        <OrderedList onOrderUpdate={updateOrder} items={studyQuestions}>
          {studyQuestions?.map(({ id, value }, idx) => (
            <OrderedItem
              key={id}
              id={id}
              label={value}
              idx={idx}
              total={totalQuestions}
              onOrderUpdate={updateOrder}
              actions={[
                { label: 'view', handler: () => null}
              ]}
            />
          ))}
        </OrderedList>
      ) : (
        <Section.Fallback>{t('No study questions')}</Section.Fallback>
      )}
    </Section>
  )
}
