import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import LinkIcon from '@core/shared/ui/icons/Link'
import Play1Icon from '@core/shared/ui/icons/Play1'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Accordion } from '../../Accordion'
import { Action } from '../../controls/Action'
import { getAction } from '../../controls/Action/utils/actions'

import { VideoOptions } from './Options/VideoOptions'

export function Video(block: TreeBlock<VideoBlock>): ReactElement {
  const { id, videoId } = block
  const { t } = useTranslation('apps-journeys-admin')

  const { dispatch } = useEditor()

  const selectedAction = getAction(t, block.action?.__typename)

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      selectedAttributeId: `${id}-video-options`
    })
  }, [id, videoId, dispatch])

  return (
    <Box data-testid="VideoProperties">
      <Accordion
        id={`${id}-video-action`}
        icon={<LinkIcon />}
        name={t('Action')}
        value={selectedAction.label}
      >
        <Action />
      </Accordion>
      <Accordion
        id={`${id}-video-options`}
        icon={<Play1Icon />}
        name={t('Video Source')}
        value={
          block.mediaVideo?.__typename === 'Video'
            ? block.mediaVideo?.title?.[0]?.value
            : (block.title ?? '')
        }
      >
        <VideoOptions />
      </Accordion>
    </Box>
  )
}
