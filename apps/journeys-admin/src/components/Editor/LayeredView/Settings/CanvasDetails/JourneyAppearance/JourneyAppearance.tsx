import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useFlags } from '@core/shared/ui/FlagsProvider'

import { DrawerTitle } from '../../Drawer'
import { WebsiteToggle } from '../WebsiteToggle'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import { DRAWER_WIDTH } from '../../../../constants'

const Reactions = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/JourneyAppearance/Reactions/Reactions" */ './Reactions'
    ).then((mod) => mod.Reactions),
  { ssr: false }
)

const Logo = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/JourneyAppearance/Logo/Logo" */ './Logo'
    ).then((mod) => mod.Logo),
  { ssr: false }
)

const Host = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/JourneyAppearance/Host/Host" */ './Host'
    ).then((mod) => mod.Host),
  { ssr: false }
)

const DisplayTitle = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/JourneyAppearance/DisplayTitle/DisplayTitle" */ './DisplayTitle'
    ).then((mod) => mod.DisplayTitle),
  { ssr: false }
)

const Menu = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/JourneyAppearance/Menu/Menu" */ './Menu'
    ).then((mod) => mod.Menu),
  { ssr: false }
)

const Chat = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/JourneyAppearance/Chat/Chat" */ './Chat'
    ).then((mod) => mod.Chat),
  { ssr: false }
)

export function JourneyAppearance(): ReactElement {
  const { dispatch } = useEditor()
  const { t } = useTranslation('apps-journeys-admin')
  const { websiteMode } = useFlags()
  const { journey } = useJourney()

  function onClose(): void {
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.JourneyFlow
    })
  }

  return (
    <Stack
      component={Paper}
      elevation={0}
      sx={{
        height: '100%',
        width: DRAWER_WIDTH,
        borderRadius: 3,
        // borderBottomLeftRadius: 0,
        // borderBottomRightRadius: 0,
        overflow: 'hidden'
      }}
      border={1}
      borderColor="divider"
      data-testid="SettingsDrawer"
    >
      <DrawerTitle title={t('Journey Appearance')} onClose={onClose} />
      {websiteMode && <WebsiteToggle />}
      {journey?.website === true ? (
        <>
          <Logo />
          <DisplayTitle />
          <Menu />
          <Chat />
        </>
      ) : (
        <>
          <Reactions />
          <DisplayTitle />
          <Host />
          <Chat />
        </>
      )}
    </Stack>
  )
}
