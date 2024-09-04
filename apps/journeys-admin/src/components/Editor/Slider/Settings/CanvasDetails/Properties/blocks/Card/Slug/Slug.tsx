import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { StepBlockSlugUpdate } from '../../../../../../../../../../__generated__/StepBlockSlugUpdate'
import { TextFieldForm } from '../../../../../../../../TextFieldForm'

export const STEP_BLOCK_SLUG_UPDATE = gql`
  mutation StepBlockSlugUpdate($id: ID!, $input: StepBlockUpdateInput!) {
    stepBlockUpdate(id: $id, input: $input) {
      id
      slug
    }
  }
`

export function Slug(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { add } = useCommand()
  const {
    state: { selectedStep }
  } = useEditor()
  const [stepBlockUpdate] = useMutation<StepBlockSlugUpdate>(
    STEP_BLOCK_SLUG_UPDATE
  )

  const slug = selectedStep?.slug ?? selectedStep?.id ?? ''

  function handleUpdate(value?: string): void {
    if (selectedStep == null || value == null) return

    add({
      parameters: {
        execute: {
          slug: value
        },
        undo: {
          slug: selectedStep.slug
        },
        redo: {
          slug
        }
      },
      execute({ slug }) {
        void stepBlockUpdate({
          variables: {
            id: selectedStep.id,
            input: {
              slug
            }
          },
          optimisticResponse: {
            stepBlockUpdate: {
              __typename: 'StepBlock',
              id: selectedStep.id,
              slug: value
            }
          }
        })
      }
    })
  }

  return (
    <TextFieldForm
      id="StepSlugEdit"
      label={t('Card URL edit')}
      initialValue={slug}
      onSubmit={async (value) => handleUpdate(value)}
    />
  )
}
