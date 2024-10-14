import { gql, useMutation } from '@apollo/client'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { Typography } from '@mui/material'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { DraggableRow } from '../DraggableRow'

const UPDATE_STUDY_QUESTION_ORDER = gql`
  mutation UpdateStudyQuestionOrder($input: VideoStudyQuestionUpdateInput!) {
    videoStudyQuestionUpdate(input: $input) {
      id
    }
  }
`

export function StudyQuestions({ studyQuestions }): ReactElement {
  const [updateStudyQuestionOrder] = useMutation(UPDATE_STUDY_QUESTION_ORDER)

  const handleDragEnd = async (e: DragEndEvent) => {
    console.log('drag end', e)
    if (!e.over) return

    if (e.active.id !== e.over.id) {
      const oldIndex = studyQuestions.findIndex(
        (question) => question.id === e.active.id
      )
      const newIndex = studyQuestions.findIndex(
        (question) => question.id === e.over?.id
      )
      console.log({ oldIndex, newIndex })
      // send graphql request to update order
      const res = await updateStudyQuestionOrder({
        variables: {
          input: {
            id: e.active.id,
            languageId: '529',
            order: newIndex + 1
          }
        }
      })

      console.log(res)
    }
  }

  if (studyQuestions == null) return null

  const totalQuestions = studyQuestions?.length ?? 0

  return (
    <>
      <Typography variant="h4">Study Questions</Typography>
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
