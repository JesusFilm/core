import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

/**
 * BlockCustomizationToggle - "Needs Customization" toggle for block-level customizable content.
 *
 * This component is used in the editor properties panel to let users mark a block as
 * customizable on template journeys. When enabled, the block's content can be customized
 * per journey created from the template (e.g. ImageBlock, VideoBlock, and later LogoImageBlock).
 *
 * - Renders a Switch with "Needs Customization" label; state is driven by the selected block's
 *   `customizable` field (once backend supports it).
 * - Template gating is done at the call site: parents (Image/Video/Logo properties) should
 *   only render this component when `journey?.template` is true, same pattern as Action.tsx.
 * - Toggle changes are persisted via block update mutation and are undo/redoable via useCommand.
 *
 * @returns {ReactElement} The toggle UI (Stack with Switch and label), or null when not applicable
 */
export function BlockCustomizationToggle(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  // Once backend adds `customizable` to ImageBlock / VideoBlock (and later LogoImageBlock):
  // - useEditor() → state.selectedBlock
  // - Narrow selectedBlock to ImageBlock | VideoBlock (and later logo block type); if not one of these, return null
  // - customizable = selectedBlock?.customizable ?? false
  // - disabled = selectedBlock == null
  // - Template check: handled at call site (Image/Video/Logo properties panels), same as Action.tsx: only render this component when journey?.template (e.g. {journey?.template && <BlockCustomizationToggle />})

  function handleChange(_event: React.ChangeEvent<HTMLInputElement>): void {
    // Once backend and block update mutation exist:
    // - newCustomizable = event.target.checked
    // - useCommand().add({ parameters: { execute: { customizable: newCustomizable }, undo: { customizable: selectedBlock.customizable } }, execute({ customizable }) { call imageBlockUpdate / videoBlockUpdate (etc.) with id: selectedBlock.id, input: { customizable }, optimisticResponse } })
    // - Same pattern as TextResponse Required (useCommand + block update mutation + optimistic response)
  }

  // checked → block.customizable, disabled → selectedBlock == null (once implemented; template gating is at call site)
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
        disabled={false}
        checked={false}
        onChange={handleChange}
        inputProps={{ 'aria-label': t('Toggle customizable') }}
      />
      <Typography variant="body1">{t('Needs Customization')}</Typography>
    </Stack>
  )
}
