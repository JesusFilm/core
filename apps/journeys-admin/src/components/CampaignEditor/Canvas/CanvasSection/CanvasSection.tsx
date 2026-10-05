import { useDraggable, useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { SimplePaletteColorOptions } from '@mui/material/styles'
import { useTranslation } from 'next-i18next/pages'
import {
  MouseEvent,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import { bandCssVariables, resolveBand } from '@core/journeys/ui/Campaign'
import type { CampaignTreeBlock } from '@core/journeys/ui/Campaign'
import DragIcon from '@core/shared/ui/icons/Drag'
import { adminTheme } from '@core/shared/ui/themes/journeysAdmin/theme'

import {
  GetCampaign_campaign_blocks as CampaignBlock,
  GetCampaign_campaign_theme as CampaignTheme
} from '../../../../../__generated__/GetCampaign'
import {
  CampaignChildPlacement,
  TypographyVariant
} from '../../../../../__generated__/globalTypes'
import {
  CAMPAIGN_TEXT_FIELDS,
  CampaignTextBlock,
  CampaignTextField,
  isCampaignTextBlock,
  primaryTextField
} from '../../../../libs/useCampaignBlockTextMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { RegionSwitcherEdit } from '../../RegionSwitcherEdit'
import { InlineText } from '../InlineText'

export type CanvasBlock = CampaignTreeBlock<CampaignBlock>

interface CanvasSectionProps {
  block: CanvasBlock
  theme: CampaignTheme
  /** A page section moves by its drag handle; chrome never does. */
  draggable?: boolean
  /** The drop indicator to show while another section is dragged over this one. */
  dropEdge?: 'before' | 'after'
}

const adminPrimary = adminTheme.palette.primary as SimplePaletteColorOptions

const SELECTED_OUTLINE = {
  outline: `2px solid ${adminPrimary.main}`,
  outlineOffset: -2
}

function isAbove(child: CanvasBlock): boolean {
  return (
    (child.__typename === 'CampaignTypographyBlock' ||
      child.__typename === 'CampaignButtonBlock') &&
    child.placement === CampaignChildPlacement.above
  )
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
          data-testid={`CanvasExtra-${block.id}`}
          onClick={handleClick}
          sx={{
            width: '100%',
            cursor: 'pointer',
            ...(selected ? SELECTED_OUTLINE : {})
          }}
        >
          <InlineText
            block={block}
            field="content"
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
          data-testid={`CanvasExtra-${block.id}`}
          onClick={handleClick}
          sx={{
            display: 'flex',
            cursor: 'pointer',
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
          <Button
            component="div"
            variant={buttonVariant}
            size={block.size ?? 'medium'}
            data-testid="CanvasButton"
            tabIndex={-1}
            sx={{
              bgcolor:
                buttonVariant === 'contained'
                  ? (block.color ?? 'var(--campaign-band-button)')
                  : undefined,
              color:
                buttonVariant === 'contained'
                  ? (block.labelColor ?? 'var(--campaign-band-button-label)')
                  : (block.color ?? 'var(--campaign-band-button)'),
              borderColor: block.color ?? 'var(--campaign-band-button)'
            }}
          >
            <InlineText
              block={block}
              field="label"
              placeholder={t('Button')}
              editing={selected}
              autoFocus={selected && focusField === 'label'}
              onSelect={onSelect}
              variant="inherit"
              component="span"
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
    }
  }[field as 'eyebrow' | 'title' | 'lede' | 'intro']

  return (
    <InlineText
      block={block}
      field={field}
      placeholder={sectionFieldPlaceholder(t, field)}
      editing={editing}
      autoFocus={editing && focusField === field}
      onSelect={onSelect}
      variant={styles.variant}
      sx={styles.sx}
    />
  )
}

/**
 * One section on the editor canvas: the band from the shared resolution
 * table, the Extras placed above, the section's typed text, then the Extras
 * placed below. Clicking anywhere selects the section; clicking an Extra
 * selects it. The selected block's text fields become inline inputs.
 */
export function CanvasSection({
  block,
  theme,
  draggable = false,
  dropEdge
}: CanvasSectionProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    selection,
    selectBlock,
    state: { editRequest }
  } = useCampaignEditor()
  const [focusField, setFocusField] = useState<CampaignTextField>()
  const seenEditRequest = useRef(editRequest)
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
    if (
      block.__typename === 'CampaignTypographyBlock' ||
      block.__typename === 'CampaignButtonBlock'
    )
      return null
    return resolveBand(block, theme)
  }, [block, theme])

  useEffect(() => {
    if (editRequest === seenEditRequest.current) return
    seenEditRequest.current = editRequest
    const target = selection.block
    if (target == null || !isCampaignTextBlock(target)) return
    const inSection =
      target.id === block.id || target.parentBlockId === block.id
    if (!inSection) return
    setFocusField(primaryTextField(target.__typename))
  }, [editRequest, selection.block, block.id])

  if (band == null) return null

  const align = 'align' in block ? block.align : null
  const titleVariant = block.__typename === 'CampaignHeroBlock' ? 'h1' : 'h2'
  const above = block.children.filter(isAbove)
  const below = block.children.filter((child) => !isAbove(child))
  const alignItems =
    align === 'center'
      ? 'center'
      : align === 'right'
        ? 'flex-end'
        : 'flex-start'
  const textFields: readonly CampaignTextField[] = isCampaignTextBlock(block)
    ? CAMPAIGN_TEXT_FIELDS[block.__typename]
    : []

  function handleSelectField(field: CampaignTextField): void {
    setFocusField(field)
    selectBlock(block.id)
  }

  function selectExtra(child: CanvasBlock, field: CampaignTextField): void {
    setFocusField(field)
    selectBlock(child.id)
  }

  function renderExtra(child: CanvasBlock): ReactElement | null {
    const field: CampaignTextField =
      child.__typename === 'CampaignButtonBlock' ? 'label' : 'content'
    return (
      <CanvasExtra
        key={child.id}
        block={child}
        selected={selectedId === child.id}
        onSelect={() => selectExtra(child, field)}
        focusField={focusField}
      />
    )
  }

  return (
    <Box
      ref={setSectionRef}
      component="section"
      id={block.id}
      data-testid={`CanvasSection-${block.id}`}
      data-selected={sectionSelected}
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
        py: { xs: 6, md: 10 },
        cursor: 'pointer',
        opacity: isDragging ? 0.6 : 1,
        ...(sectionSelected ? SELECTED_OUTLINE : {})
      }}
    >
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
      <Container maxWidth="lg">
        <Stack spacing={3} sx={{ alignItems }}>
          {above.map(renderExtra)}
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
          {block.__typename === 'CampaignRegionSwitcherBlock' && (
            <RegionSwitcherEdit block={block} />
          )}
          {below.map(renderExtra)}
        </Stack>
      </Container>
    </Box>
  )
}
