import Divider from '@mui/material/Divider'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import dynamic from 'next/dynamic'
import { ReactElement, SyntheticEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import MessageChat1Icon from '@core/shared/ui/icons/MessageChat1'
import UserProfileCircleIcon from '@core/shared/ui/icons/UserProfileCircle'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

const HostDrawer = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/Footer/HostDrawer/HostDrawer" */ './HostDrawer'
    ).then((mod) => mod.HostDrawer),
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

  useEffect(() => {
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      id: undefined
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
        <HostDrawer />
      </TabPanel>
      <TabPanel
        name="chat"
        value={tabValue}
        index={1}
        sx={{ flexGrow: 1, overflow: 'auto' }}
      >
        <Chat />
      </TabPanel>
    </>
  )
}
