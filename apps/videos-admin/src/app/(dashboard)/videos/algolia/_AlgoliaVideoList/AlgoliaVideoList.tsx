'use client'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowParams,
  GridRowsProp
} from '@mui/x-data-grid'
import { algoliasearch } from 'algoliasearch'
import { useRouter } from 'next/navigation'
import { ReactElement, useMemo } from 'react'
import {
  Configure,
  InstantSearch,
  useHits,
  useInstantSearch,
  useMenu,
  useRefinementList,
  useSearchBox
} from 'react-instantsearch'

import { PublishedChip } from '../../../../../components/PublishedChip'
import { videoLabels } from '../../../../../constants'

interface AlgoliaVideoRecord {
  objectID: string
  mediaComponentId?: string
  subType?: string
  published?: boolean
  containsCount?: number
  title?: string
  description?: string
  titles?: Array<{ value?: string; languageId?: string; bcp47?: string }>
  descriptions?: Array<{ value?: string; languageId?: string; bcp47?: string }>
}

interface AlgoliaRow {
  id: string
  displayId: string
  mediaComponentId: string | null
  title: string
  description: string
  subType: string
  containsCount: number
  published: boolean
}

type PublishedFilterValue = 'both' | 'published' | 'draft'

const ALGOLIA_HITS_PER_PAGE = 1000

function getAlgoliaSearchClient() {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? ''
  const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ?? ''
  if (appId === '' || apiKey === '') {
    return null
  }

  return algoliasearch(appId, apiKey)
}

function getPrimaryText(
  values: Array<{ value?: string; languageId?: string; bcp47?: string }> = []
): string {
  const englishValue = values.find(
    ({ languageId, bcp47 }) => languageId === '529' || bcp47 === 'en'
  )?.value

  if (englishValue != null && englishValue !== '') {
    return englishValue
  }

  return values.find(({ value }) => value != null && value !== '')?.value ?? ''
}

function mapAlgoliaHitToRow(hit: AlgoliaVideoRecord): AlgoliaRow {
  const mediaComponentId =
    hit.mediaComponentId != null && hit.mediaComponentId !== ''
      ? hit.mediaComponentId
      : null

  return {
    id: hit.objectID,
    displayId: mediaComponentId ?? hit.objectID,
    mediaComponentId,
    title: getPrimaryText(hit.titles) || hit.title || '',
    description: getPrimaryText(hit.descriptions) || hit.description || '',
    subType: hit.subType ?? '',
    containsCount: hit.containsCount ?? 0,
    published: hit.published === true
  }
}

const videoLabelDisplayNames = new Map(
  videoLabels.map(({ label, value }) => [value, label])
)

const videoLabelOrder = videoLabels.map(({ value }) => value)

function getVideoLabelDisplayName(value: string): string {
  return videoLabelDisplayNames.get(value) ?? value
}

/**
 * Published state as an Algolia facet rather than a filter over the fetched
 * page, so the counts describe the whole index instead of the current hits.
 */
function PublishedFilter(): ReactElement | null {
  const { items, refine } = useMenu({ attribute: 'published' })

  if (items.length === 0) return null

  const publishedCount = items.find(({ label }) => label === 'true')?.count ?? 0
  const draftCount = items.find(({ label }) => label === 'false')?.count ?? 0
  const refinedItem = items.find(({ isRefined }) => isRefined)
  const selectedPublishedFilter: PublishedFilterValue =
    refinedItem == null
      ? 'both'
      : refinedItem.label === 'true'
        ? 'published'
        : 'draft'

  const handlePublishedChange = (event: SelectChangeEvent): void => {
    const nextValue = event.target.value as PublishedFilterValue

    if (nextValue === 'both') {
      if (refinedItem != null) refine(refinedItem.value)
      return
    }

    refine(nextValue === 'published' ? 'true' : 'false')
  }

  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel id="published-filter-label">Published</InputLabel>
      <Select
        labelId="published-filter-label"
        label="Published"
        value={selectedPublishedFilter}
        onChange={handlePublishedChange}
      >
        <MenuItem value="both">Both ({publishedCount + draftCount})</MenuItem>
        <MenuItem value="published">Published ({publishedCount})</MenuItem>
        <MenuItem value="draft">Draft ({draftCount})</MenuItem>
      </Select>
    </FormControl>
  )
}

/**
 * Multi-select label facet. Renders nothing when the index exposes no
 * `subType` facet values, so the control is absent rather than empty when
 * faceting has not been configured on the index.
 */
function LabelFilter(): ReactElement | null {
  const { items, refine } = useRefinementList({
    attribute: 'subType',
    limit: videoLabels.length
  })

  if (items.length === 0) return null

  const sortedItems = [...items].sort(
    (a, b) =>
      videoLabelOrder.indexOf(a.value) - videoLabelOrder.indexOf(b.value)
  )
  const selectedValues = items
    .filter(({ isRefined }) => isRefined)
    .map(({ value }) => value)

  const handleLabelChange = (event: SelectChangeEvent<string[]>): void => {
    const { value } = event.target
    const nextValues = typeof value === 'string' ? value.split(',') : value

    const toggled = [
      ...nextValues.filter((next) => !selectedValues.includes(next)),
      ...selectedValues.filter((current) => !nextValues.includes(current))
    ]

    toggled.forEach((item) => refine(item))
  }

  return (
    <FormControl size="small" sx={{ minWidth: 220 }}>
      <InputLabel id="label-filter-label">Label</InputLabel>
      <Select<string[]>
        multiple
        labelId="label-filter-label"
        label="Label"
        value={selectedValues}
        onChange={handleLabelChange}
        renderValue={(selected) =>
          selected.map(getVideoLabelDisplayName).join(', ')
        }
      >
        {sortedItems.map(({ value, count, isRefined }) => (
          <MenuItem key={value} value={value}>
            <Checkbox checked={isRefined} />
            <ListItemText
              primary={`${getVideoLabelDisplayName(value)} (${count})`}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

function AlgoliaInstantSearchResults(): ReactElement {
  const router = useRouter()
  const { query, refine } = useSearchBox()
  const { items } = useHits<AlgoliaVideoRecord>()
  const { status, error } = useInstantSearch()

  const rows: GridRowsProp<AlgoliaRow> = items.map(mapAlgoliaHitToRow)

  const handleRowClick = (params: GridRowParams<AlgoliaRow>): void => {
    const selectedMediaComponentId = params.row.mediaComponentId
    if (selectedMediaComponentId == null) return

    router.push(`/videos/${selectedMediaComponentId}`)
  }

  const columns: GridColDef[] = [
    { field: 'displayId', headerName: 'ID', minWidth: 220 },
    { field: 'title', headerName: 'Title', minWidth: 220, flex: 1 },
    {
      field: 'published',
      headerName: 'Published',
      minWidth: 130,
      renderCell: (params: GridRenderCellParams<AlgoliaRow, boolean>) => (
        <PublishedChip published={params.value === true} />
      )
    },
    {
      field: 'description',
      headerName: 'Description',
      minWidth: 280,
      flex: 1,
      renderCell: ({ value }) => <Typography noWrap>{value}</Typography>
    },
    { field: 'subType', headerName: 'Sub Type', minWidth: 140 },
    { field: 'containsCount', headerName: 'Contains', minWidth: 100 }
  ]

  return (
    <Stack
      sx={{
        width: '100%',
        height: 'calc(100vh - 210px)',
        minHeight: 400,
        overflow: 'hidden'
      }}
      gap={2}
    >
      <Typography variant="h4">Algolia Video Library</Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          label="Search Algolia"
          value={query}
          onChange={(event) => refine(event.target.value)}
          size="small"
          placeholder="Search by ID, title, or description"
          sx={{ flexGrow: 1 }}
        />
        <LabelFilter />
        <PublishedFilter />
      </Stack>
      {error != null && <Alert severity="error">{error.message}</Alert>}
      <Typography variant="caption" color="text.secondary">
        Showing up to {ALGOLIA_HITS_PER_PAGE} Algolia records. Some records may
        not map to an editable admin video detail page.
      </Typography>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={status === 'loading' || status === 'stalled'}
          onRowClick={handleRowClick}
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 50 }
            }
          }}
          pageSizeOptions={[25, 50, 100]}
          getRowClassName={(params) =>
            params.row.mediaComponentId == null ? 'row--disabled' : ''
          }
          sx={{
            '& .MuiDataGrid-row': {
              cursor: 'pointer'
            },
            '& .row--disabled': {
              cursor: 'default',
              color: 'text.disabled'
            }
          }}
        />
      </Box>
    </Stack>
  )
}

export function AlgoliaVideoList(): ReactElement {
  const searchClient = useMemo(() => getAlgoliaSearchClient(), [])
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_VIDEOS ?? ''

  if (searchClient == null) {
    return (
      <Stack sx={{ width: '100%' }} gap={2}>
        <Typography variant="h4">Algolia Video Library</Typography>
        <Typography color="warning.main">
          Set NEXT_PUBLIC_ALGOLIA_APP_ID and NEXT_PUBLIC_ALGOLIA_API_KEY to use
          this tab.
        </Typography>
      </Stack>
    )
  }

  if (indexName === '') {
    return (
      <Stack sx={{ width: '100%' }} gap={2}>
        <Typography variant="h4">Algolia Video Library</Typography>
        <Typography color="warning.main">
          Set NEXT_PUBLIC_ALGOLIA_INDEX_VIDEOS to use this tab.
        </Typography>
      </Stack>
    )
  }

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={indexName}
      routing={true}
    >
      <Configure
        hitsPerPage={ALGOLIA_HITS_PER_PAGE}
        attributesToRetrieve={[
          'objectID',
          'mediaComponentId',
          'subType',
          'containsCount',
          'published',
          'title',
          'description',
          'titles',
          'descriptions'
        ]}
      />
      <AlgoliaInstantSearchResults />
    </InstantSearch>
  )
}
