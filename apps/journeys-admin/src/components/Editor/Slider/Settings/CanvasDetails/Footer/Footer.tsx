import Divider from '@mui/material/Divider'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { ReactElement, SyntheticEvent, useEffect, useState } from 'react'

import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import MessageChat1Icon from '@core/shared/ui/icons/MessageChat1'
import UserProfileCircleIcon from '@core/shared/ui/icons/UserProfileCircle'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import { Drawer } from '../../Drawer'

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
  const [tabValue, setTabValue] = useState(0)

  function handleTabChange(
    _event: SyntheticEvent<Element, Event>,
    newValue: number
  ): void {
    setTabValue(newValue)
  }

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
    <Drawer title={t('Footer Properties')} onClose={onClose}>
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
        <HostTab />
      </TabPanel>
      <TabPanel
        name="chat"
        value={tabValue}
        index={1}
        sx={{ flexGrow: 1, overflow: 'auto' }}
      >
        <Chat />
      </TabPanel>
    </Drawer>
  )
}
