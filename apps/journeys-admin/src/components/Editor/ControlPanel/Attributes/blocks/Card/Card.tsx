import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import FlexAlignBottom1Icon from '@core/shared/ui/icons/FlexAlignBottom1'
import Image3Icon from '@core/shared/ui/icons/Image3'
import PaletteIcon from '@core/shared/ui/icons/Palette'
import VideoOnIcon from '@core/shared/ui/icons/VideoOn'
import { ThemeMode, ThemeName, getTheme } from '@core/shared/ui/themes'

import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../__generated__/GetJourney'
import { setBeaconPageViewed } from '../../../../../../libs/setBeaconPageViewed'
import { Attribute } from '../../Attribute'

const BackgroundColor = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/Card/BackgroundColor/BackgroundColor" */ './BackgroundColor'
    ).then((mod) => mod.BackgroundColor),
  { ssr: false }
)

const BackgroundMedia = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/Card/BackgroundMedia/BackgroundMedia" */ './BackgroundMedia'
    ).then((mod) => mod.BackgroundMedia),
  { ssr: false }
)

const CardLayout = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/Card/CardLayout/CardLayout" */ './CardLayout'
    ).then((mod) => mod.CardLayout),
  { ssr: false }
)

const CardStyling = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/Card/CardStyling/CardStyling" */ './CardStyling'
    ).then((mod) => mod.CardStyling),
  { ssr: false }
)

export function Card({
  id,
  backgroundColor,
  fullscreen,
  themeName,
  themeMode,
  coverBlockId,
  children
}: TreeBlock<CardBlock>): ReactElement {
  const router = useRouter()
  const { dispatch } = useEditor()
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)

  const coverBlock = children.find((block) => block.id === coverBlockId) as
    | TreeBlock<ImageBlock | VideoBlock>
    | undefined

  const cardTheme = getTheme({
    themeName: themeName ?? journey?.themeName ?? ThemeName.base,
    themeMode: themeMode ?? journey?.themeMode ?? ThemeMode.dark,
    rtl,
    locale
  })
  const selectedCardColor =
    backgroundColor ?? cardTheme.palette.background.paper

  const handleBackgroundMediaClick = (param: string): void => {
    dispatch({
      type: 'SetDrawerPropsAction',
      title: 'Background Media Properties',
      mobileOpen: true,
      children: <BackgroundMedia />
    })

    router.query.param = param
    void router.push(router)
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  return (
    <>
      <Attribute
        id={`${id}-background-color`}
        icon={
          <Paper sx={{ borderRadius: 1000, flexShrink: 0 }}>
            <Box
              data-testid="backgroundColorIcon"
              sx={{
                width: 25,
                height: 25,
                m: 1,
                borderRadius: 1000,
                backgroundColor: selectedCardColor
              }}
            />
          </Paper>
        }
        name="Color"
        value={selectedCardColor.toUpperCase()}
        description="Background Color"
        extra={<BackgroundColor />}
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Background Color Properties',
            mobileOpen: true,
            children: <BackgroundColor />
          })
        }}
      />
      {coverBlock?.__typename === 'ImageBlock' && coverBlock.src != null && (
        <Attribute
          id={`${id}-cover-block`}
          icon={<Image3Icon />}
          name="Background"
          value={coverBlock.src.substring(
            coverBlock.src.lastIndexOf('/') + 1,
            coverBlock.src.length
          )}
          description="Background Image"
          onClick={() => handleBackgroundMediaClick('background-image')}
        />
      )}
      {coverBlock?.__typename === 'VideoBlock' && (
        <Attribute
          id={`${id}-cover-block`}
          icon={<VideoOnIcon />}
          name="Background"
          value={coverBlock.video?.title?.[0]?.value ?? coverBlock.title ?? ''}
          description="Background Video"
          onClick={() => handleBackgroundMediaClick('background-video')}
        />
      )}
      {coverBlock == null && (
        <Attribute
          id={`${id}-cover-block`}
          icon={<Image3Icon />}
          name="Background"
          value="None"
          extra={
            <Box>
              <HorizontalSelect
                onChange={async (val) =>
                  await handleLayoutChange(val === 'true')
                }
              >
                <Box
                  sx={{ display: 'flex' }}
                  id="true"
                  key="true"
                  data-testid="true"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1692272809300-6a7af9b2a6e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwzfHx8ZW58MHx8fHx8&auto=format&fit=crop&w=800&q=60"
                    alt="Expanded"
                    width={89}
                    height={137}
                    style={{
                      borderRadius: '6px'
                    }}
                  />
                </Box>
                <Box
                  sx={{ display: 'flex' }}
                  id="true"
                  key="true"
                  data-testid="true"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1692278265511-7c884556cd74?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw0M3x8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60"
                    alt="Expanded"
                    width={89}
                    height={137}
                    style={{
                      borderRadius: '6px'
                    }}
                  />
                </Box>

                <Box
                  sx={{ display: 'flex' }}
                  id="true"
                  key="true"
                  data-testid="true"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1692533801336-fb86a60f501f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwzNXx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60"
                    alt="Expanded"
                    width={89}
                    height={137}
                    style={{
                      borderRadius: '6px'
                    }}
                  />
                </Box>
              </HorizontalSelect>
            </Box>
          }
          description="Background Media"
          onClick={() => handleBackgroundMediaClick('background-video')}
        />
      )}
      <Attribute
        icon={<PaletteIcon />}
        id={`${id}-theme-mode`}
        name="Style"
        value={
          themeMode == null
            ? 'Default'
            : themeMode === ThemeMode.light
            ? 'Light'
            : 'Dark'
        }
        description="Card Styling"
        extra={<CardStyling />}
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Card Style Property',
            mobileOpen: true,
            children: <CardStyling />
          })
        }}
      />
      <Attribute
        icon={<FlexAlignBottom1Icon />}
        id={`${id}-fullscreen`}
        name="Layout"
        value={fullscreen ? 'Expanded' : 'Contained'}
        description="Content Appearance"
        extra={<CardLayout />}
        onClick={() => {
          dispatch({
            type: 'SetDrawerPropsAction',
            title: 'Card Layout Property',
            mobileOpen: true,
            children: <CardLayout />
          })
        }}
      />
    </>
  )
}
