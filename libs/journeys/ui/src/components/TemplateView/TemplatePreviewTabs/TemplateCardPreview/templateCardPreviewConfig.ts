import type { SxProps, Theme } from '@mui/material/styles'
import { A11y, FreeMode, Mousewheel, Navigation } from 'swiper/modules'
import type { SwiperModule, SwiperOptions } from 'swiper/types'

export type TemplateCardPreviewVariant = 'preview' | 'media'

interface FramePortalConfig {
  width: { xs: number; sm: number }
  height: { xs: number; sm: number }
  transform: { xs: string; sm: string }
  borderRadius?: number
}

export interface VariantConfig {
  cardWidth: { xs: number; sm: number }
  cardHeight: { xs: number; sm: number }
  swiperHeight: { xs: number; sm: number }
  showMoreCardsSlide: boolean
  showNavigation: boolean
  framePortal: FramePortalConfig
  swiperProps?: Partial<SwiperOptions>
  cardSx: SxProps<Theme>
  slideSx: SxProps<Theme>
  swiperSx: SxProps<Theme>
  modules?: SwiperModule[]
}

export const SELECTED_SCALE = 1.07

const PREVIEW_VARIANT_CONFIG: VariantConfig = {
  cardWidth: { xs: 194, sm: 267 },
  cardHeight: { xs: 295, sm: 404 },
  swiperHeight: { xs: 295, sm: 404 },
  showMoreCardsSlide: true,
  showNavigation: false,
  framePortal: {
    width: { xs: 485, sm: 445 },
    height: { xs: 738, sm: 673 },
    transform: { xs: 'scale(0.4)', sm: 'scale(0.6)' }
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
  cardHeight: { xs: 209, sm: 209 },
  swiperHeight: { xs: 209 * SELECTED_SCALE, sm: 209 * SELECTED_SCALE },
  showMoreCardsSlide: false,
  showNavigation: true,
  framePortal: {
    width: { xs: 300, sm: 300 },
    height: { xs: 523, sm: 523 },
    transform: { xs: 'scale(0.4)', sm: 'scale(0.4)' },
    borderRadius: 12
  },
  swiperProps: {
    mousewheel: { forceToAxis: true },
    freeMode: true,
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
    borderRadius: 3
  },
  slideSx: {
    height: 209,
    width: 120,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  swiperSx: {
    overflow: 'hidden',
    zIndex: 2,
    '& .swiper-wrapper': {
      alignItems: 'center'
    }
  },
  modules: [Mousewheel, FreeMode, A11y, Navigation]
}

export const VARIANT_CONFIGS: Record<
  TemplateCardPreviewVariant,
  VariantConfig
> = {
  preview: PREVIEW_VARIANT_CONFIG,
  media: MEDIA_VARIANT_CONFIG
}
