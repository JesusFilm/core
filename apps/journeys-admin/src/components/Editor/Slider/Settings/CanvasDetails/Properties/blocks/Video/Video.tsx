import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ActivityIcon from '@core/shared/ui/icons/Activity'
import LinkIcon from '@core/shared/ui/icons/Link'
import Play1Icon from '@core/shared/ui/icons/Play1'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Accordion } from '../../Accordion'
import { Action } from '../../controls/Action'
import { getAction } from '../../controls/Action/utils/actions'
import { MetaAction } from '../../controls/MetaAction'

import { VideoOptions } from './Options/VideoOptions'

export function Video(block: TreeBlock<VideoBlock>): ReactElement {
  const { id, videoId } = block
  const { t } = useTranslation('apps-journeys-admin')

  const { dispatch } = useEditor()
  const { journey } = useJourney()

  const selectedAction = getAction(t, block.action?.__typename)

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      selectedAttributeId: `${id}-video-options`
    })
  }, [id, videoId, dispatch])

  return (
    <Box data-testid="VideoProperties">
      {journey?.template && (
        <Accordion
          icon={<ActivityIcon />}
          id={`${id}-meta-action`}
          name={t('Tracking')}
          value={t('None')}
        >
          <MetaAction
            videoActionType="start"
            label={t('On Video Start')}
            showHelperText={false}
          />
          <MetaAction
            videoActionType="complete"
            label={t('On Video End')}
            showHelperText={true}
          />
        </Accordion>
      )}
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
