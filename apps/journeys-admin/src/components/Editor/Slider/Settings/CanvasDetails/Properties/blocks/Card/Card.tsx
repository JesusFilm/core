import Box from '@mui/material/Box'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  getOpacityFromHex,
  stripAlphaFromHex
} from '@core/journeys/ui/Card/utils/colorOpacityUtils'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import FlexAlignBottom1Icon from '@core/shared/ui/icons/FlexAlignBottom1'
import Image3Icon from '@core/shared/ui/icons/Image3'
import PaletteIcon from '@core/shared/ui/icons/Palette'
import SunIcon2 from '@core/shared/ui/icons/Sun2'
import VideoOnIcon from '@core/shared/ui/icons/VideoOn'
import { ThemeMode, ThemeName, getTheme } from '@core/shared/ui/themes'

import { BlockFields_CardBlock as CardBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Accordion } from '../../Accordion'

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
  const {
    state: { selectedStep }
  } = useEditor()
  const { rtl, locale } = getJourneyRTL(journey)
  const { t } = useTranslation('apps-journeys-admin')

  const coverBlock = children.find((block) => block.id === coverBlockId)

  const cardTheme = getTheme({
    themeName: themeName ?? journey?.themeName ?? ThemeName.base,
    themeMode: themeMode ?? journey?.themeMode ?? ThemeMode.dark,
    rtl,
    locale
  })
  const selectedCardColor =
    backgroundColor ?? cardTheme.palette.background.paper

  let backgroundValue = t('None')
  let isContained = false

  switch (coverBlock?.__typename) {
    case 'ImageBlock':
      isContained = !fullscreen
      if (coverBlock.src != null) {
        if (coverBlock.src.startsWith('https://images.unsplash.com/')) {
          backgroundValue = coverBlock.alt
        } else {
          backgroundValue = coverBlock.src.substring(
            coverBlock.src.lastIndexOf('/') + 1,
            coverBlock.src.length
          )
        }
      }
      break
    case 'VideoBlock':
      isContained = true
      backgroundValue =
        coverBlock.mediaVideo?.__typename === 'Video'
          ? coverBlock.mediaVideo?.title?.[0]?.value
          : (coverBlock.title ?? '')
      break
  }

  const filterValue = isContained
    ? `${stripAlphaFromHex(selectedCardColor).toUpperCase()})`
    : `${stripAlphaFromHex(selectedCardColor).toUpperCase()} (${getOpacityFromHex(selectedCardColor)}%)`

  const disableExpanded = children.some(
    (child) => child.__typename === 'VideoBlock'
  )
  const layoutValue = disableExpanded
    ? t('Contained')
    : fullscreen
      ? t('Expanded')
      : t('Contained')

  return (
    <Box data-testid="CardProperties">
      <Accordion
        icon={<FlexAlignBottom1Icon />}
        id={`${id}-layout`}
        name={t('Layout')}
        value={layoutValue}
      >
        <CardLayout disableExpanded={disableExpanded} />
      </Accordion>
      <Accordion
        icon={<SunIcon2 />}
        id={`${id}-theme-mode`}
        name={t('Style')}
        value={
          themeMode == null
            ? t('Default')
            : themeMode === ThemeMode.light
              ? t('Light')
              : t('Dark')
        }
      >
        <CardStyling />
      </Accordion>
      <Accordion
        id={`${id}-cover-block`}
        icon={
          coverBlock?.__typename === 'VideoBlock' ? (
            <VideoOnIcon />
          ) : (
            <Image3Icon />
          )
        }
        name={t('Background')}
        value={backgroundValue}
        param="background-media"
      >
        <BackgroundMedia />
      </Accordion>
      <Accordion
        id={`${id}-background-color`}
        icon={<PaletteIcon />}
        name={t('Filter')}
        value={filterValue}
      >
        <BackgroundColor
          key={selectedStep?.id}
          isContained={isContained}
          disableExpanded={disableExpanded}
        />
      </Accordion>
    </Box>
  )
}
