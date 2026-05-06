import { useMutation } from '@apollo/client'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'

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
   * The block to operate on (ImageBlock or VideoBlock). Call sites pass the block when it exists,
   * or undefined when there is no media yet—in that case the toggle is disabled and optional
   * helper text is shown when mediaTypeWhenEmpty is set (e.g. background or poll option image).
   */
  block?: TreeBlock<ImageBlock | VideoBlock>
  /**
   * When the toggle is disabled (no block), show helper text. Used to show "Select an image..."
   * or "Select a video..." depending on context.
   */
  mediaTypeWhenEmpty?: 'image' | 'video'
}

/**
 * BlockCustomizationToggle - "Needs Customization" toggle for block-level customizable content.
 *
 * Used in the editor properties panel to let users mark a block as customizable on template
 * journeys. When enabled, the block's content can be customized per journey created from the
 * template (e.g. ImageBlock, VideoBlock).
 *
 * - Receives the block via the `block` prop only; when undefined, the toggle is disabled and
 *   optional helper text is shown when mediaTypeWhenEmpty is set.
 * - Renders a Switch with "Needs Customization" label; state is driven by the block's
 *   `customizable` field.
 * - Template gating is done at the call site: parents should only render this when
 *   `journey?.template` is true.
 * - Toggle changes are persisted via block update mutation and are undo/redoable via useCommand.
 *
 * @returns {ReactElement} The toggle UI (Stack with Switch and label)
 */
export function BlockCustomizationToggle({
  block: blockProp,
  mediaTypeWhenEmpty
}: BlockCustomizationToggleProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { add } = useCommand()
  const [imageBlockUpdate] = useMutation<
    ImageBlockUpdate,
    ImageBlockUpdateVariables
  >(IMAGE_BLOCK_UPDATE)
  const [videoBlockUpdate] = useMutation<
    VideoBlockUpdate,
    VideoBlockUpdateVariables
  >(VIDEO_BLOCK_UPDATE)

  const targetBlock = blockProp

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
          const input: ImageBlockUpdateInput = {
            customizable: value,
            src: targetBlock.src,
            width: targetBlock.width,
            height: targetBlock.height,
            blurhash: targetBlock.blurhash
          }
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

  const helperTextWhenDisabled =
    targetBlock == null && mediaTypeWhenEmpty === 'image'
      ? t('Select an image to make this customizable')
      : targetBlock == null && mediaTypeWhenEmpty === 'video'
        ? t('Select a video to make this customizable')
        : null

  const showHelperText = helperTextWhenDisabled != null

  return (
    <Stack width="100%">
      <Stack direction="row" alignItems="center" gap={1}>
        <Switch
          disabled={targetBlock == null}
          checked={customizable}
          onChange={handleChange}
          inputProps={{ 'aria-label': t('Toggle customizable') }}
        />
        <Typography
          variant="body1"
          color={targetBlock == null ? 'text.secondary' : undefined}
        >
          {t('Needs Customization')}
        </Typography>
      </Stack>
      {showHelperText && (
        <Typography variant="caption" color="text.secondary" sx={{ pl: 2 }}>
          {helperTextWhenDisabled}
        </Typography>
      )}
    </Stack>
  )
}
