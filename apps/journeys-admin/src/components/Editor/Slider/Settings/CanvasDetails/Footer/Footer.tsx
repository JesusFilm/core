import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import MessageTyping from '@core/shared/ui/icons/MessageTyping'
import UserProfileCircleIcon from '@core/shared/ui/icons/UserProfileCircle'

import { Drawer } from '../../Drawer'
import { Accordion } from '../Properties/Accordion'

const HostTab = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/Footer/HostTab/HostTab" */ './HostTab'
    ).then((mod) => mod.HostTab),
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
      <Accordion
        id="author details"
        icon={<UserProfileCircleIcon />}
        name={t('Author details')}
      >
        <HostTab />
      </Accordion>
      <Accordion
        id="chat platforms"
        icon={<MessageTyping />}
        name={t('Chat widget')}
      >
        <Chat />
      </Accordion>
    </Drawer>
  )
}
