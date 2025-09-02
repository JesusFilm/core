import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_SignUpBlock as SignUpBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/BlockFields'
import { useActionCommand } from '../../../../../../utils/useActionCommand'

import { EmailAction } from './EmailAction'
import { LinkAction } from './LinkAction'
import { NavigateToBlockAction } from './NavigateToBlockAction'
import { ActionValue, actions, getAction } from './utils/actions'

export function Action(): ReactElement {
  const {
    state: { selectedBlock: stateSelectedBlock, selectedStep }
  } = useEditor()
  const { t } = useTranslation('apps-journeys-admin')
  const { addAction } = useActionCommand()

  // Add addtional types here to use this component for that block
  const selectedBlock = stateSelectedBlock as
    | TreeBlock<ButtonBlock>
    | TreeBlock<SignUpBlock>
    | TreeBlock<VideoBlock>
    | undefined
  const [action, setAction] = useState<ActionValue>(
    getAction(t, selectedBlock?.action?.__typename).value
  )

  const isSubmitButton =
    selectedBlock?.__typename === 'ButtonBlock' &&
    selectedBlock.submitEnabled === true

  const labels = actions(t)

  const filteredLabels = isSubmitButton
    ? labels.filter(
        (action) =>
          action.value !== 'LinkAction' && action.value !== 'EmailAction'
      )
    : labels

  useEffect(() => {
    setAction(getAction(t, selectedBlock?.action?.__typename).value)
  }, [selectedBlock?.action?.__typename])

  function removeAction(): void {
    if (selectedBlock == null) return

    const { id, action, __typename: blockTypename } = selectedBlock
    addAction({
      blockId: id,
      blockTypename,
      action: null,
      undoAction: action,
      editorFocus: {
        selectedStep,
        selectedBlock
      }
    })
  }

  function handleChange(event: SelectChangeEvent): void {
    if (event.target.value === 'None') removeAction()
    setAction(event.target.value as ActionValue)
  }

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
        {!isSubmitButton && action === 'LinkAction' && <LinkAction />}
        {!isSubmitButton && action === 'EmailAction' && <EmailAction />}
        {action === 'NavigateToBlockAction' && <NavigateToBlockAction />}
      </Stack>
    </>
  )
}
