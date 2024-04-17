import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import MessageChat1Icon from '@core/shared/ui/icons/MessageChat1'
import UserProfileCircleIcon from '@core/shared/ui/icons/UserProfileCircle'

import { ChatPlatform } from '../../../../../../../__generated__/globalTypes'
import { Attribute } from '../../Attribute'

const HostSidePanel = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/Footer/HostSidePanel/HostSidePanel" */ './HostSidePanel'
    ).then((mod) => mod.HostSidePanel),
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
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')
  const hostName = journey?.host?.title

  const translatedPlatforms = [
    { value: ChatPlatform.facebook, label: t('Facebook') },
    { value: ChatPlatform.telegram, label: t('Telegram') },
    { value: ChatPlatform.whatsApp, label: t('WhatsApp') },
    { value: ChatPlatform.instagram, label: t('Instagram') },
    { value: ChatPlatform.viber, label: t('Viber') },
    { value: ChatPlatform.vk, label: t('Vk') },
    { value: ChatPlatform.snapchat, label: t('Snapchat') },
    { value: ChatPlatform.skype, label: t('Skype') },
    { value: ChatPlatform.line, label: t('Line') },
    { value: ChatPlatform.tikTok, label: t('TikTok') }
  ]

  const platforms = (journey?.chatButtons ?? [])
    .map((button) => {
      const platform = translatedPlatforms.find(
        (translated) => translated.value === button.platform
      )?.label
      return platform ?? t('Custom')
    })
    .filter(Boolean)
    .join(` ${t('and')} `)

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      id: 'hosted-by'
    })
    dispatch({
      type: 'SetDrawerPropsAction',
      title: t('Hosted By'),
      mobileOpen: true,
      children: <HostSidePanel />
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  return (
    <>
      <Attribute
        id="hosted-by"
        icon={<UserProfileCircleIcon />}
        name={t('Hosted By')}
        value={hostName ?? t('None')}
        description={t("Host's name")}
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: t('Hosted By'),
            mobileOpen: true,
            children: <HostSidePanel />
          })
        }}
      />
      <Attribute
        id="chat-widget"
        icon={<MessageChat1Icon />}
        name={t('Chat Widget')}
        value={platforms ?? t('None')}
        description={t('Chat Platform')}
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: t('Chat Widget'),
            mobileOpen: true,
            children: <Chat />
          })
        }}
      />
    </>
  )
}
