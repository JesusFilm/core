import { useMutation } from '@apollo/client'
import { arrayMove } from '@dnd-kit/sortable'
import { FragmentOf, ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { ReactElement, useEffect, useRef, useState } from 'react'

import Plus2 from '@core/shared/ui/icons/Plus2'

import { useDrawerStore } from '../../../../../../../../components/Drawer/store'
import { OrderedItem } from '../../../../../../../../components/OrderedItem'
import { OrderedList } from '../../../../../../../../components/OrderedList'
import { Section } from '../../../../../../../../components/Section'

import { StudyQuestionEditor } from './StudyQuestionEditor'

export const StudyQuestionFragment = graphql(`
  fragment StudyQuestion on StudyQuestion {
    id
    value
    primary
  }
`)

export const TranslationFragment = graphql(`
  fragment TranslationFragment on Snippet {
    id
    value
    primary
    languageId
  }
`)

export const UPDATE_STUDY_QUESTION = graphql(`
  mutation UpdateStudyQuestion($input: VideoStudyQuestionUpdateInput!) {
    videoStudyQuestionUpdate(input: $input) {
      id
      value
    }
  }
`)

export type UpdateStudyQuestion = ResultOf<typeof UPDATE_STUDY_QUESTION>
export type UpdateStudyQuestionVariables = VariablesOf<
  typeof UPDATE_STUDY_QUESTION
>

interface StudyQuestionsProps {
  studyQuestions: Array<FragmentOf<typeof StudyQuestionFragment>>
  reload: () => void
}

export function StudyQuestions({
  studyQuestions: serverStudyQuestions,
  reload
}: StudyQuestionsProps): ReactElement | null {
  const t = useTranslations()
  const openDrawer = useDrawerStore((s) => s.openDrawer)
  const [updateStudyQuestionOrder] = useMutation(UPDATE_STUDY_QUESTION)
  const [studyQuestions, setStudyQuestions] = useState(serverStudyQuestions)
  const prevOrder = useRef(serverStudyQuestions)

  useEffect(() => {
    setStudyQuestions(serverStudyQuestions)
  }, [serverStudyQuestions])

  const updateOrder = async ({
    id,
    newOrder,
    oldOrder
  }: {
    id: string
    newOrder: number
    oldOrder: number
  }): Promise<void> => {
    prevOrder.current = studyQuestions

    setStudyQuestions(arrayMove(studyQuestions, oldOrder, newOrder))

    const { data } = await updateStudyQuestionOrder({
      variables: {
        input: {
          id,
          order: newOrder + 1
        }
      }
    })

    if (data == null) {
      setStudyQuestions(prevOrder.current)
    } else {
      reload()
    }
  }

  if (studyQuestions == null) return null

  const totalQuestions = studyQuestions?.length ?? 0

  return (
    <Section
      title={t('Study Questions')}
      action={{
        label: t('Add Question'),
        startIcon: <Plus2 />,
        onClick: () =>
          openDrawer({
            title: t('Create Study Question'),
            content: <StudyQuestionEditor variant="create" />
          })
      }}
      gridColumn={1}
    >
      {totalQuestions > 0 ? (
        <OrderedList onOrderUpdate={updateOrder} items={studyQuestions}>
          {studyQuestions?.map((studyQuestion, idx) => (
            <OrderedItem
              key={studyQuestion.id}
              id={studyQuestion.id}
              label={studyQuestion.value}
              idx={idx}
              total={totalQuestions}
              onUpdate={updateOrder}
              actions={[
                {
                  label: 'Edit',
                  handler: () =>
                    openDrawer({
                      title: t('Edit Study Question'),
                      content: (
                        <StudyQuestionEditor
                          studyQuestion={studyQuestion}
                          variant="edit"
                        />
                      )
                    })
                }
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
