import { gql, useMutation } from '@apollo/client'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { TreeBlock } from '@core/journeys/ui/block'
import { Button } from '@core/journeys/ui/Button'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { ButtonBlockUpdateContent } from '../../../../../../__generated__/ButtonBlockUpdateContent'
import { ButtonFields } from '../../../../../../__generated__/ButtonFields'
import { InlineEditInput } from '../InlineEditInput'
import { useOnClickOutside } from '../useOnClickOutside'

export const BUTTON_BLOCK_UPDATE_CONTENT = gql`
  mutation ButtonBlockUpdateContent(
    $id: ID!
    $journeyId: ID!
    $input: ButtonBlockUpdateInput!
  ) {
    buttonBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      label
    }
  }
`
interface ButtonEditProps extends TreeBlock<ButtonFields> {}

export function ButtonEdit({
  id,
  buttonVariant,
  buttonColor,
  label,
  ...buttonProps
}: ButtonEditProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const [buttonBlockUpdate] = useMutation<ButtonBlockUpdateContent>(
    BUTTON_BLOCK_UPDATE_CONTENT
  )
  const { journey } = useJourney()
  const [value, setValue] = useState(label)

  async function handleSaveBlock(): Promise<void> {
    const currentLabel = value.trim().replace(/\n/g, '')
    if (journey == null || label === currentLabel) return

    await buttonBlockUpdate({
      variables: {
        id,
        journeyId: journey.id,
        input: { label: currentLabel }
      },
      optimisticResponse: {
        buttonBlockUpdate: {
          id,
          __typename: 'ButtonBlock',
          label: currentLabel
        }
      }
    })
  }
  const inputRef = useOnClickOutside(async () => await handleSaveBlock())

  const input = (
    <InlineEditInput
      name={`edit-${id}`}
      ref={inputRef}
      fullWidth
      multiline
      autoFocus
      onBlur={handleSaveBlock}
      value={value}
      placeholder={t('Edit text...')}
      onChange={(e) => {
        setValue(e.currentTarget.value)
      }}
      onClick={(e) => e.stopPropagation()}
    />
  )

  return (
    <Button
      {...buttonProps}
      id={id}
      buttonVariant={buttonVariant}
      buttonColor={buttonColor}
      label={label}
      editableLabel={input}
    />
  )
}
