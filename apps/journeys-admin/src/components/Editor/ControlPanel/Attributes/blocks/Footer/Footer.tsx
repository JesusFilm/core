import { ReactElement, useEffect } from 'react'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import UserProfileCircleIcon from '@core/shared/ui/icons/UserProfileCircle'
import MessageChat1 from '@core/shared/ui/icons/MessageChat1'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useTranslation } from 'react-i18next'
import Stack from '@mui/material/Stack'
import { Attribute } from '../..'
import { ChatPlatform } from '../../../../../../../__generated__/globalTypes'
import { HostTitleFieldForm } from './HostSidePanel/HostTitleFieldForm'
import { HostAvatarsButton } from './HostSidePanel/HostAvatarsButton/HostAvatarsButton'
import { HostLocationFieldForm } from './HostSidePanel/HostLocationFieldForm/HostLocationFieldForm'
import { Chat } from './Chat'

export function Footer(): ReactElement {
  const { dispatch } = useEditor()
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')
  const hostName = journey?.host?.title ?? t('None')

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
      children: (
        <Stack gap={8}>
          <HostTitleFieldForm />
          <HostLocationFieldForm />
          <HostAvatarsButton />
        </Stack>
      )
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  return (
    <>
      <Attribute
        id="hosted-by"
        icon={<UserProfileCircleIcon />}
        name={t('Hosted by')}
        value={hostName as string}
        description={t("Host's name")}
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: t('Hosted By'),
            mobileOpen: true,
            children: (
              <Stack gap={8}>
                <HostTitleFieldForm />
                <HostLocationFieldForm />
                <HostAvatarsButton />
              </Stack>
            )
          })
        }}
      />
      <Attribute
        id="chat-widget"
        icon={<MessageChat1 />}
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
