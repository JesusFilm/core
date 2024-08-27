import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import { useFlags } from '@core/shared/ui/FlagsProvider'

import { Drawer } from '../../Drawer'
import { WebsiteToggle } from '../WebsiteToggle'

import { Reactions } from './Reactions'

const Host = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/Footer/Host/Host" */ './Host'
    ).then((mod) => mod.Host),
  { ssr: false }
)

const Chat = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/Footer/Chat/Chat" */ './Chat'
    ).then((mod) => mod.Chat),
  { ssr: false }
)

export function Footer(): ReactElement {
  const { dispatch } = useEditor()
  const { t } = useTranslation('apps-journeys-admin')
  const { websiteMode } = useFlags()

  function onClose(): void {
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.JourneyFlow
    })
  }

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      selectedAttributeId: undefined
    })
  }, [dispatch])

  return (
    <Drawer title={t('Journey Appearance')} onClose={onClose}>
      {websiteMode && <WebsiteToggle />}
      <Reactions />
      <Host />
      <Chat />
    </Drawer>
  )
}
