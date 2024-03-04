import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import LinkIcon from '@core/shared/ui/icons/Link'
import Play1Icon from '@core/shared/ui/icons/Play1'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../../__generated__/GetJourney'
import { Action, actions } from '../../Action/Action'
import { Attribute } from '../../Attribute'

import { VideoOptions } from './Options/VideoOptions'

export function Video(block: TreeBlock<VideoBlock>): ReactElement {
  const { id, videoId } = block
  const { t } = useTranslation('apps-journeys-admin')
  const { dispatch } = useEditor()

  const openDrawer = (): void =>
    dispatch({
      type: 'SetDrawerPropsAction',
      title: t('Video'),
      mobileOpen: true,
      children: <VideoOptions />
    })

  const selectedAction = actions.find(
    (act) => act.value === block.action?.__typename
  )

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      id: `${id}-video-options`
    })
    dispatch({
      type: 'SetDrawerPropsAction',
      title: t('Video'),
      children: <VideoOptions />
    })
  }, [id, videoId, dispatch, t])

  return (
    <>
      <Attribute
        id={`${id}-video-action`}
        icon={<LinkIcon />}
        name={t('Action')}
        value={t(selectedAction?.label ?? 'None')}
        description={t('Action')}
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: t('Action'),
            mobileOpen: true,
            children: <Action />
          })
        }}
      />

      <Attribute
        id={`${id}-video-options`}
        icon={<Play1Icon />}
        name={t('Video Source')}
        value={block.video?.title?.[0]?.value ?? block.title ?? ''}
        description={t('Video Options')}
        onClick={openDrawer}
      />
    </>
  )
}
