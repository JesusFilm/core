import { ReactElement, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import LinkIcon from '@core/shared/ui/icons/Link'
import Play1Icon from '@core/shared/ui/icons/Play1'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Action, actions } from '../../Action/Action'
import { Attribute } from '../../Properties/Attribute'

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
    <>
      <Attribute
        id={`${id}-video-action`}
        icon={<LinkIcon />}
        name={t('Action')}
        value={selectedAction?.label ?? 'None'}
        description={t('Action')}
        drawerTitle={t('Action')}
      >
        <Action />
      </Attribute>
      <Attribute
        id={`${id}-video-options`}
        icon={<Play1Icon />}
        name={t('Video Source')}
        value={block.video?.title?.[0]?.value ?? block.title ?? ''}
        description={t('Video Options')}
        drawerTitle={t('Video')}
      >
        <VideoOptions />
      </Attribute>
    </>
  )
}
