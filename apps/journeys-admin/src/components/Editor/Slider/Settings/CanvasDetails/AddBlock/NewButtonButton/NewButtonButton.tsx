import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { BUTTON_FIELDS } from '@core/journeys/ui/Button/buttonFields'
import { ActiveFab, useEditor } from '@core/journeys/ui/EditorProvider'
import { ICON_FIELDS } from '@core/journeys/ui/Icon/iconFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import Cursor6Icon from '@core/shared/ui/icons/Cursor6'

import { BlockFields_CardBlock as CardBlock } from '../../../../../../../../__generated__/BlockFields'
import { ButtonBlockCreate } from '../../../../../../../../__generated__/ButtonBlockCreate'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../../../../../../__generated__/globalTypes'
import { useBlockCreateCommand } from '../../../../../utils/useBlockCreateCommand/useBlockCreateCommand'
import { Button } from '../Button'

export const BUTTON_BLOCK_CREATE = gql`
  ${BUTTON_FIELDS}
  ${ICON_FIELDS}
  mutation ButtonBlockCreate(
    $input: ButtonBlockCreateInput!
    $iconBlockCreateInput1: IconBlockCreateInput!
    $iconBlockCreateInput2: IconBlockCreateInput!
    $id: ID!
    $journeyId: ID!
    $updateInput: ButtonBlockUpdateInput!
  ) {
    buttonBlockCreate(input: $input) {
      ...ButtonFields
    }
    startIcon: iconBlockCreate(input: $iconBlockCreateInput1) {
      ...IconFields
    }
    endIcon: iconBlockCreate(input: $iconBlockCreateInput2) {
      ...IconFields
    }
    buttonBlockUpdate(id: $id, journeyId: $journeyId, input: $updateInput) {
      ...ButtonFields
    }
  }
`

export function NewButtonButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [buttonBlockCreate, { loading }] =
    useMutation<ButtonBlockCreate>(BUTTON_BLOCK_CREATE)
  const { journey } = useJourney()
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()
  const { addBlock } = useBlockCreateCommand()

  const handleClick = async (): Promise<void> => {
    const id = uuidv4()
    const startId = uuidv4()
    const endId = uuidv4()
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined
    if (card != null && journey != null) {
      await addBlock({
        async execute() {
          const { data } = await buttonBlockCreate({
            variables: {
              input: {
                id,
                journeyId: journey.id,
                parentBlockId: card.id,
                label: '',
                variant: ButtonVariant.contained,
                color: ButtonColor.primary,
                size: ButtonSize.medium
              },
              iconBlockCreateInput1: {
                id: startId,
                journeyId: journey.id,
                parentBlockId: id,
                name: null
              },
              iconBlockCreateInput2: {
                id: endId,
                journeyId: journey.id,
                parentBlockId: id,
                name: null
              },
              id,
              journeyId: journey.id,
              updateInput: {
                startIconId: startId,
                endIconId: endId
              }
            },
            update(cache, { data }) {
              if (data?.buttonBlockUpdate != null) {
                cache.modify({
                  id: cache.identify({ __typename: 'Journey', id: journey.id }),
                  fields: {
                    blocks(existingBlockRefs = []) {
                      const newStartIconBlockRef = cache.writeFragment({
                        data: data.startIcon,
                        fragment: gql`
                      fragment NewBlock on Block {
                        id
                      }
                    `
                      })
                      const newEndIconBlockRef = cache.writeFragment({
                        data: data.endIcon,
                        fragment: gql`
                      fragment NewBlock on Block {
                        id
                      }
                    `
                      })
                      const newBlockRef = cache.writeFragment({
                        data: data.buttonBlockUpdate,
                        fragment: gql`
                      fragment NewBlock on Block {
                        id
                      }
                    `
                      })
                      return [
                        ...existingBlockRefs,
                        newBlockRef,
                        newStartIconBlockRef,
                        newEndIconBlockRef
                      ]
                    }
                  }
                })
              }
            }
          })
          if (data?.buttonBlockUpdate != null) {
            dispatch({
              type: 'SetSelectedBlockByIdAction',
              selectedBlockId: data.buttonBlockCreate.id
            })
            dispatch({
              type: 'SetActiveFabAction',
              activeFab: ActiveFab.Save
            })
          }
          return data?.buttonBlockCreate
        }
      })
    }
  }

  return (
    <Button
      icon={<Cursor6Icon />}
      value={t('Button')}
      onClick={handleClick}
      testId="NewButton"
      disabled={loading}
    />
  )
}
