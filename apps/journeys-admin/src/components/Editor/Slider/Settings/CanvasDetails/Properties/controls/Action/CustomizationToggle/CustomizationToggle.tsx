import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { isActionBlock } from '@core/journeys/ui/isActionBlock'

import { useActionCommand } from '../../../../../../../utils/useActionCommand'

export function CustomizationToggle(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { addAction } = useActionCommand()
  const {
    state: { selectedBlock: stateSelectedBlock, selectedStep }
  } = useEditor()
  const actionBlock = isActionBlock(stateSelectedBlock)
    ? stateSelectedBlock
    : undefined
  let customizable = false
  if (actionBlock?.action?.__typename === 'LinkAction') {
    customizable = actionBlock?.action?.customizable ?? false
  }
  if (actionBlock?.action?.__typename === 'EmailAction') {
    customizable = actionBlock?.action?.customizable ?? false
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    if (actionBlock == null || selectedStep == null) return

    const newCustomizable = event.target.checked
    const { id, __typename: blockTypename, action } = actionBlock

    if (action?.__typename === 'LinkAction') {
      addAction({
        blockId: id,
        blockTypename,
        action: {
          __typename: 'LinkAction',
          parentBlockId: id,
          gtmEventName: '',
          url: action.url,
          customizable: newCustomizable,
          parentStepId: selectedStep.id
        },
        undoAction: action,
        editorFocus: {
          selectedStep,
          selectedBlock: actionBlock
        }
      })
      return
    }

    if (action?.__typename === 'EmailAction') {
      addAction({
        blockId: id,
        blockTypename,
        action: {
          __typename: 'EmailAction',
          parentBlockId: id,
          gtmEventName: '',
          email: action.email,
          customizable: newCustomizable,
          parentStepId: selectedStep.id
        },
        undoAction: action,
        editorFocus: {
          selectedStep,
          selectedBlock: actionBlock
        }
      })
      return
    }
  }

  return (
    <Stack
      direction="row"
      alignItems="center"
      width="100%"
      gap={1}
      sx={{
        mt: 2
      }}
    >
      <Switch
        checked={customizable}
        onChange={handleChange}
        inputProps={{ 'aria-label': t('Toggle customizable') }}
      />
      <Typography variant="body1">{t('Needs Customization')}</Typography>
    </Stack>
  )
}
