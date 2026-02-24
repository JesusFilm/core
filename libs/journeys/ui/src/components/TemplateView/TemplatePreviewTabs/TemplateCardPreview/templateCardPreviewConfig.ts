import type { SxProps, Theme } from '@mui/material/styles'
import { A11y, FreeMode, Keyboard, Mousewheel } from 'swiper/modules'
import type { SwiperModule, SwiperOptions } from 'swiper/types'

export type TemplateCardPreviewVariant =
  | 'preview'
  | 'media'
  | 'guestPreviewMobile'
  | 'guestPreviewDesktop'

interface FramePortalConfig {
  width: { xs: number; sm: number }
  height: { xs: number; sm: number }
  transform: { xs: string; sm: string }
  borderRadius?: number | string
}

type BreakpointSwiperOptions = Pick<
  SwiperOptions,
  | 'spaceBetween'
  | 'slidesOffsetAfter'
  | 'slidesPerView'
  | 'centeredSlides'
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
  /**
   * When true, card and iframe fill 100% of the Swiper slide and the inner
   * journey content is scaled dynamically via ResizeObserver instead of using
   * the fixed cardWidth/cardHeight/framePortal dimensions.
   */
  useFluidSizing?: boolean
  /**
   * Logical (design) size of the journey content rendered inside the iframe.
   * Used to compute the dynamic scale when useFluidSizing is true.
   * Defaults to { width: 485, height: 738 } when not provided.
   */
  framePortalLogicalSize?: { width: number; height: number }
}

export const SELECTED_SCALE = 1.07 // 1.07 is the scale of the selected card in the media variant
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
    xs: { spaceBetween: 12, slidesOffsetAfter: 200 },
    sm: { spaceBetween: 12, slidesOffsetAfter: 400 }
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
    overflow: 'hidden',
    zIndex: 2,
    '& .swiper-wrapper': {
      alignItems: 'center'
    }
  },
  modules: [Mousewheel, A11y]
}

// xs: 485 * 0.66 ≈ 320px wide, 738 * 0.66 ≈ 487px tall (targets ~95vw dialog, 1.15 slides)
// sm: 445 * 0.22 ≈ 98px wide, 673 * 0.22 ≈ 148px tall (targets ~570px dialog, 5 slides)
const GUEST_PREVIEW_MOBILE_CARD_WIDTH_XS = 320
const GUEST_PREVIEW_MOBILE_CARD_HEIGHT_XS = 487
const GUEST_PREVIEW_MOBILE_CARD_WIDTH_SM = 98
const GUEST_PREVIEW_MOBILE_CARD_HEIGHT_SM = 148

const GUEST_PREVIEW_MOBILE_VARIANT_CONFIG: VariantConfig = {
  cardWidth: {
    xs: GUEST_PREVIEW_MOBILE_CARD_WIDTH_XS,
    sm: GUEST_PREVIEW_MOBILE_CARD_WIDTH_SM
  },
  cardHeight: {
    xs: GUEST_PREVIEW_MOBILE_CARD_HEIGHT_XS,
    sm: GUEST_PREVIEW_MOBILE_CARD_HEIGHT_SM
  },
  swiperHeight: {
    xs: GUEST_PREVIEW_MOBILE_CARD_HEIGHT_XS,
    sm: GUEST_PREVIEW_MOBILE_CARD_HEIGHT_SM
  },
  showMoreCardsSlide: false,
  framePortal: {
    width: { xs: 485, sm: 445 },
    height: { xs: 738, sm: 673 },
    transform: { xs: 'scale(0.66)', sm: 'scale(0.22)' },
    borderRadius: 4
  },
  breakpoints: {
    xs: {
      slidesPerView: 1.15,
      centeredSlides: true,
      spaceBetween: 12,
      slidesOffsetAfter: 0
    },
    sm: {
      slidesPerView: 5,
      spaceBetween: 20,
      slidesOffsetAfter: 0
    }
  },
  swiperProps: {
    allowTouchMove: true,
    resistance: true,
    resistanceRatio: 0.85,
    keyboard: { enabled: true },
    mousewheel: { forceToAxis: true },
    watchOverflow: true,
    speed: 300
  },
  cardSx: {
    position: 'relative',
    backgroundColor: 'background.default',
    borderRadius: 4
  },
  slideSx: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  swiperSx: {
    overflow: 'hidden',
    width: '100%',
    zIndex: 2
  },
  modules: [A11y, Keyboard, Mousewheel]
}

// Desktop dialog: 4 full cards + peek of 5th. Card dimensions are driven by
// the Swiper container (fluid sizing) — cardWidth/cardHeight/framePortal are
// kept only to satisfy the VariantConfig type; they are not used for layout.
const GUEST_PREVIEW_DESKTOP_LOGICAL_WIDTH = 485
const GUEST_PREVIEW_DESKTOP_LOGICAL_HEIGHT = 738

const GUEST_PREVIEW_DESKTOP_VARIANT_CONFIG: VariantConfig = {
  useFluidSizing: true,
  framePortalLogicalSize: {
    width: GUEST_PREVIEW_DESKTOP_LOGICAL_WIDTH,
    height: GUEST_PREVIEW_DESKTOP_LOGICAL_HEIGHT
  },
  // Fallback values only — ignored for layout when useFluidSizing is true
  cardWidth: { xs: GUEST_PREVIEW_DESKTOP_LOGICAL_WIDTH, sm: GUEST_PREVIEW_DESKTOP_LOGICAL_WIDTH },
  cardHeight: { xs: GUEST_PREVIEW_DESKTOP_LOGICAL_HEIGHT, sm: GUEST_PREVIEW_DESKTOP_LOGICAL_HEIGHT },
  swiperHeight: { xs: GUEST_PREVIEW_DESKTOP_LOGICAL_HEIGHT, sm: GUEST_PREVIEW_DESKTOP_LOGICAL_HEIGHT },
  showMoreCardsSlide: false,
  framePortal: {
    width: { xs: GUEST_PREVIEW_DESKTOP_LOGICAL_WIDTH, sm: GUEST_PREVIEW_DESKTOP_LOGICAL_WIDTH },
    height: { xs: GUEST_PREVIEW_DESKTOP_LOGICAL_HEIGHT, sm: GUEST_PREVIEW_DESKTOP_LOGICAL_HEIGHT },
    transform: { xs: 'none', sm: 'none' },
    borderRadius: 4
  },
  breakpoints: {
    xs: {
      slidesPerView: 4.15,
      centeredSlides: false,
      spaceBetween: 16,
      slidesOffsetAfter: 0
    },
    sm: {
      slidesPerView: 4.15,
      centeredSlides: false,
      spaceBetween: 16,
      slidesOffsetAfter: 0
    }
  },
  swiperProps: {
    allowTouchMove: true,
    keyboard: { enabled: true },
    mousewheel: { forceToAxis: true },
    watchOverflow: true,
    speed: 300,
    autoHeight: true,
    resizeObserver: true
  },
  cardSx: {
    position: 'relative',
    borderRadius: 4,
    overflow: 'hidden'
  },
  slideSx: {
    aspectRatio: `${GUEST_PREVIEW_DESKTOP_LOGICAL_WIDTH}/${GUEST_PREVIEW_DESKTOP_LOGICAL_HEIGHT}`,
    display: 'flex',
    alignItems: 'stretch'
  },
  swiperSx: {
    overflow: 'hidden',
    width: '100%',
    maxHeight: '85vh',
    zIndex: 2
  },
  modules: [A11y, Keyboard, Mousewheel]
}

export const VARIANT_CONFIGS: Record<
  TemplateCardPreviewVariant,
  VariantConfig
> = {
  preview: PREVIEW_VARIANT_CONFIG,
  media: MEDIA_VARIANT_CONFIG,
  guestPreviewMobile: GUEST_PREVIEW_MOBILE_VARIANT_CONFIG,
  guestPreviewDesktop: GUEST_PREVIEW_DESKTOP_VARIANT_CONFIG
}
