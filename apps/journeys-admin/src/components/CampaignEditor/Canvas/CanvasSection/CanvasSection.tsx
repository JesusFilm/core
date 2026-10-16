import { useDraggable, useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { SimplePaletteColorOptions } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import {
  MouseEvent,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'

import {
  CAMPAIGN_HEADER_HEIGHT,
  bandCssVariables,
  campaignImageSource,
  columnsGridTemplate,
  isCampaignSection,
  isExtra,
  overlayAlpha,
  resolveBand
} from '@core/journeys/ui/Campaign'
import type { CampaignTreeBlock } from '@core/journeys/ui/Campaign'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import DragIcon from '@core/shared/ui/icons/Drag'
import Menu1Icon from '@core/shared/ui/icons/Menu1'
import { adminTheme } from '@core/shared/ui/themes/journeysAdmin/theme'

import {
  GetCampaign_campaign_blocks as CampaignBlock,
  GetCampaign_campaign_strings as CampaignString
} from '../../../../../__generated__/GetCampaign'
import {
  CampaignBackgroundKind,
  CampaignChildPlacement,
  CampaignFeaturedMediaLayout,
  CampaignMediaSide,
  CampaignStringKey,
  TypographyVariant
} from '../../../../../__generated__/globalTypes'
import {
  CAMPAIGN_TEXT_FIELDS,
  CampaignTextBlock,
  CampaignTextField,
  isCampaignTextBlock
} from '../../../../libs/useCampaignBlockTextMutation'
import { AnalyticsEdit } from '../../AnalyticsEdit'
import { blockLabel } from '../../blockLabel'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { JourneyListEdit } from '../../JourneyListEdit'
import { RegionSwitcherEdit } from '../../RegionSwitcherEdit'
import { ShareSectionEdit } from '../../ShareSectionEdit'
import { CanvasCarousel } from '../CanvasCarousel'
import { CanvasColumnSlot } from '../CanvasColumnSlot'
import { CanvasMedia } from '../CanvasMedia'
import { HOVER_OUTLINE_SX } from '../hoverOutline'
import { InlineText } from '../InlineText'
import { SelectionBadge } from '../SelectionBadge'

export type CanvasBlock = CampaignTreeBlock<CampaignBlock>

interface CanvasSectionProps {
  block: CanvasBlock
  /** A page section moves by its drag handle; chrome never does. */
  draggable?: boolean
  /** The drop indicator to show while another section is dragged over this one. */
  dropEdge?: 'before' | 'after'
  /** The section sits in a Column Slot: no page container, no section rhythm. */
  inSlot?: boolean
}

const adminPrimary = adminTheme.palette.primary as SimplePaletteColorOptions

const SELECTED_OUTLINE = {
  outline: `2px solid ${adminPrimary.main}`,
  outlineOffset: -2
}

function isAbove(child: CanvasBlock): boolean {
  return isExtra(child) && child.placement === CampaignChildPlacement.above
}

interface CanvasExtraProps {
  block: CanvasBlock
  selected: boolean
  onSelect: () => void
  focusField?: CampaignTextField
}

/** A text or button Extra: click to select, edit its one text field in place. */
function CanvasExtra({
  block,
  selected,
  onSelect,
  focusField
}: CanvasExtraProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')

  function handleClick(event: MouseEvent<HTMLElement>): void {
    event.stopPropagation()
    onSelect()
  }

  switch (block.__typename) {
    case 'CampaignTypographyBlock':
      return (
        <Box
          id={block.id}
          data-testid={`CanvasExtra-${block.id}`}
          data-selected={selected}
          data-hoverable
          onClick={handleClick}
          sx={{
            position: 'relative',
            width: '100%',
            cursor: 'pointer',
            ...HOVER_OUTLINE_SX,
            ...(selected ? SELECTED_OUTLINE : {})
          }}
        >
          <SelectionBadge
            id={block.id}
            label={blockLabel(t, block.__typename)}
            selected={selected}
          />
          <InlineText
            target={{ block, field: 'content' }}
            placeholder={t('Your text')}
            editing={selected}
            autoFocus={selected && focusField === 'content'}
            onSelect={onSelect}
            variant={block.typographyVariant ?? TypographyVariant.body1}
            variantMapping={{ overline: 'p', caption: 'p' }}
            align={block.align ?? undefined}
            sx={{ color: block.color ?? 'var(--campaign-band-text)' }}
          />
        </Box>
      )
    case 'CampaignButtonBlock': {
      const buttonVariant = block.buttonVariant ?? 'contained'
      return (
        <Box
          id={block.id}
          data-testid={`CanvasExtra-${block.id}`}
          data-selected={selected}
          data-hoverable
          onClick={handleClick}
          sx={{
            position: 'relative',
            display: 'flex',
            cursor: 'pointer',
            ...HOVER_OUTLINE_SX,
            ...(selected ? SELECTED_OUTLINE : {}),
            justifyContent:
              block.align === 'center'
                ? 'center'
                : block.align === 'right'
                  ? 'flex-end'
                  : block.align === 'left'
                    ? 'flex-start'
                    : 'inherit'
          }}
        >
          <SelectionBadge
            id={block.id}
            label={blockLabel(t, block.__typename)}
            selected={selected}
          />
          <Button
            component="div"
            variant={buttonVariant}
            size={block.size ?? 'medium'}
            data-testid="CanvasButton"
            tabIndex={-1}
            // Selecting is not a press: no ripple, and the hover only dims
            // the campaign colour as the public CampaignButton does.
            disableRipple
            sx={{
              bgcolor:
                buttonVariant === 'contained'
                  ? (block.color ?? 'var(--campaign-band-button)')
                  : undefined,
              color:
                buttonVariant === 'contained'
                  ? (block.labelColor ?? 'var(--campaign-band-button-label)')
                  : (block.color ?? 'var(--campaign-band-button)'),
              borderColor: block.color ?? 'var(--campaign-band-button)',
              '&:hover': {
                bgcolor:
                  buttonVariant === 'contained'
                    ? (block.color ?? 'var(--campaign-band-button)')
                    : undefined,
                borderColor: block.color ?? 'var(--campaign-band-button)',
                filter:
                  buttonVariant === 'contained' ? 'brightness(0.92)' : undefined
              }
            }}
          >
            <InlineText
              target={{ block, field: 'label' }}
              placeholder={t('Button')}
              editing={selected}
              autoFocus={selected && focusField === 'label'}
              onSelect={onSelect}
              variant="inherit"
              component="span"
              autoWidth
            />
          </Button>
        </Box>
      )
    }
    default:
      return null
  }
}

interface SectionTextProps {
  block: CampaignTextBlock
  field: CampaignTextField
  editing: boolean
  focusField?: CampaignTextField
  onSelect: (field: CampaignTextField) => void
  titleVariant: 'h1' | 'h2'
}

function sectionFieldPlaceholder(
  t: (key: string) => string,
  field: CampaignTextField
): string {
  switch (field) {
    case 'eyebrow':
      return t('Eyebrow')
    case 'title':
      return t('Title')
    case 'lede':
      return t('Lede')
    case 'intro':
      return t('Intro')
    case 'richTextContent':
      return t('Your text')
    case 'bullets':
      return t('Bullets, one per line')
    default:
      return t('Your text')
  }
}

/** One of a section's typed text fields, styled as the public page styles it. */
function SectionText({
  block,
  field,
  editing,
  focusField,
  onSelect,
  titleVariant
}: SectionTextProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const value = (block as unknown as Record<string, string | null>)[field]
  if (!editing && (value == null || value.trim() === '')) return null
  const styles = {
    eyebrow: {
      variant: 'overline' as const,
      sx: { color: 'var(--campaign-band-eyebrow)' }
    },
    title: {
      variant: titleVariant,
      sx: { color: 'var(--campaign-band-heading)' }
    },
    lede: {
      variant: 'body1' as const,
      sx: { color: 'var(--campaign-band-muted)', maxWidth: 720 }
    },
    intro: {
      variant: 'body1' as const,
      sx: { color: 'var(--campaign-band-muted)', maxWidth: 720 }
    },
    richTextContent: {
      variant: 'body1' as const,
      sx: { maxWidth: 720 }
    },
    bullets: {
      variant: 'body1' as const,
      sx: { color: 'var(--campaign-band-text)', maxWidth: 720 }
    }
  }[
    field as
      | 'eyebrow'
      | 'title'
      | 'lede'
      | 'intro'
      | 'richTextContent'
      | 'bullets'
  ]

  return (
    <InlineText
      target={{ block, field }}
      placeholder={sectionFieldPlaceholder(t, field)}
      editing={editing}
      autoFocus={editing && focusField === field}
      onSelect={() => onSelect(field)}
      variant={styles.variant}
      sx={styles.sx}
    />
  )
}

/**
 * The Campaign Strings each section's public rendering reads (PRD §2): the
 * share steps and buttons on the Region Share section, the back chip on the
 * Region Header, the carousel's Watch wording, the journey card's button and
 * the Analytics tile labels. Until each section's own canvas body lands they
 * render as one editable list under the section's text.
 */
export const CAMPAIGN_SECTION_STRING_KEYS: Partial<
  Record<CampaignBlock['__typename'], readonly CampaignStringKey[]>
> = {
  CampaignRegionHeaderBlock: [CampaignStringKey.allRegions],
  CampaignRegionShareBlock: [
    CampaignStringKey.step1,
    CampaignStringKey.step2,
    CampaignStringKey.step2help,
    CampaignStringKey.step3,
    CampaignStringKey.step4,
    CampaignStringKey.copy,
    CampaignStringKey.copied,
    CampaignStringKey.downloadQr,
    CampaignStringKey.open
  ],
  CampaignVideoCarouselBlock: [
    CampaignStringKey.watch,
    CampaignStringKey.youtube,
    CampaignStringKey.seeAllOnWatch,
    CampaignStringKey.videos
  ],
  CampaignJourneyListBlock: [CampaignStringKey.openTemplate],
  CampaignAnalyticsBlock: [
    CampaignStringKey.totalVisitors,
    CampaignStringKey.topCountry
  ]
}

interface CanvasStringsProps {
  strings: CampaignString[]
  editing: boolean
  onSelect: () => void
}

/** A section's Campaign Strings, each inline-editable like any other text. */
function CanvasStrings({
  strings,
  editing,
  onSelect
}: CanvasStringsProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  if (strings.length === 0) return null
  return (
    <Stack
      spacing={1}
      data-testid="CanvasStrings"
      sx={{ width: '100%', maxWidth: 720, alignItems: 'inherit' }}
    >
      {editing && (
        <Typography
          variant="overline"
          component="p"
          sx={{ color: 'var(--campaign-band-muted)' }}
        >
          {t('Campaign strings')}
        </Typography>
      )}
      {strings.map((string) => (
        <InlineText
          key={string.id}
          target={{ string }}
          placeholder={string.key}
          editing={editing}
          onSelect={onSelect}
          variant="body2"
          sx={{ color: 'var(--campaign-band-text)' }}
        />
      ))}
    </Stack>
  )
}

/**
 * One section on the editor canvas: the band from the shared resolution
 * table, the Extras placed above, the section's typed text, the Campaign
 * Strings its public rendering reads, then the Extras placed below. A hero
 * with media and a Featured Media section put their Media Slot beside that
 * text (Featured Media on its `mediaSide`, with a placeholder while empty),
 * stacked below `md` (Featured Media stacked at every width when its layout
 * is `stacked`, the media full width under the text); a Video Carousel shows its cards below its text.
 * Clicking anywhere selects the section; clicking an Extra or a carousel
 * item selects it. The selected block's text fields and strings become
 * inline inputs. The chrome follows the public layout instead: the header
 * is a sticky row (Brand Mark, nav buttons on the right, a static language
 * select); the footer a row of lines left and links right.
 */
export function CanvasSection({
  block,
  draggable = false,
  dropEdge,
  inSlot = false
}: CanvasSectionProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    campaign,
    selection,
    selectBlock,
    state: { previewLanguageId }
  } = useCampaignEditor()
  const { theme } = campaign
  const [focusField, setFocusField] = useState<CampaignTextField>()
  const [menuOpen, setMenuOpen] = useState(false)
  const selectedId = selection.block?.id
  const sectionSelected = selectedId === block.id
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: block.id,
    disabled: !draggable
  })
  const {
    setNodeRef: setDraggableRef,
    setActivatorNodeRef,
    listeners,
    attributes,
    isDragging
  } = useDraggable({ id: block.id, disabled: !draggable })
  const setSectionRef = useCallback(
    (node: HTMLElement | null) => {
      setDroppableRef(node)
      setDraggableRef(node)
    },
    [setDroppableRef, setDraggableRef]
  )
  const band = useMemo(() => {
    if (!isCampaignSection(block)) return null
    return resolveBand(block, theme)
  }, [block, theme])

  if (band == null) return null

  const styled = 'backgroundKind' in block ? block : null
  const cover =
    styled?.backgroundKind === CampaignBackgroundKind.image
      ? campaignImageSource(block.cover)
      : null
  const logo =
    block.__typename === 'CampaignHeaderBlock'
      ? campaignImageSource(block.logo)
      : null
  const picture =
    block.__typename === 'CampaignImageBlock'
      ? campaignImageSource(block)
      : null
  const align = 'align' in block ? block.align : null
  const titleVariant = block.__typename === 'CampaignHeroBlock' ? 'h1' : 'h2'
  const slots = block.children.filter(
    (child) => child.__typename === 'CampaignColumnBlock'
  )
  const extras = block.children.filter(
    (child) => child.__typename !== 'CampaignColumnBlock'
  )
  const above = extras.filter(isAbove)
  const below = extras.filter((child) => !isAbove(child))
  const alignItems =
    align === 'center'
      ? 'center'
      : align === 'right'
        ? 'flex-end'
        : 'flex-start'
  const textFields: readonly CampaignTextField[] = isCampaignTextBlock(block)
    ? CAMPAIGN_TEXT_FIELDS[block.__typename]
    : []
  const stringKeys = CAMPAIGN_SECTION_STRING_KEYS[block.__typename] ?? []
  const strings = stringKeys.flatMap((key) =>
    campaign.strings.filter((string) => string.key === key)
  )
  /** A Featured Media section always shows its slot (or the placeholder); a hero only once it has media. */
  const showMedia =
    block.__typename === 'CampaignFeaturedMediaBlock' ||
    (block.__typename === 'CampaignHeroBlock' && block.media != null)
  const stacked =
    block.__typename === 'CampaignFeaturedMediaBlock' &&
    block.layout === CampaignFeaturedMediaLayout.stacked
  const mediaLeft =
    block.__typename === 'CampaignFeaturedMediaBlock' &&
    !stacked &&
    block.mediaSide === CampaignMediaSide.left

  function handleSelectField(field: CampaignTextField): void {
    setFocusField(field)
    selectBlock(block.id)
  }

  function selectChild(childId: string, field: CampaignTextField): void {
    setFocusField(field)
    selectBlock(childId)
  }

  function renderExtra(child: CanvasBlock): ReactElement | null {
    const field: CampaignTextField =
      child.__typename === 'CampaignButtonBlock' ? 'label' : 'content'
    return (
      <CanvasExtra
        key={child.id}
        block={child}
        selected={selectedId === child.id}
        onSelect={() => selectChild(child.id, field)}
        focusField={focusField}
      />
    )
  }

  const sectionBody = (
    <Stack
      direction={
        stacked
          ? 'column'
          : { xs: 'column', md: mediaLeft ? 'row-reverse' : 'row' }
      }
      spacing={6}
      sx={{ alignItems: 'center', position: 'relative' }}
    >
      <Stack
        spacing={3}
        sx={{ alignItems, flex: 1, minWidth: 0, width: '100%' }}
      >
        {above.map(renderExtra)}
        {block.__typename === 'CampaignImageBlock' &&
          (picture != null ? (
            <Box
              component="img"
              src={picture.src}
              alt={picture.alt ?? ''}
              data-testid="CanvasSectionImage"
              sx={{
                display: 'block',
                width: '100%',
                height: 'auto',
                aspectRatio:
                  picture.width != null && picture.height != null
                    ? `${picture.width} / ${picture.height}`
                    : undefined,
                objectFit: 'cover',
                borderRadius: 1
              }}
            />
          ) : (
            <Box
              data-testid="CanvasSectionImagePlaceholder"
              sx={{
                width: '100%',
                aspectRatio: '16 / 6',
                border: '1px dashed var(--campaign-band-border)',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--campaign-band-muted)'
              }}
            >
              <Typography variant="body2">
                {t('Add a picture from Edit')}
              </Typography>
            </Box>
          ))}
        {isCampaignTextBlock(block) &&
          textFields.map((field) => (
            <SectionText
              key={field}
              block={block}
              field={field}
              editing={sectionSelected}
              focusField={focusField}
              onSelect={handleSelectField}
              titleVariant={titleVariant}
            />
          ))}
        {block.__typename === 'CampaignVideoCarouselBlock' && (
          <CanvasCarousel block={block} />
        )}
        {block.__typename === 'CampaignRegionSwitcherBlock' && (
          <RegionSwitcherEdit block={block} />
        )}
        {block.__typename === 'CampaignRegionShareBlock' && (
          <ShareSectionEdit block={block} />
        )}
        {block.__typename === 'CampaignAnalyticsBlock' && (
          <AnalyticsEdit block={block} />
        )}
        {block.__typename === 'CampaignJourneyListBlock' && (
          <JourneyListEdit
            block={block}
            active={
              sectionSelected ||
              (selection.kind === 'journey' && selection.host?.id === block.id)
            }
            focusField={focusField}
            onSelectCard={selectChild}
          />
        )}
        <CanvasStrings
          strings={strings}
          editing={sectionSelected}
          onSelect={() => {
            setFocusField(undefined)
            selectBlock(block.id)
          }}
        />
        {block.__typename === 'CampaignColumnsBlock' && (
          <Box
            data-testid={`CanvasColumns-${block.id}`}
            sx={{
              width: '100%',
              display: 'grid',
              gap: 3,
              alignItems: 'start',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                md: columnsGridTemplate(block.ratio)
              }
            }}
          >
            {slots.map((slot) => (
              <CanvasColumnSlot key={slot.id} slot={slot} />
            ))}
          </Box>
        )}
        {below.map(renderExtra)}
      </Stack>
      {showMedia && (
        <Box
          data-testid="CanvasSectionMedia"
          sx={{ flex: 1, minWidth: 0, width: '100%' }}
        >
          <CanvasMedia media={block.media} />
        </Box>
      )}
    </Stack>
  )

  const chrome =
    block.__typename === 'CampaignHeaderBlock'
      ? 'header'
      : block.__typename === 'CampaignFooterBlock'
        ? 'footer'
        : null
  const previewLanguage = campaign.languages.find(
    (language) => language.languageId === previewLanguageId
  )
  const previewLanguageLabel =
    previewLanguage == null
      ? ''
      : (previewLanguage.language.name.find((name) => name.primary)?.value ??
        previewLanguage.language.name[0]?.value ??
        previewLanguage.language.bcp47 ??
        previewLanguage.languageId)

  /** Only buttons are nav: the public header drops any other child. */
  const navButtons = extras.filter(
    (child) => child.__typename === 'CampaignButtonBlock'
  )
  const navButtonSelected = navButtons.some((child) => child.id === selectedId)
  /** Below `md` the nav sits behind the menu icon; a selected nav button opens it so it can be outlined and scrolled to. */
  const navOpen = menuOpen || navButtonSelected

  /** The phone menu is only for the header: it closes once the selection leaves the header and its nav buttons, so the taller header never covers the section the selection scrolls to. */
  const selectionInHeader = sectionSelected || navButtonSelected
  useEffect(() => {
    if (!selectionInHeader) setMenuOpen(false)
  }, [selectedId, selectionInHeader])

  function handleMenuToggle(event: MouseEvent<HTMLElement>): void {
    event.stopPropagation()
    if (!navOpen) {
      setMenuOpen(true)
      return
    }
    setMenuOpen(false)
    if (navButtonSelected) selectBlock(block.id)
  }

  /** The header row as the public `CampaignHeader` lays it out: Brand Mark, the nav buttons on the right, the language select. */
  const headerBody = (
    <Box
      data-testid="CanvasHeaderRow"
      sx={{
        display: 'flex',
        flexWrap: { xs: 'wrap', md: 'nowrap' },
        alignItems: 'center',
        columnGap: 2
      }}
    >
      <Box
        data-testid="CanvasBrandMark"
        sx={{
          display: 'flex',
          alignItems: 'center',
          minWidth: 0,
          height: CAMPAIGN_HEADER_HEIGHT
        }}
      >
        {logo != null ? (
          <Box
            component="img"
            src={logo.src}
            alt={logo.alt ?? campaign.title}
            data-testid="CanvasBrandMarkLogo"
            sx={{
              display: 'block',
              height: CAMPAIGN_HEADER_HEIGHT - 24,
              maxWidth: 200,
              objectFit: 'contain'
            }}
          />
        ) : (
          <Typography
            variant="h6"
            component="span"
            noWrap
            data-testid="CanvasBrandMarkTitle"
            sx={{ color: 'var(--campaign-band-text)' }}
          >
            {campaign.title}
          </Typography>
        )}
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      {navButtons.length > 0 && (
        <Box
          component="nav"
          id={`${block.id}-nav`}
          data-testid="CanvasHeaderNav"
          data-open={navOpen}
          sx={{
            display: { xs: navOpen ? 'flex' : 'none', md: 'flex' },
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            order: { xs: 1, md: 0 },
            flexBasis: { xs: '100%', md: 'auto' },
            gap: { xs: 1.5, md: 1 },
            pb: { xs: 2, md: 0 }
          }}
        >
          {navButtons.map(renderExtra)}
        </Box>
      )}
      {campaign.languages.length >= 2 && (
        <Box
          data-testid="CanvasLanguageSelect"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.75,
            borderRadius: 1,
            border: '1px solid var(--campaign-band-border)',
            color: 'var(--campaign-band-text)',
            whiteSpace: 'nowrap'
          }}
        >
          <Typography variant="body1" component="span">
            {previewLanguageLabel}
          </Typography>
          <ChevronDownIcon
            fontSize="small"
            sx={{ color: 'var(--campaign-band-accent)' }}
          />
        </Box>
      )}
      {navButtons.length > 0 && (
        <IconButton
          data-testid="CanvasHeaderMenuButton"
          aria-label={t('Menu')}
          aria-expanded={navOpen}
          aria-controls={`${block.id}-nav`}
          onClick={handleMenuToggle}
          sx={{
            display: { xs: 'inline-flex', md: 'none' },
            color: 'var(--campaign-band-text)'
          }}
        >
          <Menu1Icon />
        </IconButton>
      )}
    </Box>
  )

  const footerLines = extras.filter(
    (child) => child.__typename === 'CampaignTypographyBlock'
  )
  const footerLinks = extras.filter(
    (child) => child.__typename === 'CampaignButtonBlock'
  )
  const footerEmpty = footerLines.length === 0 && footerLinks.length === 0

  /** The footer row as the public `CampaignFooter` lays it out: lines left, links right, stacked below `md`. */
  const footerBody = footerEmpty ? null : (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={{ xs: 2, md: 4 }}
      data-testid="CanvasFooterRow"
      sx={{
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between'
      }}
    >
      {footerLines.length > 0 && (
        <Stack spacing={1.5} data-testid="CanvasFooterLines">
          {footerLines.map(renderExtra)}
        </Stack>
      )}
      {footerLinks.length > 0 && (
        <Box
          component="nav"
          data-testid="CanvasFooterLinks"
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 1, md: 2 }
          }}
        >
          {footerLinks.map(renderExtra)}
        </Box>
      )}
    </Stack>
  )

  const body =
    chrome === 'header'
      ? headerBody
      : chrome === 'footer'
        ? footerBody
        : sectionBody

  const rhythmSx =
    chrome === 'header'
      ? {
          position: 'sticky' as const,
          top: 0,
          zIndex: 2,
          overflowX: 'clip' as const,
          borderBottom: '1px solid var(--campaign-band-border)'
        }
      : chrome === 'footer'
        ? {
            minHeight: footerEmpty ? 24 : undefined,
            py: footerEmpty ? 0 : { xs: 4, md: 5 },
            borderTop: '1px solid var(--campaign-band-border)'
          }
        : inSlot
          ? 'backgroundKind' in block &&
            block.backgroundKind !== CampaignBackgroundKind.none
            ? { p: { xs: 3, md: 4 }, borderRadius: 1 }
            : {}
          : { py: { xs: 6, md: 10 } }

  return (
    <Box
      ref={setSectionRef}
      component="section"
      id={block.id}
      data-testid={`CanvasSection-${block.id}`}
      data-selected={sectionSelected}
      data-hoverable
      style={bandCssVariables(band)}
      onClick={(event: MouseEvent<HTMLElement>) => {
        event.stopPropagation()
        setFocusField(undefined)
        selectBlock(block.id)
      }}
      sx={{
        position: 'relative',
        backgroundColor: 'var(--campaign-band-background)',
        color: 'var(--campaign-band-text)',
        textAlign: align ?? undefined,
        scrollMarginTop:
          chrome === 'header' ? undefined : `${CAMPAIGN_HEADER_HEIGHT}px`,
        ...rhythmSx,
        // Keeps the badges inside this section from competing with the sticky header.
        ...(chrome !== 'header' && !inSlot
          ? { isolation: 'isolate' as const }
          : {}),
        cursor: 'pointer',
        opacity: isDragging ? 0.6 : 1,
        ...HOVER_OUTLINE_SX,
        ...(sectionSelected ? SELECTED_OUTLINE : {})
      }}
    >
      <SelectionBadge
        id={block.id}
        label={blockLabel(t, block.__typename)}
        selected={sectionSelected}
        placement={inSlot ? 'above' : 'inside'}
      />
      {draggable && (
        <Box
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          aria-label={t('Drag section')}
          data-testid={`CanvasSectionDragHandle-${block.id}`}
          sx={{
            position: 'absolute',
            top: '50%',
            left: 8,
            transform: 'translateY(-50%)',
            display: 'flex',
            p: 0.5,
            borderRadius: 1,
            bgcolor: 'background.paper',
            color: adminPrimary.main,
            boxShadow: 1,
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none',
            opacity: sectionSelected ? 1 : 0,
            'section:hover > &, &:focus-visible': { opacity: 1 }
          }}
        >
          <DragIcon fontSize="small" />
        </Box>
      )}
      {cover != null && (
        <>
          <Box
            component="img"
            src={cover.src}
            alt=""
            aria-hidden
            data-testid="CanvasSectionCover"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              pointerEvents: 'none'
            }}
          />
          <Box
            data-testid="CanvasSectionOverlay"
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundColor: `rgba(0, 0, 0, ${overlayAlpha(styled?.backgroundOverlay)})`,
              pointerEvents: 'none'
            }}
          />
        </>
      )}
      {dropEdge != null && (
        <Box
          data-testid="CanvasDropIndicator"
          data-edge={dropEdge}
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 3,
            bgcolor: adminPrimary.main,
            top: dropEdge === 'before' ? 0 : 'auto',
            bottom: dropEdge === 'after' ? 0 : 'auto',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      )}
      {inSlot ? (
        body
      ) : (
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          {body}
        </Container>
      )}
    </Box>
  )
}
