'use client'

import { useQuery } from '@apollo/client/react'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchIcon from '@mui/icons-material/Search'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
  gridClasses
} from '@mui/x-data-grid'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactElement, useEffect, useMemo, useState } from 'react'

import { graphql } from '@core/shared/gql'

import { CopyButton } from '../../../../components/CopyButton'
import { HealthChip, StatusChip } from '../../../../components/StatusChip'
import {
  ASSET_CLASS_OPTIONS,
  GET_SHORT_LINK_CAMPAIGN_OPTIONS,
  GET_SHORT_LINK_DOMAINS,
  PLACEMENT_OPTIONS,
  SHORT_LINK_FIELDS,
  STATUS_OPTIONS,
  ShortLinkAssetClass,
  ShortLinkPlacement,
  ShortLinkStatus,
  formatDateTime,
  formatDomainLabel,
  labelFor
} from '../../../../libs/shortLink'

import { BulkToolbar } from './_BulkToolbar'

export const GET_SHORT_LINKS = graphql(
  `
    query GetShortLinks(
      $filter: ShortLinksFilter
      $first: Int
      $after: String
    ) {
      shortLinks(filter: $filter, first: $first, after: $after) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          cursor
          node {
            ...ShortLinkFields
          }
        }
      }
    }
  `,
  [SHORT_LINK_FIELDS]
)

const DEFAULT_PAGE_SIZE = 25
const ANY = ''

interface LinkRow {
  id: string
  shortUrl: string
  name: string
  to: string
  status: ShortLinkStatus
  assetClass: ShortLinkAssetClass
  placement: ShortLinkPlacement | null
  campaigns: string
  health: string | null
  updatedAt: string
}

function useDebounced(value: string, delay = 300): string {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timeout)
  }, [value, delay])
  return debounced
}

export function LinkList(): ReactElement {
  const router = useRouter()
  const [gridMounted, setGridMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const search = useDebounced(searchTerm)
  const [hostname, setHostname] = useState(ANY)
  const [status, setStatus] = useState(ANY)
  const [assetClass, setAssetClass] = useState(ANY)
  const [placement, setPlacement] = useState(ANY)
  const [campaignId, setCampaignId] = useState(ANY)
  const [tag, setTag] = useState('')
  const debouncedTag = useDebounced(tag)
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: DEFAULT_PAGE_SIZE
  })
  const [cursors, setCursors] = useState<Array<string | undefined>>([undefined])
  const [selection, setSelection] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set()
  })

  useEffect(() => {
    setGridMounted(true)
  }, [])

  const filter = useMemo(
    () => ({
      search: search.trim() === '' ? undefined : search.trim(),
      hostname: hostname === ANY ? undefined : hostname,
      status: status === ANY ? undefined : (status as ShortLinkStatus),
      assetClass:
        assetClass === ANY ? undefined : (assetClass as ShortLinkAssetClass),
      placement:
        placement === ANY ? undefined : (placement as ShortLinkPlacement),
      campaignId: campaignId === ANY ? undefined : campaignId,
      tag: debouncedTag.trim() === '' ? undefined : debouncedTag.trim()
    }),
    [search, hostname, status, assetClass, placement, campaignId, debouncedTag]
  )

  // Any filter change restarts cursor pagination from the first page.
  useEffect(() => {
    setPaginationModel((current) =>
      current.page === 0 ? current : { ...current, page: 0 }
    )
    setCursors([undefined])
  }, [filter])

  const { data, loading, refetch } = useQuery(GET_SHORT_LINKS, {
    variables: {
      filter,
      first: paginationModel.pageSize,
      after: cursors[paginationModel.page]
    }
  })
  const { data: domainData } = useQuery(GET_SHORT_LINK_DOMAINS)
  const { data: campaignData } = useQuery(GET_SHORT_LINK_CAMPAIGN_OPTIONS)

  const connection = data?.shortLinks
  useEffect(() => {
    const endCursor = connection?.pageInfo.endCursor
    if (endCursor == null) return
    setCursors((current) => {
      const next = [...current]
      next[paginationModel.page + 1] = endCursor
      return next
    })
  }, [connection?.pageInfo.endCursor, paginationModel.page])

  const domains =
    domainData?.shortLinkDomains.edges?.flatMap((edge) =>
      edge?.node != null ? [edge.node] : []
    ) ?? []
  const campaigns =
    campaignData?.shortLinkCampaigns.edges?.flatMap((edge) =>
      edge?.node != null ? [edge.node] : []
    ) ?? []

  const rows: LinkRow[] = useMemo(
    () =>
      connection?.edges?.flatMap((edge) => {
        const node = edge?.node
        if (node == null) return []
        return [
          {
            id: node.id,
            shortUrl: node.shortUrl,
            name: node.name ?? '',
            to: node.to,
            status: node.status,
            assetClass: node.assetClass,
            placement: node.placement ?? null,
            campaigns: node.campaigns
              .map((campaign) => campaign.name)
              .join(', '),
            health: node.healthStatus ?? null,
            updatedAt: formatDateTime(node.updatedAt)
          }
        ]
      }) ?? [],
    [connection?.edges]
  )

  const columns: GridColDef<LinkRow>[] = [
    {
      field: 'shortUrl',
      headerName: 'Short URL',
      flex: 1,
      minWidth: 220,
      renderCell: (params) => (
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2" noWrap>
            {params.value}
          </Typography>
          <CopyButton value={params.value} label="Copy short URL" />
        </Stack>
      )
    },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
    { field: 'to', headerName: 'Destination', flex: 1.5, minWidth: 240 },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => <StatusChip status={params.value} />
    },
    {
      field: 'assetClass',
      headerName: 'Asset class',
      width: 140,
      valueFormatter: (value) => labelFor(ASSET_CLASS_OPTIONS, value)
    },
    {
      field: 'placement',
      headerName: 'Placement',
      width: 140,
      valueFormatter: (value) => labelFor(PLACEMENT_OPTIONS, value)
    },
    { field: 'campaigns', headerName: 'Campaigns', flex: 1, minWidth: 160 },
    {
      field: 'health',
      headerName: 'Health',
      width: 120,
      renderCell: (params) => <HealthChip health={params.value} />
    },
    { field: 'updatedAt', headerName: 'Updated', width: 180 }
  ]

  function handlePaginationModelChange(model: GridPaginationModel): void {
    if (model.pageSize !== paginationModel.pageSize) {
      setCursors([undefined])
      setPaginationModel({ page: 0, pageSize: model.pageSize })
      return
    }
    setPaginationModel(model)
  }

  function handleBulkDone(): void {
    setSelection({ type: 'include', ids: new Set() })
    void refetch()
  }

  const selectedIds = Array.from(selection.ids).map(String)

  return (
    <Stack
      sx={{
        width: '100%',
        maxWidth: { sm: '100%', md: '1700px' },
        alignSelf: 'stretch',
        height: { xs: 'calc(100svh - 160px)', md: 'calc(100vh - 150px)' },
        minHeight: 0,
        overflow: 'hidden',
        pt: { xs: 4, md: 0 }
      }}
      spacing={2}
    >
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Typography component="h2" variant="h6">
          Links
        </Typography>
        <Button
          component={NextLink}
          href="/links/new"
          variant="contained"
          startIcon={<AddRoundedIcon />}
        >
          New link
        </Button>
      </Stack>

      <Paper
        sx={{
          width: '100%',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]:
            { outline: 'none' },
          [`& .${gridClasses.row}`]: { cursor: 'pointer' }
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ p: 2, pb: 1, flexWrap: 'wrap', rowGap: 1.5 }}
        >
          <TextField
            placeholder="Search name, pathname or destination"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            size="small"
            sx={{ width: { xs: '100%', sm: 320 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              },
              htmlInput: { 'aria-label': 'Search links' }
            }}
          />
          <TextField
            select
            label="Domain"
            value={hostname}
            onChange={(event) => setHostname(event.target.value)}
            size="small"
            sx={{ minWidth: 160 }}
          >
            <MenuItem value={ANY}>Any</MenuItem>
            {domains.map((domain) => (
              <MenuItem key={domain.id} value={domain.hostname}>
                {formatDomainLabel(domain)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            size="small"
            sx={{ minWidth: 130 }}
          >
            <MenuItem value={ANY}>Any</MenuItem>
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Asset class"
            value={assetClass}
            onChange={(event) => setAssetClass(event.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value={ANY}>Any</MenuItem>
            {ASSET_CLASS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Placement"
            value={placement}
            onChange={(event) => setPlacement(event.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value={ANY}>Any</MenuItem>
            {PLACEMENT_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Campaign"
            value={campaignId}
            onChange={(event) => setCampaignId(event.target.value)}
            size="small"
            sx={{ minWidth: 160 }}
          >
            <MenuItem value={ANY}>Any</MenuItem>
            {campaigns.map((campaign) => (
              <MenuItem key={campaign.id} value={campaign.id}>
                {campaign.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Tag"
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            size="small"
            sx={{ minWidth: 140 }}
          />
        </Stack>

        <BulkToolbar selectedIds={selectedIds} onDone={handleBulkDone} />

        <Box sx={{ flex: '1 1 auto', minHeight: { xs: 360, sm: 420 } }}>
          {gridMounted ? (
            <DataGrid
              sx={{ height: '100%', minHeight: { xs: 360, sm: 420 } }}
              rows={rows}
              columns={columns}
              rowCount={connection?.totalCount ?? 0}
              loading={loading}
              paginationMode="server"
              paginationMeta={{
                hasNextPage: connection?.pageInfo.hasNextPage ?? false
              }}
              paginationModel={paginationModel}
              onPaginationModelChange={handlePaginationModelChange}
              pageSizeOptions={[25, 50, 100]}
              checkboxSelection
              rowSelectionModel={selection}
              onRowSelectionModelChange={setSelection}
              disableColumnFilter
              disableRowSelectionOnClick
              onRowClick={(params) => router.push(`/links/${params.id}`)}
            />
          ) : (
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                height: '100%',
                justifyContent: 'center',
                minHeight: { xs: 360, sm: 420 }
              }}
            >
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>
      </Paper>
    </Stack>
  )
}
