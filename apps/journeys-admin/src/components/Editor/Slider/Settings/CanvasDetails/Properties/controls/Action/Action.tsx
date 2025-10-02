import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useRef, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_SignUpBlock as SignUpBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/BlockFields'
import { useActionCommand } from '../../../../../../utils/useActionCommand'

import { CustomizationToggle } from './CustomizationToggle'
import { EmailAction } from './EmailAction'
import { LinkAction } from './LinkAction'
import { NavigateToBlockAction } from './NavigateToBlockAction'
import { ActionValue, actions, getAction } from './utils/actions'
import { TextFieldFormRef } from '../../../../../../../TextFieldForm/TextFieldForm'

export function Action(): ReactElement {
  const {
    state: { selectedBlock: stateSelectedBlock, selectedStep }
  } = useEditor()
  const { t } = useTranslation('apps-journeys-admin')
  const { addAction } = useActionCommand()
  const { journey } = useJourney()
  const linkActionRef = useRef<TextFieldFormRef | null>(null)
  const emailActionRef = useRef<TextFieldFormRef | null>(null)

  // Compute current action typename via safe narrowing on __typename
  const selectedActionTypename: string | undefined = (() => {
    if (stateSelectedBlock?.__typename === 'ButtonBlock') {
      return (stateSelectedBlock as TreeBlock<ButtonBlock>).action?.__typename
    }
    if (stateSelectedBlock?.__typename === 'SignUpBlock') {
      return (stateSelectedBlock as TreeBlock<SignUpBlock>).action?.__typename
    }
    if (stateSelectedBlock?.__typename === 'VideoBlock') {
      return (stateSelectedBlock as TreeBlock<VideoBlock>).action?.__typename
    }
    return undefined
  })()

  const [action, setAction] = useState<ActionValue>(
    getAction(t, selectedActionTypename).value
  )

  const isSubmitButton =
    stateSelectedBlock?.__typename === 'ButtonBlock' &&
    (stateSelectedBlock as TreeBlock<ButtonBlock>).submitEnabled === true

  const labels = actions(t)

  const filteredLabels = isSubmitButton
    ? labels.filter(
        (action) =>
          action.value !== 'LinkAction' && action.value !== 'EmailAction'
      )
    : labels

  useEffect(() => {
    setAction(getAction(t, selectedActionTypename).value)
  }, [selectedActionTypename])

  useEffect(() => {
    if (action === 'LinkAction') linkActionRef.current?.focus()
    if (action === 'EmailAction') emailActionRef.current?.focus()
  }, [action])

  function removeAction(): void {
    if (stateSelectedBlock == null) return

    const { id, __typename: blockTypename } = stateSelectedBlock
    const undoAction = (() => {
      if (stateSelectedBlock?.__typename === 'ButtonBlock') {
        return (stateSelectedBlock as TreeBlock<ButtonBlock>).action
      }
      if (stateSelectedBlock?.__typename === 'SignUpBlock') {
        return (stateSelectedBlock as TreeBlock<SignUpBlock>).action
      }
      if (stateSelectedBlock?.__typename === 'VideoBlock') {
        return (stateSelectedBlock as TreeBlock<VideoBlock>).action
      }
      return null
    })()
    addAction({
      blockId: id,
      blockTypename,
      action: null,
      undoAction,
      editorFocus: {
        selectedStep,
        selectedBlock: stateSelectedBlock
      }
    })
  }

  function handleChange(event: SelectChangeEvent): void {
    if (event.target.value === 'None') removeAction()
    setAction(event.target.value as ActionValue)
  }

  const isLink = !isSubmitButton && action === 'LinkAction'
  const isEmail = !isSubmitButton && action === 'EmailAction'

  return (
    <>
      <Stack sx={{ p: 4, pt: 0 }} data-testid="Action">
        <FormControl variant="filled">
          <InputLabel sx={{ '&.MuiFormLabel-root': { lineHeight: 1.5 } }}>
            {t('Navigate to:')}
          </InputLabel>

          <Select
            onChange={handleChange}
            value={action}
            IconComponent={ChevronDownIcon}
          >
            {filteredLabels.map((action) => {
              return (
                <MenuItem
                  key={`button-action-${action.value}`}
                  value={action.value}
                >
                  {t(action.label)}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
        {isLink && <LinkAction ref={linkActionRef} />}
        {isEmail && <EmailAction ref={emailActionRef} />}
        {action === 'NavigateToBlockAction' && <NavigateToBlockAction />}
        {(isLink || isEmail) && journey?.template && <CustomizationToggle />}
      </Stack>
    </>
  )
}
