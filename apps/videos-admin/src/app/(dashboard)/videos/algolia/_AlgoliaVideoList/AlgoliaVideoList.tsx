'use client'

import { algoliasearch } from 'algoliasearch'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DataGrid, GridColDef, GridRowParams, GridRowsProp } from '@mui/x-data-grid'
import { useRouter } from 'next/navigation'
import { ReactElement, useMemo } from 'react'
import {
  Configure,
  InstantSearch,
  useHits,
  useInstantSearch,
  usePagination,
  useSearchBox
} from 'react-instantsearch'

interface AlgoliaVideoRecord {
  objectID: string
  mediaComponentId?: string
  componentType?: string
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
  mediaComponentId: string
  title: string
  description: string
  componentType: string
  subType: string
  containsCount: number
  published: string
}

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

function AlgoliaInstantSearchResults(): ReactElement {
  const router = useRouter()
  const { query, refine } = useSearchBox()
  const { items } = useHits<AlgoliaVideoRecord>()
  const { status, results, error } = useInstantSearch()
  const { currentRefinement, nbPages, refine: refinePage } = usePagination()

  const rows: GridRowsProp<AlgoliaRow> = items.map((hit) => ({
    id: hit.objectID,
    mediaComponentId: hit.mediaComponentId ?? hit.objectID,
    title: getPrimaryText(hit.titles) || hit.title || '',
    description: getPrimaryText(hit.descriptions) || hit.description || '',
    componentType: hit.componentType ?? '',
    subType: hit.subType ?? '',
    containsCount: hit.containsCount ?? 0,
    published: hit.published === true ? 'Yes' : 'No'
  }))

  const handleRowClick = (params: GridRowParams<AlgoliaRow>): void => {
    const selectedMediaComponentId = params.row.mediaComponentId
    if (selectedMediaComponentId == null || selectedMediaComponentId === '') return

    router.push(`/videos/${selectedMediaComponentId}`)
  }

  const columns: GridColDef[] = [
    { field: 'mediaComponentId', headerName: 'Media Component ID', minWidth: 220 },
    { field: 'title', headerName: 'Title', minWidth: 220, flex: 1 },
    {
      field: 'description',
      headerName: 'Description',
      minWidth: 280,
      flex: 1,
      renderCell: ({ value }) => <Typography noWrap>{value}</Typography>
    },
    { field: 'componentType', headerName: 'Component Type', minWidth: 140 },
    { field: 'subType', headerName: 'Sub Type', minWidth: 140 },
    { field: 'containsCount', headerName: 'Contains', minWidth: 100 },
    { field: 'published', headerName: 'Published', minWidth: 100 }
  ]

  return (
    <Stack sx={{ width: '100%', height: 'calc(100vh - 210px)' }} gap={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Algolia Video Library</Typography>
        <Typography variant="body2" color="text.secondary">
          Results: {results?.nbHits ?? 0}
        </Typography>
      </Stack>
      <TextField
        label="Search Algolia"
        value={query}
        onChange={(event) => refine(event.target.value)}
        size="small"
        placeholder="Search titles, descriptions, and IDs"
      />
      {error != null && <Alert severity="error">{error.message}</Alert>}
      <Box sx={{ flexGrow: 1 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={status === 'loading' || status === 'stalled'}
          onRowClick={handleRowClick}
          disableRowSelectionOnClick
          hideFooter
          sx={{
            '& .MuiDataGrid-row': {
              cursor: 'pointer'
            }
          }}
        />
      </Box>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          variant="outlined"
          disabled={currentRefinement <= 0}
          onClick={() => refinePage(currentRefinement - 1)}
        >
          Previous
        </Button>
        <Typography variant="body2" color="text.secondary">
          Page {nbPages === 0 ? 0 : currentRefinement + 1} of {nbPages}
        </Typography>
        <Button
          variant="outlined"
          disabled={currentRefinement >= nbPages - 1}
          onClick={() => refinePage(currentRefinement + 1)}
        >
          Next
        </Button>
      </Stack>
    </Stack>
  )
}

export function AlgoliaVideoList(): ReactElement {
  const searchClient = useMemo(() => getAlgoliaSearchClient(), [])
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_VIDEOS_STG ?? 'videos-stg'

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

  return (
    <InstantSearch searchClient={searchClient} indexName={indexName}>
      <Configure
        hitsPerPage={50}
        attributesToRetrieve={[
          'objectID',
          'mediaComponentId',
          'componentType',
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
