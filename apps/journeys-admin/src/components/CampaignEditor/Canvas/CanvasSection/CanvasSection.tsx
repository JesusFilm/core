import { useDraggable, useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement, useCallback, useMemo, useState } from 'react'

import {
  CAMPAIGN_HEADER_HEIGHT,
  bandCssVariables,
  columnsGridTemplate,
  isCampaignSection,
  isExtra,
  minHeightSx,
  resolveBand
} from '@core/journeys/ui/Campaign'

import {
  CampaignBackgroundKind,
  CampaignChildPlacement,
  CampaignFeaturedMediaLayout,
  CampaignMediaSide
} from '../../../../../__generated__/globalTypes'
import {
  CAMPAIGN_TEXT_FIELDS,
  CampaignTextField,
  isCampaignTextBlock
} from '../../../../libs/useCampaignBlockTextMutation'
import { AnalyticsEdit } from '../../AnalyticsEdit'
import { regionLines, useCampaignEditor } from '../../CampaignEditorProvider'
import { JourneyListEdit } from '../../JourneyListEdit'
import { RegionSwitcherEdit } from '../../RegionSwitcherEdit'
import { ShareSectionEdit } from '../../ShareSectionEdit'
import { blockLabel } from '../../utils/blockLabel'
import { regionDisplayName } from '../../utils/regionDisplayName'
import type { CanvasBlock } from '../canvasBlock'
import { CanvasCarousel } from '../CanvasCarousel'
import { CanvasColumnSlot } from '../CanvasColumnSlot'
import { CanvasCover } from '../CanvasCover'
import { CanvasDragHandle } from '../CanvasDragHandle'
import { CanvasExtra } from '../CanvasExtra'
import { CanvasFooter, footerRows } from '../CanvasFooter'
import { CanvasHeader } from '../CanvasHeader'
import { CanvasMedia } from '../CanvasMedia'
import { CanvasPicture } from '../CanvasPicture'
import { CanvasRegionHeading } from '../CanvasRegionHeading'
import {
  ADMIN_PRIMARY,
  HOVER_OUTLINE_SX,
  SELECTED_OUTLINE
} from '../hoverOutline'
import { SectionText } from '../SectionText'
import { SelectionBadge } from '../SelectionBadge'

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
        {block.__typename === 'CampaignImageBlock' && (
          <CanvasPicture block={block} />
        )}
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
              <CanvasColumnSlot key={slot.id} slot={slot}>
                {slot.children[0] != null && (
                  <CanvasSection block={slot.children[0]} inSlot />
                )}
              </CanvasColumnSlot>
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
  const footer = footerRows(block)
  const footerEmpty = footer.lines.length === 0 && footer.links.length === 0

  let body: ReactElement | null = sectionBody
  if (chrome === 'header')
    body = (
      <CanvasHeader
        block={block}
        selected={sectionSelected}
        renderExtra={renderExtra}
      />
    )
  else if (chrome === 'footer')
    body = <CanvasFooter block={block} renderExtra={renderExtra} />

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
            minHeight: footerEmpty ? 16 : undefined,
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
      <CanvasCover block={block} />
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
