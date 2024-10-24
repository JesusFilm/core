import { gql, useMutation } from '@apollo/client'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import Plus2 from '@core/shared/ui/icons/Plus2'

import { OrderedList } from '../../OrderedList'
import { OrderedRow } from '../../OrderedRow'
import { Section } from '../../Section'

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
            <OrderedRow
              key={id}
              id={id}
              label={value}
              idx={idx}
              total={totalQuestions}
              onOrderUpdate={updateOrder}
            />
          ))}
        </OrderedList>
      ) : (
        <Section.Fallback>{t('No study questions')}</Section.Fallback>
      )}
    </Section>
  )
}
