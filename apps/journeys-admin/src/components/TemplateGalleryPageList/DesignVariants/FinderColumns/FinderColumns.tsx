import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import AddIcon from '@mui/icons-material/Add'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import FolderIcon from '@mui/icons-material/Folder'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next/pages'
import {
  KeyboardEvent,
  ReactElement,
  useCallback,
  useEffect,
  useState
} from 'react'

import { TemplateGalleryPageStatus } from '../../../../../__generated__/globalTypes'
import logoGray from '../../../../../public/logo-grayscale.svg'
import { JourneyCardMenu } from '../../../JourneyList/JourneyCard/JourneyCardMenu'
import { LabelChip } from '../../../LabelChip'
import { encodeDropZoneId } from '../../Droppables'
import type {
  CollectionViewProps,
  Journey,
  TemplateGalleryPage
} from '../types'

const COLUMN_ONE_WIDTH = 240
const COLUMN_TWO_WIDTH = 280
const COLUMN_THREE_MIN_WIDTH = 280

/**
 * "Finder Columns" design variant for the NES-1695 collection gallery
 * design lab. Presents the templates panel as a three-column desktop
 * layout modelled on macOS Finder's column view: a collections list in
 * column 1, the selected collection's templates in column 2, and a
 * detail panel for the selected template in column 3.
 *
 * Column 1 rows (collections + the pinned "All Templates" row) double
 * as `useDroppable` drop targets — drag a template from column 2 onto a
 * row to reassign it. Published collections show a grey-dashed border
 * and a blocked-drop tooltip when dragged-over, mirroring `CollectionChip`.
 * Column 2 lazily participates in the parent's `DndContext` via a
 * `SortableContext` so each row is both draggable AND a within-column
 * sort target — the same primitives `DraggableJourneysGrid` uses.
 *
 * Selection is split: the active collection lives in the parent
 * (`selectedCollectionId`), while the active template is local state —
 * picking a collection resets it.
 */
export function FinderColumns({
  collections,
  allTemplatesCount,
  selectedCollectionId,
  onSelectCollection,
  dropDisabled,
  filteredJourneys,
  selectedCollection,
  dragInFlight,
  busyId
}: CollectionViewProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  )

  // Resetting the template selection when the active collection changes
  // mirrors Finder's column view: the right-hand detail snaps back to
  // the first row of the new column (or empty when the new column is).
  useEffect(() => {
    setSelectedTemplateId(filteredJourneys[0]?.id ?? null)
  }, [selectedCollectionId, filteredJourneys])

  const selectedTemplate: Journey | null =
    filteredJourneys.find((journey) => journey.id === selectedTemplateId) ??
    null

  const handleSelectAll = useCallback(() => {
    onSelectCollection(null)
  }, [onSelectCollection])

  return (
    <Box
      data-testid="FinderColumns"
      sx={{
        display: { xs: 'none', md: 'flex' },
        alignItems: 'stretch',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        minHeight: 480,
        bgcolor: 'background.paper'
      }}
    >
      <Box
        sx={{
          width: COLUMN_ONE_WIDTH,
          flexShrink: 0,
          borderRight: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <CollectionsColumnHeader />
        <Stack sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
          <AllTemplatesRow
            count={allTemplatesCount}
            selected={selectedCollectionId == null}
            dropDisabled={dropDisabled}
            onSelect={handleSelectAll}
          />
          {collections.map((collection) => (
            <CollectionRow
              key={collection.id}
              collection={collection}
              selected={collection.id === selectedCollectionId}
              dropDisabled={dropDisabled || busyId === collection.id}
              onSelect={onSelectCollection}
            />
          ))}
        </Stack>
      </Box>

      <Box
        sx={{
          width: COLUMN_TWO_WIDTH,
          flexShrink: 0,
          borderRight: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <ColumnHeader title={selectedCollection?.title ?? t('All Templates')} />
        <TemplatesColumn
          journeys={filteredJourneys}
          dragInFlight={dragInFlight}
          dropDisabled={dropDisabled}
          selectedTemplateId={selectedTemplateId}
          onSelectTemplate={setSelectedTemplateId}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: COLUMN_THREE_MIN_WIDTH,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <ColumnHeader title={t('Preview')} />
        <DetailColumn journey={selectedTemplate} />
      </Box>
    </Box>
  )
}

function CollectionsColumnHeader(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        px: 2,
        py: 1.5,
        borderBottom: 1,
        borderColor: 'divider',
        flexShrink: 0
      }}
    >
      <Typography variant="overline" color="text.secondary">
        {t('Collections')}
      </Typography>
      <Tooltip title={t('New collection')} placement="top" arrow>
        <span>
          <IconButton
            size="small"
            aria-label={t('New collection')}
            data-testid="FinderColumnsNewCollectionButton"
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  )
}

interface ColumnHeaderProps {
  title: string
}

function ColumnHeader({ title }: ColumnHeaderProps): ReactElement {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderBottom: 1,
        borderColor: 'divider',
        flexShrink: 0
      }}
    >
      <Typography
        variant="overline"
        color="text.secondary"
        noWrap
        sx={{ display: 'block' }}
      >
        {title}
      </Typography>
    </Box>
  )
}

interface AllTemplatesRowProps {
  count: number
  selected: boolean
  dropDisabled: boolean
  onSelect: () => void
}

function AllTemplatesRow({
  count,
  selected,
  dropDisabled,
  onSelect
}: AllTemplatesRowProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { setNodeRef, isOver } = useDroppable({
    id: encodeDropZoneId({ kind: 'unsectioned' }),
    disabled: dropDisabled
  })
  const active = selected || isOver

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect()
    }
  }

  return (
    <Box
      ref={setNodeRef}
      data-testid="FinderColumnsAllTemplatesRow"
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={t('All Templates')}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      sx={{
        mx: 1,
        my: 0.25,
        px: 1.5,
        py: 1,
        borderRadius: 1,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: active ? 'primary.main' : 'transparent',
        color: active ? 'primary.contrastText' : 'text.primary',
        outline: isOver ? '2px solid' : 'none',
        outlineColor: 'primary.dark',
        outlineOffset: -2,
        '&:hover': {
          bgcolor: active ? 'primary.main' : 'action.hover'
        },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: -2
        }
      }}
    >
      {selected ? (
        <FolderOpenIcon fontSize="small" />
      ) : (
        <FolderIcon fontSize="small" />
      )}
      <Typography
        variant="body2"
        sx={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontWeight: 600
        }}
      >
        {t('All Templates')}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: active ? 'primary.contrastText' : 'text.secondary',
          flexShrink: 0
        }}
      >
        {count}
      </Typography>
      {selected && <ChevronRightIcon fontSize="small" />}
    </Box>
  )
}

interface CollectionRowProps {
  collection: TemplateGalleryPage
  selected: boolean
  dropDisabled: boolean
  onSelect: (id: string) => void
}

function CollectionRow({
  collection,
  selected,
  dropDisabled,
  onSelect
}: CollectionRowProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const isPublished = collection.status === TemplateGalleryPageStatus.published
  const { setNodeRef, isOver } = useDroppable({
    id: encodeDropZoneId({ kind: 'collection', id: collection.id }),
    disabled: dropDisabled
  })
  const dropBlocked = isOver && isPublished
  const active = selected || (isOver && !isPublished)
  const count = collection.templates.length

  function handleClick(): void {
    onSelect(collection.id)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(collection.id)
    }
  }

  return (
    <Tooltip
      title={t("Templates can't be moved into live collections")}
      open={dropBlocked}
      placement="top"
      arrow
      disableHoverListener
      disableFocusListener
      disableTouchListener
    >
      <Box
        ref={setNodeRef}
        data-testid={`FinderColumnsCollectionRow-${collection.id}`}
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        aria-label={collection.title}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        sx={{
          mx: 1,
          my: 0.25,
          px: 1.5,
          py: 1,
          borderRadius: 1,
          cursor: dropBlocked ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          // Drop-blocked: dashed grey ring to mirror CollectionChip. Active /
          // hovered (valid drop): tinted background.
          border: 1,
          borderStyle: dropBlocked ? 'dashed' : 'solid',
          borderColor: dropBlocked ? 'text.disabled' : 'transparent',
          bgcolor: active ? 'primary.main' : 'transparent',
          color: active ? 'primary.contrastText' : 'text.primary',
          outline: isOver && !isPublished ? '2px solid' : 'none',
          outlineColor: 'primary.dark',
          outlineOffset: -2,
          '&:hover': {
            bgcolor: active ? 'primary.main' : 'action.hover'
          },
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: -2
          }
        }}
      >
        {selected ? (
          <FolderOpenIcon fontSize="small" />
        ) : (
          <FolderIcon fontSize="small" />
        )}
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {collection.title}
        </Typography>
        {isPublished && (
          <LabelChip
            label={t('Live')}
            color="success"
            sx={{ height: 18, fontSize: 10, px: 1 }}
          />
        )}
        <Typography
          variant="caption"
          sx={{
            color: active ? 'primary.contrastText' : 'text.secondary',
            flexShrink: 0
          }}
        >
          {count}
        </Typography>
        {selected && <ChevronRightIcon fontSize="small" />}
      </Box>
    </Tooltip>
  )
}

interface TemplatesColumnProps {
  journeys: readonly Journey[]
  dragInFlight: boolean
  dropDisabled: boolean
  selectedTemplateId: string | null
  onSelectTemplate: (id: string) => void
}

function TemplatesColumn({
  journeys,
  dragInFlight,
  dropDisabled,
  selectedTemplateId,
  onSelectTemplate
}: TemplatesColumnProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  if (journeys.length === 0) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          py: 4
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ maxWidth: 220 }}
        >
          {t('No templates yet — drag templates here to add them.')}
        </Typography>
      </Box>
    )
  }

  const ids = journeys.map((journey) => journey.id)

  return (
    <Box
      data-testid="FinderColumnsTemplatesColumn"
      sx={{ flex: 1, overflowY: 'auto', py: 1 }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <Stack spacing={0.25}>
          {journeys.map((journey) => (
            <TemplateColumnRow
              key={journey.id}
              journey={journey}
              selected={journey.id === selectedTemplateId}
              disabled={dropDisabled || dragInFlight}
              onSelect={onSelectTemplate}
            />
          ))}
        </Stack>
      </SortableContext>
    </Box>
  )
}

interface TemplateColumnRowProps {
  journey: Journey
  selected: boolean
  disabled: boolean
  onSelect: (id: string) => void
}

function TemplateColumnRow({
  journey,
  selected,
  disabled,
  onSelect
}: TemplateColumnRowProps): ReactElement {
  // Inline `useSortable` (matching `DraggableJourney`) so each row is both
  // draggable AND a within-column sort target — we can't reuse
  // `DraggableJourney` directly because it always renders a `JourneyCard`,
  // and the Finder column needs the compact row layout below.
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({ id: journey.id, disabled })
  const style =
    transform != null
      ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
      : undefined

  function handleClick(): void {
    onSelect(journey.id)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(journey.id)
    }
  }

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      data-testid={`FinderColumnsTemplateRow-${journey.id}`}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={journey.title}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      sx={{
        mx: 1,
        borderRadius: 1,
        opacity: isDragging ? 0.4 : 1,
        touchAction: 'manipulation',
        cursor: disabled ? 'default' : isDragging ? 'grabbing' : 'grab',
        bgcolor: selected ? 'action.selected' : 'transparent',
        '&:hover': {
          bgcolor: selected ? 'action.selected' : 'action.hover'
        },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: -2
        }
      }}
    >
      <TemplateRowContent journey={journey} />
    </Box>
  )
}

interface TemplateRowContentProps {
  journey: Journey
}

function TemplateRowContent({
  journey
}: TemplateRowContentProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const thumbSrc = journey.primaryImageBlock?.src ?? null

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ px: 1, py: 0.75 }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 48,
          height: 36,
          flexShrink: 0,
          borderRadius: 0.5,
          overflow: 'hidden',
          bgcolor: 'grey.200'
        }}
      >
        {thumbSrc != null ? (
          <Image
            src={thumbSrc}
            alt={journey.primaryImageBlock?.alt ?? ''}
            fill
            sizes="48px"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <Image
            src={logoGray}
            alt={t('No Image')}
            width={20}
            height={20}
            style={{
              objectFit: 'contain',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
      </Box>
      <Typography
        variant="body2"
        sx={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {journey.title}
      </Typography>
      <Box
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        sx={{ flexShrink: 0 }}
      >
        <JourneyCardMenu
          id={journey.id}
          status={journey.status}
          slug={journey.slug}
          published={journey.publishedAt != null}
          journey={journey}
          template={journey.template ?? false}
          variant="plain"
        />
      </Box>
    </Stack>
  )
}

interface DetailColumnProps {
  journey: Journey | null
}

function DetailColumn({ journey }: DetailColumnProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  if (journey == null) {
    return (
      <Box
        data-testid="FinderColumnsDetailEmpty"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          py: 4
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ maxWidth: 260 }}
        >
          {t('Select a template to preview.')}
        </Typography>
      </Box>
    )
  }

  const thumbSrc = journey.primaryImageBlock?.src ?? null
  const languageName = journey.language?.name?.[0]?.value ?? null

  return (
    <Stack
      data-testid="FinderColumnsDetail"
      spacing={2}
      sx={{ flex: 1, overflowY: 'auto', p: 3 }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'grey.200'
        }}
      >
        {thumbSrc != null ? (
          <Image
            src={thumbSrc}
            alt={journey.primaryImageBlock?.alt ?? ''}
            fill
            sizes="(max-width: 1200px) 40vw, 480px"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <Image
            src={logoGray}
            alt={t('No Image')}
            width={64}
            height={64}
            style={{
              objectFit: 'contain',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
      </Box>
      <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>
        {journey.title}
      </Typography>
      <Stack spacing={0.5}>
        {languageName != null && (
          <Typography variant="body2" color="text.secondary">
            {t('Language: {{name}}', { name: languageName })}
          </Typography>
        )}
      </Stack>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          component={NextLink}
          prefetch={false}
          href={`/journeys/${journey.id}`}
          data-testid="FinderColumnsOpenInEditor"
        >
          {t('Open in editor')}
        </Button>
        <Button
          variant="outlined"
          component={NextLink}
          prefetch={false}
          href={`/preview/${journey.slug}`}
          data-testid="FinderColumnsPreview"
        >
          {t('Preview')}
        </Button>
      </Stack>
    </Stack>
  )
}
