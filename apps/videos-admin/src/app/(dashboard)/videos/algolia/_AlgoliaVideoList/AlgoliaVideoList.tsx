'use client'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
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
import { ReactElement, useMemo, useState } from 'react'
import {
  Configure,
  InstantSearch,
  useHits,
  useInstantSearch,
  useSearchBox
} from 'react-instantsearch'

import { PublishedChip } from '../../../../../components/PublishedChip'

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

function PublishedFilter({
  publishedCount,
  draftCount,
  selectedPublishedFilter,
  onPublishedFilterChange
}: {
  publishedCount: number
  draftCount: number
  selectedPublishedFilter: PublishedFilterValue
  onPublishedFilterChange: (value: PublishedFilterValue) => void
}): ReactElement {
  const handlePublishedChange = (event: SelectChangeEvent): void => {
    onPublishedFilterChange(event.target.value as PublishedFilterValue)
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

function AlgoliaInstantSearchResults(): ReactElement {
  const router = useRouter()
  const { query, refine } = useSearchBox()
  const { items } = useHits<AlgoliaVideoRecord>()
  const { status, error } = useInstantSearch()
  const [selectedPublishedFilter, setSelectedPublishedFilter] =
    useState<PublishedFilterValue>('both')

  const rows: GridRowsProp<AlgoliaRow> = items.map(mapAlgoliaHitToRow)
  const publishedCount = rows.filter((row) => row.published).length
  const draftCount = rows.length - publishedCount
  const filteredRows =
    selectedPublishedFilter === 'published'
      ? rows.filter((row) => row.published)
      : selectedPublishedFilter === 'draft'
        ? rows.filter((row) => !row.published)
        : rows

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
        <PublishedFilter
          publishedCount={publishedCount}
          draftCount={draftCount}
          selectedPublishedFilter={selectedPublishedFilter}
          onPublishedFilterChange={setSelectedPublishedFilter}
        />
      </Stack>
      {error != null && <Alert severity="error">{error.message}</Alert>}
      <Typography variant="caption" color="text.secondary">
        Showing up to {ALGOLIA_HITS_PER_PAGE} Algolia records. Some records may
        not map to an editable admin video detail page.
      </Typography>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <DataGrid
          rows={filteredRows}
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
    <InstantSearch searchClient={searchClient} indexName={indexName}>
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
