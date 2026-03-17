import type { SxProps, Theme } from '@mui/material/styles'
import { A11y, FreeMode, Mousewheel } from 'swiper/modules'
import type { SwiperModule, SwiperOptions } from 'swiper/types'

export type TemplateCardPreviewVariant =
  | 'standard'
  | 'compact'
  | 'guestPreviewDesktop'
  | 'guestPreviewMobile'

interface FramePortalConfig {
  width: { xs: number; sm: number }
  height: { xs: number; sm: number }
  scale?: { xs: number; sm: number }
  transform?: { xs: string; sm: string }
  borderRadius?: number | string
}

export type BreakpointSwiperOptions = Pick<
  SwiperOptions,
  'spaceBetween' | 'slidesOffsetBefore'
>

export interface VariantConfig {
  cardWidth: { xs: number; sm: number }
  cardHeight: { xs: number; sm: number }
  swiperHeight: { xs: number; sm: number }
  showMoreCardsSlide?: boolean
  framePortal: FramePortalConfig
  swiperProps?: Partial<SwiperOptions>
  breakpoints?: { xs: BreakpointSwiperOptions; sm: BreakpointSwiperOptions }
  cardSx: SxProps<Theme>
  slideSx: SxProps<Theme>
  selectedSlideSx: SxProps<Theme>
  swiperSx: SxProps<Theme>
  modules?: SwiperModule[]
  opacity?: number
  selectedBoxShadow?: string
}

export const SELECTED_SCALE = 1.25
export const OVERFLOW_PX = 40
const COMPACT_CARD_HEIGHT = 209
const COMPACT_CARD_WIDTH = 120
const STANDARD_CARD_HEIGHT_XS = 295
const STANDARD_CARD_HEIGHT_SM = 404

const STANDARD_VARIANT_CONFIG: VariantConfig = {
  cardWidth: { xs: 194, sm: 267 },
  cardHeight: { xs: STANDARD_CARD_HEIGHT_XS, sm: STANDARD_CARD_HEIGHT_SM },
  swiperHeight: { xs: STANDARD_CARD_HEIGHT_XS, sm: STANDARD_CARD_HEIGHT_SM },
  showMoreCardsSlide: true,
  framePortal: {
    width: { xs: 485, sm: 445 },
    height: { xs: 738, sm: 673 },
    scale: { xs: 0.4, sm: 0.6 },
    borderRadius: 4
  },
  breakpoints: {
    xs: { spaceBetween: 12 },
    sm: { spaceBetween: 28 }
  },
  cardSx: {
    position: 'relative',
    backgroundColor: 'background.default',
    borderRadius: 3
  },
  slideSx: {
    zIndex: 2,
    mr: { xs: 3, sm: 7 },
    width: 'unset !important'
  },
  selectedSlideSx: {},
  swiperSx: {
    overflow: 'visible',
    zIndex: 2
  },
  swiperProps: {
    mousewheel: { forceToAxis: true },
    freeMode: true,
    watchOverflow: true,
    slidesPerView: 'auto',
    spaceBetween: 12,
    observer: true,
    observeParents: true
  },
  modules: [Mousewheel, FreeMode, A11y]
}

const COMPACT_VARIANT_CONFIG: VariantConfig = {
  cardWidth: { xs: COMPACT_CARD_WIDTH, sm: COMPACT_CARD_WIDTH },
  cardHeight: { xs: COMPACT_CARD_HEIGHT, sm: COMPACT_CARD_HEIGHT },
  swiperHeight: {
    xs: COMPACT_CARD_HEIGHT * SELECTED_SCALE,
    sm: COMPACT_CARD_HEIGHT * SELECTED_SCALE
  },
  showMoreCardsSlide: false,
  framePortal: {
    width: { xs: 300, sm: 300 },
    height: { xs: 523, sm: 523 },
    scale: { xs: 0.4, sm: 0.4 },
    borderRadius: '24px'
  },
  breakpoints: {
    xs: { spaceBetween: 12, slidesOffsetBefore: 0 },
    sm: { spaceBetween: 12, slidesOffsetBefore: OVERFLOW_PX }
  },
  swiperProps: {
    mousewheel: { forceToAxis: true },
    watchOverflow: true,
    slidesPerView: 'auto',
    spaceBetween: 12,
    observer: true,
    observeParents: true,
    allowTouchMove: true
  },
  cardSx: {
    position: 'relative',
    backgroundColor: 'background.default',
    borderRadius: '12px'
  },
  slideSx: {
    height: COMPACT_CARD_HEIGHT,
    width: COMPACT_CARD_WIDTH,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px'
  },
  selectedSlideSx: {
    width: COMPACT_CARD_WIDTH * SELECTED_SCALE,
    height: COMPACT_CARD_HEIGHT * SELECTED_SCALE,
    zIndex: 1
  },
  selectedBoxShadow: `0px 1px 8px 0px rgba(0, 0, 0, 0.2),
    0px 3px 3px 0px rgba(0, 0, 0, 0.12),
    0px 3px 4px 0px rgba(0, 0, 0, 0.14)`,
  swiperSx: {
    width: '100%',
    overflow: { xs: 'visible', sm: 'hidden' },
    zIndex: 2,
    '& .swiper-wrapper': {
      alignItems: 'center'
    }
  },
  modules: [Mousewheel, A11y],
  opacity: 0.75
}

const GUEST_PREVIEW_DESKTOP_CARD_WIDTH = 360
const GUEST_PREVIEW_DESKTOP_CARD_HEIGHT = 640

const GUEST_PREVIEW_DESKTOP_VARIANT_CONFIG: VariantConfig = {
  cardWidth: {
    xs: GUEST_PREVIEW_DESKTOP_CARD_WIDTH,
    sm: GUEST_PREVIEW_DESKTOP_CARD_WIDTH
  },
  cardHeight: {
    xs: GUEST_PREVIEW_DESKTOP_CARD_HEIGHT,
    sm: GUEST_PREVIEW_DESKTOP_CARD_HEIGHT
  },
  swiperHeight: {
    xs: GUEST_PREVIEW_DESKTOP_CARD_HEIGHT,
    sm: GUEST_PREVIEW_DESKTOP_CARD_HEIGHT
  },
  showMoreCardsSlide: false,
  framePortal: {
    width: {
      xs: GUEST_PREVIEW_DESKTOP_CARD_WIDTH,
      sm: GUEST_PREVIEW_DESKTOP_CARD_WIDTH
    },
    height: {
      xs: GUEST_PREVIEW_DESKTOP_CARD_HEIGHT,
      sm: GUEST_PREVIEW_DESKTOP_CARD_HEIGHT
    },
    borderRadius: 4
  },
  breakpoints: {
    xs: { spaceBetween: 16, slidesOffsetAfter: 0 },
    sm: { spaceBetween: 16, slidesOffsetAfter: 0 }
  },
  cardSx: {
    position: 'relative',
    backgroundColor: 'background.transparent',
    borderRadius: 12
  },
  slideSx: {
    zIndex: 2,
    width: 'auto',
    flexShrink: 0
  },
  swiperSx: {
    overflow: 'visible',
    zIndex: 2
  },
  swiperProps: {
    mousewheel: { forceToAxis: true },
    watchOverflow: true,
    slidesPerView: 'auto',
    spaceBetween: 16,
    centeredSlides: true,
    observer: true,
    observeParents: true
  },
  modules: [Mousewheel, A11y]
}

const GUEST_PREVIEW_MOBILE_CARD_WIDTH = 300
const GUEST_PREVIEW_MOBILE_CARD_HEIGHT = 520

const GUEST_PREVIEW_MOBILE_VARIANT_CONFIG: VariantConfig = {
  cardWidth: {
    xs: GUEST_PREVIEW_MOBILE_CARD_WIDTH,
    sm: GUEST_PREVIEW_MOBILE_CARD_WIDTH
  },
  cardHeight: {
    xs: GUEST_PREVIEW_MOBILE_CARD_HEIGHT,
    sm: GUEST_PREVIEW_MOBILE_CARD_HEIGHT
  },
  swiperHeight: {
    xs: GUEST_PREVIEW_MOBILE_CARD_HEIGHT,
    sm: GUEST_PREVIEW_MOBILE_CARD_HEIGHT
  },
  framePortal: {
    width: {
      xs: GUEST_PREVIEW_MOBILE_CARD_WIDTH,
      sm: GUEST_PREVIEW_MOBILE_CARD_WIDTH
    },
    height: {
      xs: GUEST_PREVIEW_MOBILE_CARD_HEIGHT,
      sm: GUEST_PREVIEW_MOBILE_CARD_HEIGHT
    },
    borderRadius: 4
  },
  cardSx: {
    position: 'relative',
    backgroundColor: 'transparent',
    borderRadius: 4
  },
  slideSx: {
    zIndex: 2,
    width: 'auto',
    flexShrink: 0
  },
  swiperSx: {
    overflow: 'visible',
    zIndex: 2
  },
  swiperProps: {
    mousewheel: { forceToAxis: true },
    watchOverflow: true,
    slidesPerView: 'auto',
    spaceBetween: 16,
    centeredSlides: true,
    observer: true,
    observeParents: true
  },
  modules: [Mousewheel, A11y]
}

export const VARIANT_CONFIGS: Record<
  TemplateCardPreviewVariant,
  VariantConfig
> = {
  standard: STANDARD_VARIANT_CONFIG,
  compact: COMPACT_VARIANT_CONFIG,
  guestPreviewDesktop: GUEST_PREVIEW_DESKTOP_VARIANT_CONFIG,
  guestPreviewMobile: GUEST_PREVIEW_MOBILE_VARIANT_CONFIG
}
