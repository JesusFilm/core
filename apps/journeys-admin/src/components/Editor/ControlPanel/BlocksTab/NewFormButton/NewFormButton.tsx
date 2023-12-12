import { gql, useMutation } from '@apollo/client'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'

import {
  ActiveFab,
  ActiveTab,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { FORM_FIELDS } from '@core/journeys/ui/Form/formFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import StarsIcon from '@core/shared/ui/icons/Stars'

import { FormBlockCreate } from '../../../../../../__generated__/FormBlockCreate'
import { Button } from '../../Button'

export const FORM_BLOCK_CREATE = gql`
  ${FORM_FIELDS}
  mutation FormBlockCreate($input: FormBlockCreateInput!) {
    formBlockCreate(input: $input) {
      ...FormFields
    }
  }
`

export function NewFormButton(): ReactElement {
  const [formBlockCreate] = useMutation<FormBlockCreate>(FORM_BLOCK_CREATE)
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()

  async function handleClick(): Promise<void> {
    const id = uuidv4()

    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    )

    if (card != null && journey != null) {
      const { data } = await formBlockCreate({
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
          type: 'SetSelectedBlockByIdAction',
          id: data.formBlockCreate.id
        })
        dispatch({
          type: 'SetActiveTabAction',
          activeTab: ActiveTab.Properties
        })
        dispatch({
          type: 'SetActiveFabAction',
          activeFab: ActiveFab.Save
        })
      }
    }
  }

  return (
    <Button
      icon={<StarsIcon />}
      value={t('Form')}
      onClick={handleClick}
      testId="NewFormiumFormIcon"
    />
  )
}
