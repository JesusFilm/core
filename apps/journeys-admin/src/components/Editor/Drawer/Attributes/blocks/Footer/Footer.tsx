import { Divider } from '@mui/material'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import dynamic from 'next/dynamic'
import { ReactElement, SyntheticEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import MessageChat1Icon from '@core/shared/ui/icons/MessageChat1'
import UserProfileCircleIcon from '@core/shared/ui/icons/UserProfileCircle'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import { ChatPlatform } from '../../../../../../../__generated__/globalTypes'

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
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: number
  ): void => {
    setTabValue(newValue)
  }

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
      id: undefined
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
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="image selection tabs"
        variant="fullWidth"
      >
        <Tab
          icon={<UserProfileCircleIcon />}
          label={t('Hosted By')}
          {...tabA11yProps('hostedBy', 0)}
        />
        <Tab
          icon={<MessageChat1Icon />}
          label={t('Chat Widget')}
          {...tabA11yProps('chat', 1)}
        />
      </Tabs>
      <Divider />
      <TabPanel
        name="hostedBy"
        value={tabValue}
        index={0}
        sx={{ flexGrow: 1, overflow: 'auto' }}
      >
        {tabValue === 0 && <HostSidePanel />}
      </TabPanel>
      <TabPanel
        name="chat"
        value={tabValue}
        index={1}
        sx={{ flexGrow: 1, overflow: 'auto' }}
      >
        {tabValue === 1 && <Chat />}
      </TabPanel>
    </>
  )
}
