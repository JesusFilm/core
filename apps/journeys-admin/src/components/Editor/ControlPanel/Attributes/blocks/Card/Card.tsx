import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import dynamic from 'next/dynamic'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import type { TreeBlock } from '@core/journeys/ui/block'
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
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)
  const { t } = useTranslation()

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
        name={t('Color')}
        value={selectedCardColor.toUpperCase()}
        description={t('Background Color')}
        drawerTitle="Background Color Properties"
      >
        <BackgroundColor />
      </Attribute>

      {coverBlock?.__typename === 'ImageBlock' && coverBlock.src != null && (
        <Attribute
          id={`${id}-cover-block`}
          icon={<Image3Icon />}
          name={t('Background')}
          value={coverBlock.src.substring(
            coverBlock.src.lastIndexOf('/') + 1,
            coverBlock.src.length
          )}
          description={t('Background Image')}
          drawerTitle={t('Background Media Properties')}
          param="background-image"
        >
          <BackgroundMedia />
        </Attribute>
      )}
      {coverBlock?.__typename === 'VideoBlock' && (
        <Attribute
          id={`${id}-cover-block`}
          icon={<VideoOnIcon />}
          name={t('Background')}
          value={coverBlock.video?.title?.[0]?.value ?? coverBlock.title ?? ''}
          description={t('Background Video')}
          drawerTitle={t('Background Media Properties')}
          param="background-video"
        >
          <BackgroundMedia />
        </Attribute>
      )}
      {coverBlock == null && (
        <Attribute
          id={`${id}-cover-block`}
          icon={<Image3Icon />}
          name={t('Background')}
          value="None"
          description={t('Background Media')}
          drawerTitle={t('Background Media Properties')}
          param="background-video"
        >
          <BackgroundMedia />
        </Attribute>
      )}
      <Attribute
        icon={<PaletteIcon />}
        id={`${id}-theme-mode`}
        name={t('Style')}
        value={
          themeMode == null
            ? 'Default'
            : themeMode === ThemeMode.light
            ? 'Light'
            : 'Dark'
        }
        description={t('Card Styling')}
        drawerTitle={t('Card Style Property')}
      >
        <CardStyling />
      </Attribute>
      <Attribute
        icon={<FlexAlignBottom1Icon />}
        id={`${id}-fullscreen`}
        name={t('Layout')}
        value={fullscreen ? 'Expanded' : 'Contained'}
        description={t('Content Appearance')}
        drawerTitle={t('Card Layout Property')}
      >
        <CardLayout />
      </Attribute>
    </>
  )
}
