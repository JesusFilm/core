import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { ICON_FIELDS } from '@core/journeys/ui/Icon/iconFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { SIGN_UP_FIELDS } from '@core/journeys/ui/SignUp/signUpFields'
import type { TreeBlock } from '@core/journeys/ui/block'
import Mail2Icon from '@core/shared/ui/icons/Mail2'

import {
  BlockFields_IconBlock as IconBlock,
  BlockFields_SignUpBlock as SignUpBlock
} from '@core/journeys/ui/block/__generated__/BlockFields'
import { BlockFields_CardBlock as CardBlock } from '../../../../../../../../__generated__/BlockFields'
import { SignUpBlockCreate } from '../../../../../../../../__generated__/SignUpBlockCreate'
import { useBlockCreateCommand } from '../../../../../utils/useBlockCreateCommand'
import { Button } from '../Button'

export const SIGN_UP_BLOCK_CREATE = gql`
  ${SIGN_UP_FIELDS}
  ${ICON_FIELDS}
  mutation SignUpBlockCreate(
    $input: SignUpBlockCreateInput!
    $iconBlockCreateInput: IconBlockCreateInput!
    $id: ID!
    $journeyId: ID!
    $updateInput: SignUpBlockUpdateInput!
  ) {
    signUpBlockCreate(input: $input) {
      ...SignUpFields
    }
    submitIcon: iconBlockCreate(input: $iconBlockCreateInput) {
      id
      parentBlockId
      ...IconFields
    }
    signUpBlockUpdate(id: $id, journeyId: $journeyId, input: $updateInput) {
      ...SignUpFields
    }
  }
`

export function NewSignUpButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [signUpBlockCreate, { loading }] =
    useMutation<SignUpBlockCreate>(SIGN_UP_BLOCK_CREATE)
  const { journey } = useJourney()
  const {
    state: { selectedStep }
  } = useEditor()
  const { addBlock } = useBlockCreateCommand()

  async function handleClick(): Promise<void> {
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined
    if (card != null && journey != null) {
      const signUpBlock: TreeBlock<SignUpBlock> = {
        id: uuidv4(),
        parentBlockId: card.id,
        parentOrder: card.children.length ?? 0,
        submitLabel: 'Submit',
        submitIconId: uuidv4(),
        action: null,
        __typename: 'SignUpBlock',
        children: []
      }

      const submitIcon: TreeBlock<IconBlock> = {
        id: signUpBlock.submitIconId as string,
        parentBlockId: signUpBlock.id,
        parentOrder: null,
        iconName: null,
        iconSize: null,
        iconColor: null,
        __typename: 'IconBlock',
        children: []
      }

      void addBlock({
        optimisticBlock: signUpBlock,
        async execute() {
          void signUpBlockCreate({
            variables: {
              input: {
                id: signUpBlock.id,
                journeyId: journey.id,
                parentBlockId: card.id,
                submitLabel: t('Submit')
              },
              iconBlockCreateInput: {
                id: submitIcon.id,
                journeyId: journey.id,
                parentBlockId: signUpBlock.id,
                name: null
              },
              id: signUpBlock.id,
              journeyId: journey.id,
              updateInput: {
                submitIconId: submitIcon.id
              }
            },
            optimisticResponse: {
              signUpBlockCreate: signUpBlock,
              submitIcon: submitIcon,
              signUpBlockUpdate: signUpBlock
            },
            update(cache, { data }) {
              if (data?.signUpBlockUpdate != null) {
                cache.modify({
                  id: cache.identify({ __typename: 'Journey', id: journey.id }),
                  fields: {
                    blocks(existingBlockRefs = []) {
                      const newSubmitIconBlockRef = cache.writeFragment({
                        data: data.submitIcon,
                        fragment: gql`
                        fragment NewBlock on Block {
                          id
                        }
                      `
                      })
                      const newBlockRef = cache.writeFragment({
                        data: data.signUpBlockUpdate,
                        fragment: gql`
                        fragment NewBlock on Block {
                          id
                        }
                      `
                      })
                      return [
                        ...existingBlockRefs,
                        newBlockRef,
                        newSubmitIconBlockRef
                      ]
                    }
                  }
                })
              }
            }
          })
        }
      })
    }
  }

  return (
    <Button
      icon={<Mail2Icon />}
      value={t('Subscribe')}
      onClick={handleClick}
      testId="NewSignUpButton"
      disabled={loading}
    />
  )
}
