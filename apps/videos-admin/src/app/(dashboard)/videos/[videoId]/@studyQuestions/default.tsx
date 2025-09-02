'use client'

import { useMutation, useQuery } from '@apollo/client'
import { DragEndEvent } from '@dnd-kit/core'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { usePathname, useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'

import { graphql } from '@core/shared/gql'

import { OrderedList } from '../../../../../components/OrderedList'
import { OrderedItem } from '../../../../../components/OrderedList/OrderedItem'
import { Section } from '../../../../../components/Section'
import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../constants'

const UPDATE_STUDY_QUESTION_ORDER = graphql(`
  mutation UpdateStudyQuestionOrder($input: VideoStudyQuestionUpdateInput!) {
    videoStudyQuestionUpdate(input: $input) {
      id
      order
    }
  }
`)

const GET_STUDY_QUESTIONS = graphql(`
  query GetStudyQuestions($videoId: ID!, $languageId: ID!) {
    adminVideo(id: $videoId) {
      id
      studyQuestions(languageId: $languageId) {
        id
        value
        order
      }
    }
  }
`)

interface StudyQuestionsListProps {
  params: {
    videoId: string
  }
}

export default function StudyQuestionsList({
  params: { videoId }
}: StudyQuestionsListProps): ReactElement {
  const router = useRouter()
  const pathname = usePathname()
  const [reloadOnPathChange, setReloadOnPathChange] = useState(false)

  const { enqueueSnackbar } = useSnackbar()

  // Use regular useQuery to handle loading states
  const { data, refetch } = useQuery(GET_STUDY_QUESTIONS, {
    variables: { videoId, languageId: DEFAULT_VIDEO_LANGUAGE_ID }
  })

  const [updateStudyQuestionOrder] = useMutation(UPDATE_STUDY_QUESTION_ORDER, {
    onError: (error) => {
      enqueueSnackbar(error.message, { variant: 'error' })
    }
  })

  // refresh questions if studyQuestions may have changed
  useEffect(() => {
    if (reloadOnPathChange) void refetch()
    setReloadOnPathChange(pathname?.includes('studyQuestion') ?? false)
  }, [pathname])

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

  return (
    <>
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
                    handler: () =>
                      router.push(`/videos/${videoId}/studyQuestion/${id}`, {
                        scroll: false
                      })
                  },
                  {
                    label: 'Delete',
                    handler: () =>
                      router.push(
                        `/videos/${videoId}/studyQuestion/${id}/delete`,
                        {
                          scroll: false
                        }
                      )
                  }
                ]}
              />
            ))}
          </OrderedList>
        ) : (
          <Section.Fallback>No study questions</Section.Fallback>
        )}
        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={() =>
              router.push(`/videos/${videoId}/studyQuestion/add`, {
                scroll: false
              })
            }
            size="small"
            color="secondary"
          >
            Add
          </Button>
        </Stack>
      </Section>
    </>
  )
}
