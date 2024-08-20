import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { FORM_FIELDS } from '@core/journeys/ui/Form/formFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import File5Icon from '@core/shared/ui/icons/File5'

import { BlockFields_FormBlock as FormBlock } from '../../../../../../../../__generated__/BlockFields'
import type { FormBlockCreate } from '../../../../../../../../__generated__/FormBlockCreate'
import { blockCreateUpdate } from '../../../../../utils/blockCreateUpdate'
import { useBlockCreateCommand } from '../../../../../utils/useBlockCreateCommand'
import { Button } from '../Button'

export const FORM_BLOCK_CREATE = gql`
  ${FORM_FIELDS}
  mutation FormBlockCreate($input: FormBlockCreateInput!) {
    formBlockCreate(input: $input) {
      ...FormFields
    }
  }
`

export function NewFormButton(): ReactElement {
  const [formBlockCreate, { loading }] =
    useMutation<FormBlockCreate>(FORM_BLOCK_CREATE)
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const {
    state: { selectedStep }
  } = useEditor()
  const { addBlock } = useBlockCreateCommand()

  function handleClick(): void {
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    )

    if (card == null || journey == null) return

    const formBlock: FormBlock = {
      id: uuidv4(),
      parentBlockId: card.id,
      parentOrder: card.children.length ?? 0,
      form: null,
      action: null,
      __typename: 'FormBlock'
    }
    addBlock({
      block: formBlock,
      execute() {
        void formBlockCreate({
          variables: {
            input: {
              id: formBlock.id,
              journeyId: journey.id,
              parentBlockId: formBlock.parentBlockId
            }
          },
          optimisticResponse: {
            formBlockCreate: formBlock
          },
          update(cache, { data }) {
            blockCreateUpdate(cache, journey?.id, data?.formBlockCreate)
          }
        })
      }
    })
  }

  return (
    <Button
      icon={<File5Icon />}
      value={t('Form')}
      onClick={handleClick}
      testId="NewFormiumFormIcon"
      disabled={loading}
    />
  )
}
