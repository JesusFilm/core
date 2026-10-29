import { useDraggable, useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { TFunction } from 'i18next'
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
  CAMPAIGN_PICTURE_RATIOS,
  CampaignRegionName,
  bandCssVariables,
  campaignImageSource,
  columnsGridTemplate,
  focalImageSx,
  isCampaignSection,
  isExtra,
  minHeightSx,
  overlayAlpha,
  resolveBand
} from '@core/journeys/ui/Campaign'
import type { CampaignTreeBlock } from '@core/journeys/ui/Campaign'
import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import Menu1Icon from '@core/shared/ui/icons/Menu1'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
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
  blockTranslations,
  isCampaignTextBlock
} from '../../../../libs/useCampaignBlockTextMutation'
import { AnalyticsEdit } from '../../AnalyticsEdit'
import { blockLabel } from '../../blockLabel'
import { regionLines, useCampaignEditor } from '../../CampaignEditorProvider'
import { JourneyListEdit } from '../../JourneyListEdit'
import { languageNames } from '../../LanguagesPanel'
import { RegionSwitcherEdit } from '../../RegionSwitcherEdit'
import { ShareSectionEdit } from '../../ShareSectionEdit'
import { campaignStringText } from '../../ShareSectionEdit/ShareSectionEdit'
import { regionDisplayName } from '../../utils/regionDisplayName'
import { regionLineColor } from '../../utils/regionLineColor'
import { previewFieldText } from '../../utils/useTranslatedField/readPreviewField'
import { CanvasCarousel } from '../CanvasCarousel'
import { CanvasColumnSlot } from '../CanvasColumnSlot'
import { CanvasDragHandle } from '../CanvasDragHandle'
import { CanvasMedia } from '../CanvasMedia'
import { EditorNote } from '../EditorNote'
import {
  ADMIN_PRIMARY,
  HOVER_OUTLINE_SX,
  SELECTED_OUTLINE
} from '../hoverOutline'
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
  /** Show the field's placeholder while it is empty, selected or not. */
  showEmpty?: boolean
}

function sectionFieldPlaceholder(
  t: TFunction,
  field: CampaignTextField
): string {
  switch (field) {
    case 'eyebrow':
      return t('Eyebrow')
    case 'title':
      return t('Title')
    case 'description':
      return t('Description')
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
  titleVariant,
  showEmpty = false
}: SectionTextProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const value = (block as unknown as Record<string, string | null>)[field]
  if (!editing && !showEmpty && (value == null || value.trim() === ''))
    return null
  const styles = {
    eyebrow: {
      variant: 'overline' as const,
      sx: { color: 'var(--campaign-band-eyebrow)' }
    },
    title: {
      variant: titleVariant,
      sx: { color: 'var(--campaign-band-heading)' }
    },
    description: {
      variant: 'body1' as const,
      sx: { color: 'var(--campaign-band-muted)' }
    },
    intro: {
      variant: 'body1' as const,
      sx: { color: 'var(--campaign-band-muted)' }
    },
    richTextContent: {
      variant: 'body1' as const,
      sx: {}
    },
    bullets: {
      variant: 'body1' as const,
      sx: { color: 'var(--campaign-band-text)' }
    }
  }[
    field as
      | 'eyebrow'
      | 'title'
      | 'description'
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

interface CanvasRegionHeadingProps {
  name: string
  lines: CampaignBlock[]
  previewLanguageId: string
  defaultLanguageId: string
}

/** The previewed region's name and Region Lines as the public Region Header sets them; read-only, the lines edit on the Region Switcher. */
function CanvasRegionHeading({
  name,
  lines,
  previewLanguageId,
  defaultLanguageId
}: CanvasRegionHeadingProps): ReactElement {
  return (
    <>
      <CampaignRegionName>{name}</CampaignRegionName>
      {lines.map((line) => {
        if (line.__typename !== 'CampaignTypographyBlock') return null
        const content = previewFieldText({
          field: line.content,
          translations: blockTranslations(line, 'content'),
          previewLanguageId,
          defaultLanguageId
        })
        if (content.trim() === '') return null
        const variant = line.typographyVariant ?? TypographyVariant.body1
        return (
          <Typography
            key={line.id}
            variant={variant}
            variantMapping={{ overline: 'p', caption: 'p' }}
            align={line.align ?? undefined}
            data-testid="CanvasRegionLine"
            sx={{
              color: regionLineColor(line.color, variant),
              whiteSpace: 'pre-line',
              wordBreak: 'break-word'
            }}
          >
            {content}
          </Typography>
        )
      })}
    </>
  )
}

/**
 * One section on the editor canvas: the band from the shared resolution
 * table, the Extras placed above, the section's typed text, then the
 * Extras placed below. The button and label wording a section reads
 * (its Campaign Strings) shows only in place and is edited in Settings. A hero
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
    currentRegion,
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
            <Box sx={{ width: '100%', overflow: 'hidden', borderRadius: 1 }}>
              <Box
                component="img"
                src={picture.src}
                alt={picture.alt ?? ''}
                data-testid="CanvasSectionImage"
                sx={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  aspectRatio: CAMPAIGN_PICTURE_RATIOS.wide,
                  objectFit: 'cover',
                  ...focalImageSx(picture)
                }}
              />
            </Box>
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
              <EditorNote>{t('Add a picture from Edit')}</EditorNote>
            </Box>
          ))}
        {block.__typename === 'CampaignRegionHeaderBlock' &&
          currentRegion != null && (
            <CanvasRegionHeading
              name={regionDisplayName(
                currentRegion,
                previewLanguageId,
                campaign.defaultLanguageId
              )}
              lines={regionLines(campaign.blocks, currentRegion.id)}
              previewLanguageId={previewLanguageId}
              defaultLanguageId={campaign.defaultLanguageId}
            />
          )}
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
              showEmpty={inSlot && block.__typename === 'CampaignRichTextBlock'}
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
          <CanvasMedia media={block.media} stacked={stacked} />
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
    previewLanguage == null ? '' : languageNames(previewLanguage).autonym

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

  /** The header row as the public `CampaignHeader` lays it out: the "All regions" chip while a region is edited, Brand Mark, the nav buttons on the right, the language box. The chip and the box are static: the canvas never leaves the region, and the box has no chevron since the Preview Language chip switches language. As on the public header, a blank `allRegions` leaves the chip empty. */
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
      {currentRegion != null && (
        <Chip
          label={campaignStringText(
            campaign,
            CampaignStringKey.allRegions,
            previewLanguageId,
            ''
          )}
          size="small"
          variant="outlined"
          icon={<ChevronLeftIcon />}
          data-testid="CanvasAllRegionsChip"
          sx={{
            color: 'var(--campaign-band-text)',
            borderColor: 'var(--campaign-band-accent)',
            '& .MuiChip-label': { whiteSpace: 'pre-line' },
            '& .MuiChip-icon': { color: 'var(--campaign-band-accent)' }
          }}
        />
      )}
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
            borderTop: '1px solid var(--campaign-band-border)',
            // Pinned to the frame's bottom edge on a short page, as on the public page.
            mt: 'auto'
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
        ...(block.__typename === 'CampaignHeroBlock'
          ? minHeightSx(block.minHeight, inSlot)
          : {}),
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
        <CanvasDragHandle
          activatorRef={setActivatorNodeRef}
          listeners={listeners}
          attributes={attributes}
          label={t('Drag section')}
          testId={`CanvasSectionDragHandle-${block.id}`}
          dragging={isDragging}
          visible={sectionSelected}
          position={{ top: '50%', left: 8, transform: 'translateY(-50%)' }}
        />
      )}
      {cover != null && (
        <>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              borderRadius: 'inherit',
              pointerEvents: 'none'
            }}
          >
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
                ...focalImageSx(cover)
              }}
            />
          </Box>
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
            bgcolor: ADMIN_PRIMARY.main,
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
