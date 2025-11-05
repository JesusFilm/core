import { gql, useMutation } from '@apollo/client'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { VIDEO_FIELDS } from '@core/journeys/ui/Video/videoFields'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { VideoBlockUpdateInput } from '../../../../../../../../../../__generated__/globalTypes'
import {
  VideoBlockUpdate,
  VideoBlockUpdateVariables
} from '../../../../../../../../../../__generated__/VideoBlockUpdate'
import { VideoBlockEditor } from '../../../../../Drawer/VideoBlockEditor'

export const VIDEO_BLOCK_UPDATE = gql`
  ${VIDEO_FIELDS}
  mutation VideoBlockUpdate($id: ID!, $input: VideoBlockUpdateInput!) {
    videoBlockUpdate(id: $id, input: $input) {
      ...VideoFields
    }
  }
`

export function VideoOptions(): ReactElement {
  const { add } = useCommand()
  const {
    state: { selectedStep, selectedBlock: stateSelectedBlock },
    dispatch
  } = useEditor()
  const [videoBlockUpdate] = useMutation<
    VideoBlockUpdate,
    VideoBlockUpdateVariables
  >(VIDEO_BLOCK_UPDATE)

  const selectedBlock = stateSelectedBlock as TreeBlock<VideoBlock> | undefined

  function handleChange(input: VideoBlockUpdateInput): void {
    if (selectedBlock == null) return

    const inverseInput: VideoBlockUpdateInput = {}
    if (input.startAt !== undefined)
      inverseInput.startAt = selectedBlock.startAt
    if (input.endAt !== undefined) inverseInput.endAt = selectedBlock.endAt
    if (input.muted !== undefined) inverseInput.muted = selectedBlock.muted
    if (input.autoplay !== undefined)
      inverseInput.autoplay = selectedBlock.autoplay
    if (input.duration !== undefined)
      inverseInput.duration = selectedBlock.duration
    if (input.videoId !== undefined)
      inverseInput.videoId = selectedBlock.videoId
    if (input.videoVariantLanguageId !== undefined)
      inverseInput.videoVariantLanguageId = selectedBlock.videoVariantLanguageId
    if (input.source !== undefined) inverseInput.source = selectedBlock.source
    if (input.posterBlockId !== undefined)
      inverseInput.posterBlockId = selectedBlock.posterBlockId
    if (input.fullsize !== undefined)
      inverseInput.fullsize = selectedBlock.fullsize
    if (input.objectFit !== undefined)
      inverseInput.objectFit = selectedBlock.objectFit

    add({
      parameters: {
        execute: {
          input
        },
        undo: {
          input: inverseInput
        }
      },
      execute({ input }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStep,
          selectedBlock
        })
        void videoBlockUpdate({
          variables: {
            id: selectedBlock.id,
            input
          },
          optimisticResponse: {
            videoBlockUpdate: {
              ...selectedBlock,
              ...input,
              source: input.source ?? selectedBlock.source
            }
          }
        })
      }
    })
  }

  return selectedBlock?.__typename === 'VideoBlock' ? (
    <VideoBlockEditor
      selectedBlock={selectedBlock}
      onChange={async (input) => handleChange(input)}
    />
  ) : (
    <></>
  )
}
