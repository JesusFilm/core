import type { SxProps, Theme } from '@mui/material/styles'
import { A11y, FreeMode, Mousewheel } from 'swiper/modules'
import type { SwiperModule, SwiperOptions } from 'swiper/types'

export type TemplateCardPreviewVariant = 'preview' | 'media'

interface FramePortalConfig {
  width: { xs: number; sm: number }
  height: { xs: number; sm: number }
  transform: { xs: string; sm: string }
  borderRadius?: number | string
}

type BreakpointSwiperOptions = Pick<
  SwiperOptions,
  'spaceBetween' | 'slidesOffsetAfter'
>

export interface VariantConfig {
  cardWidth: { xs: number; sm: number }
  cardHeight: { xs: number; sm: number }
  swiperHeight: { xs: number; sm: number }
  showMoreCardsSlide: boolean
  framePortal: FramePortalConfig
  swiperProps?: Partial<SwiperOptions>
  breakpoints: { xs: BreakpointSwiperOptions; sm: BreakpointSwiperOptions }
  cardSx: SxProps<Theme>
  slideSx: SxProps<Theme>
  swiperSx: SxProps<Theme>
  modules?: SwiperModule[]
}

export const SELECTED_SCALE = 1.07
const MEDIA_CARD_HEIGHT = 209
const PREVIEW_CARD_HEIGHT_XS = 295
const PREVIEW_CARD_HEIGHT_SM = 404

const PREVIEW_VARIANT_CONFIG: VariantConfig = {
  cardWidth: { xs: 194, sm: 267 },
  cardHeight: { xs: PREVIEW_CARD_HEIGHT_XS, sm: PREVIEW_CARD_HEIGHT_SM },
  swiperHeight: { xs: PREVIEW_CARD_HEIGHT_XS, sm: PREVIEW_CARD_HEIGHT_SM },
  showMoreCardsSlide: true,
  framePortal: {
    width: { xs: 485, sm: 445 },
    height: { xs: 738, sm: 673 },
    transform: { xs: 'scale(0.4)', sm: 'scale(0.6)' },
    borderRadius: 4
  },
  breakpoints: {
    xs: { spaceBetween: 12, slidesOffsetAfter: 0 },
    sm: { spaceBetween: 28, slidesOffsetAfter: 0 }
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

const MEDIA_VARIANT_CONFIG: VariantConfig = {
  cardWidth: { xs: 120, sm: 120 },
  cardHeight: { xs: MEDIA_CARD_HEIGHT, sm: MEDIA_CARD_HEIGHT },
  swiperHeight: {
    xs: MEDIA_CARD_HEIGHT * SELECTED_SCALE,
    sm: MEDIA_CARD_HEIGHT * SELECTED_SCALE
  },
  showMoreCardsSlide: false,
  framePortal: {
    width: { xs: 300, sm: 300 },
    height: { xs: 523, sm: 523 },
    transform: { xs: 'scale(0.4)', sm: 'scale(0.4)' },
    borderRadius: '24px'
  },
  breakpoints: {
    xs: { spaceBetween: 12, slidesOffsetAfter: 265 },
    sm: { spaceBetween: 12, slidesOffsetAfter: 260 }
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
    height: 209,
    width: 120,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px'
  },
  swiperSx: {
    overflow: 'visible',
    zIndex: 2,
    '& .swiper-wrapper': {
      alignItems: 'center'
    }
  },
  modules: [Mousewheel, A11y]
}

export const VARIANT_CONFIGS: Record<
  TemplateCardPreviewVariant,
  VariantConfig
> = {
  preview: PREVIEW_VARIANT_CONFIG,
  media: MEDIA_VARIANT_CONFIG
}
