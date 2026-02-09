import { useMutation } from '@apollo/client'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import {
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/BlockFields'
import {
  ImageBlockUpdateInput,
  VideoBlockUpdateInput
} from '../../../../../../../../../__generated__/globalTypes'
import {
  ImageBlockUpdate,
  ImageBlockUpdateVariables
} from '../../../../../../../../../__generated__/ImageBlockUpdate'
import {
  VideoBlockUpdate,
  VideoBlockUpdateVariables
} from '../../../../../../../../../__generated__/VideoBlockUpdate'
import { IMAGE_BLOCK_UPDATE } from '../../blocks/Image/Options/ImageOptions'
import { VIDEO_BLOCK_UPDATE } from '../../blocks/Video/Options/VideoOptions'

export interface BlockCustomizationToggleProps {
  /**
   * Optional block to operate on. When not provided, the component uses the editor's selectedBlock
   * (for standalone Video/Image properties). When provided, uses this block (e.g. card
   * cover block in BackgroundMediaVideo / BackgroundMediaImage).
   */
  block?: TreeBlock<ImageBlock | VideoBlock>
}

/**
 * BlockCustomizationToggle - "Needs Customization" toggle for block-level customizable content.
 *
 * This component is used in the editor properties panel to let users mark a block as
 * customizable on template journeys. When enabled, the block's content can be customized
 * per journey created from the template (e.g. ImageBlock, VideoBlock, and later LogoImageBlock).
 *
 * - Renders a Switch with "Needs Customization" label; state is driven by the block's
 *   `customizable` field (from props or selectedBlock).
 * - Template gating is done at the call site: parents (Image/Video/Logo properties) should
 *   only render this component when `journey?.template` is true, same pattern as Action.tsx.
 * - Toggle changes are persisted via block update mutation and are undo/redoable via useCommand.
 *
 * @returns {ReactElement} The toggle UI (Stack with Switch and label)
 */
export function BlockCustomizationToggle({
  block: blockProp
}: BlockCustomizationToggleProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedBlock }
  } = useEditor()
  const { add } = useCommand()
  const [imageBlockUpdate] = useMutation<
    ImageBlockUpdate,
    ImageBlockUpdateVariables
  >(IMAGE_BLOCK_UPDATE)
  const [videoBlockUpdate] = useMutation<
    VideoBlockUpdate,
    VideoBlockUpdateVariables
  >(VIDEO_BLOCK_UPDATE)

  const targetBlock: TreeBlock<ImageBlock | VideoBlock> | undefined =
    blockProp ??
    (selectedBlock?.__typename === 'ImageBlock' ||
    selectedBlock?.__typename === 'VideoBlock'
      ? (selectedBlock as TreeBlock<ImageBlock | VideoBlock>)
      : undefined)

  const customizable = targetBlock?.customizable ?? false

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    if (targetBlock == null) return
    const newCustomizable = event.target.checked
    const undoCustomizable = customizable

    add({
      parameters: {
        execute: { customizable: newCustomizable },
        undo: { customizable: undoCustomizable }
      },
      execute({ customizable: value }) {
        if (targetBlock.__typename === 'ImageBlock') {
          const input: ImageBlockUpdateInput = { customizable: value }
          void imageBlockUpdate({
            variables: { id: targetBlock.id, input },
            optimisticResponse: {
              imageBlockUpdate: { ...targetBlock, customizable: value }
            }
          })
          return
        }
        if (targetBlock.__typename === 'VideoBlock') {
          const input: VideoBlockUpdateInput = { customizable: value }
          void videoBlockUpdate({
            variables: { id: targetBlock.id, input },
            optimisticResponse: {
              videoBlockUpdate: { ...targetBlock, customizable: value }
            }
          })
        }
      }
    })
  }

  return (
    <Stack
      direction="row"
      alignItems="center"
      width="100%"
      gap={1}
    >
      <Switch
        disabled={targetBlock == null}
        checked={customizable}
        onChange={handleChange}
        inputProps={{ 'aria-label': t('Toggle customizable') }}
      />
      <Typography variant="body1">{t('Needs Customization')}</Typography>
    </Stack>
  )
}
