import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { ActiveFab, useEditor } from '@core/journeys/ui/EditorProvider'
import { FORM_FIELDS } from '@core/journeys/ui/Form/formFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import File5Icon from '@core/shared/ui/icons/File5'

import type { FormBlockCreate } from '../../../../../../../../__generated__/FormBlockCreate'
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
    state: { selectedStep },
    dispatch
  } = useEditor()
  const { addBlockCommand } = useBlockCreateCommand()

  async function handleClick(): Promise<void> {
    const id = uuidv4()

    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    )

    if (card != null && journey != null) {
      const { data } = await addBlockCommand(formBlockCreate, {
        variables: {
          input: {
            id,
            journeyId: journey.id,
            parentBlockId: card.id
          }
        },
        update(cache, { data }) {
          if (data?.formBlockCreate != null) {
            cache.modify({
              id: cache.identify({ __typename: 'Journey', id: journey.id }),
              fields: {
                blocks(existingBlocksRefs = []) {
                  const newBlockRef = cache.writeFragment({
                    data: data.formBlockCreate,
                    fragment: gql`
                      fragment NewBlock on Block {
                        id
                      }
                    `
                  })
                  return [...existingBlocksRefs, newBlockRef]
                }
              }
            })
          }
        }
      })
      if (data?.formBlockCreate != null) {
        dispatch({
          type: 'SetActiveFabAction',
          activeFab: ActiveFab.Save
        })
      }
    }
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
