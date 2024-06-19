import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import LinkIcon from '@core/shared/ui/icons/Link'
import Play1Icon from '@core/shared/ui/icons/Play1'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Accordion } from '../../Accordion'
import { Action, actions } from '../../controls/Action/Action'

import { VideoOptions } from './Options/VideoOptions'

export function Video(block: TreeBlock<VideoBlock>): ReactElement {
  const { id, videoId } = block
  const { t } = useTranslation('apps-journeys-admin')

  const { dispatch } = useEditor()

  const selectedAction = actions.find(
    (act) => act.value === block.action?.__typename
  )

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
        value={selectedAction?.label ?? 'None'}
      >
        <Action />
      </Accordion>
      <Accordion
        id={`${id}-video-options`}
        icon={<Play1Icon />}
        name={t('Video Source')}
        value={block.video?.title?.[0]?.value ?? block.title ?? ''}
      >
        <VideoOptions />
      </Accordion>
    </Box>
  )
}
