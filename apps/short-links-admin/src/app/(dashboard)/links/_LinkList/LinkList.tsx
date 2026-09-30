'use client'

import { useQuery } from '@apollo/client/react'
import { PlusIcon, SearchIcon } from 'lucide-react'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import {
  KeyboardEvent,
  ReactElement,
  useEffect,
  useMemo,
  useState
} from 'react'

import { graphql } from '@core/shared/gql'

import { CopyButton } from '../../../../components/CopyButton'
import { SelectField, TextField } from '../../../../components/form'
import { HealthChip, StatusChip } from '../../../../components/StatusChip'
import {
  ASSET_CLASS_OPTIONS,
  GET_SHORT_LINK_CAMPAIGN_OPTIONS,
  GET_SHORT_LINK_DOMAINS,
  PLACEMENT_OPTIONS,
  SHORT_LINK_FIELDS,
  STATUS_OPTIONS,
  ShortLinkAssetClass,
  ShortLinkHealth,
  ShortLinkPlacement,
  ShortLinkStatus,
  formatDateTime,
  formatDomainLabel,
  labelFor
} from '../../../../libs/shortLink'

import { BulkToolbar } from './_BulkToolbar'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

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
const PAGE_SIZE_OPTIONS = ['25', '50', '100'].map((value) => ({
  value,
  label: `${value} per page`
}))
/** Select values must be non-empty strings; this stands in for "no filter". */
const ANY = 'any'

const STATUS_FILTER_OPTIONS = [{ value: ANY, label: 'Any' }, ...STATUS_OPTIONS]
const ASSET_CLASS_FILTER_OPTIONS = [
  { value: ANY, label: 'Any' },
  ...ASSET_CLASS_OPTIONS
]
const PLACEMENT_FILTER_OPTIONS = [
  { value: ANY, label: 'Any' },
  ...PLACEMENT_OPTIONS
]
const GLOBAL_FILTER_OPTIONS = [
  { value: ANY, label: 'Any' },
  { value: 'global', label: 'Global' },
  { value: 'local', label: 'Not global' }
]

interface LinkRow {
  id: string
  shortUrl: string
  name: string
  to: string
  status: ShortLinkStatus
  assetClass: ShortLinkAssetClass
  placement: ShortLinkPlacement | null
  campaigns: string
  global: boolean
  health: ShortLinkHealth | null
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
  const [searchTerm, setSearchTerm] = useState('')
  const search = useDebounced(searchTerm)
  const [hostname, setHostname] = useState(ANY)
  const [status, setStatus] = useState(ANY)
  const [assetClass, setAssetClass] = useState(ANY)
  const [placement, setPlacement] = useState(ANY)
  const [campaignId, setCampaignId] = useState(ANY)
  const [tag, setTag] = useState('')
  const debouncedTag = useDebounced(tag)
  const [globalFilter, setGlobalFilter] = useState(ANY)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [cursors, setCursors] = useState<Array<string | undefined>>([undefined])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

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
      tag: debouncedTag.trim() === '' ? undefined : debouncedTag.trim(),
      global: globalFilter === ANY ? undefined : globalFilter === 'global'
    }),
    [
      search,
      hostname,
      status,
      assetClass,
      placement,
      campaignId,
      debouncedTag,
      globalFilter
    ]
  )

  // Any filter change restarts cursor pagination from the first page.
  useEffect(() => {
    setPage(0)
    setCursors([undefined])
  }, [filter])

  const { data, loading, refetch } = useQuery(GET_SHORT_LINKS, {
    variables: { filter, first: pageSize, after: cursors[page] }
  })
  const { data: domainData } = useQuery(GET_SHORT_LINK_DOMAINS)
  const { data: campaignData } = useQuery(GET_SHORT_LINK_CAMPAIGN_OPTIONS)

  const connection = data?.shortLinks
  useEffect(() => {
    const endCursor = connection?.pageInfo.endCursor
    if (endCursor == null) return
    setCursors((current) => {
      const next = [...current]
      next[page + 1] = endCursor
      return next
    })
  }, [connection?.pageInfo.endCursor, page])

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
            global: node.global,
            health: node.healthStatus ?? null,
            updatedAt: formatDateTime(node.updatedAt)
          }
        ]
      }) ?? [],
    [connection?.edges]
  )

  const totalCount = connection?.totalCount ?? 0
  const hasNextPage = connection?.pageInfo.hasNextPage ?? false
  const allSelected =
    rows.length > 0 && rows.every((row) => selectedIds.has(row.id))
  const someSelected = rows.some((row) => selectedIds.has(row.id))

  function handlePageSizeChange(value: string): void {
    setPageSize(Number(value))
    setPage(0)
    setCursors([undefined])
  }

  function handleToggleAll(checked: boolean): void {
    setSelectedIds((current) => {
      const next = new Set(current)
      for (const row of rows) {
        if (checked) next.add(row.id)
        else next.delete(row.id)
      }
      return next
    })
  }

  function handleToggleRow(id: string, checked: boolean): void {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function handleRowKeyDown(
    event: KeyboardEvent<HTMLTableRowElement>,
    id: string
  ): void {
    if (event.key === 'Enter') {
      event.preventDefault()
      router.push(`/links/${id}`)
    }
  }

  function handleBulkDone(): void {
    setSelectedIds(new Set())
    void refetch()
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Links</h2>
        <Button render={<NextLink href="/links/new" />}>
          <PlusIcon aria-hidden="true" />
          New link
        </Button>
      </div>

      <Card className="flex w-full flex-col overflow-hidden">
        <div className="flex flex-wrap items-end gap-3 p-4 pb-2">
          <InputGroup className="w-full sm:w-80">
            <InputGroupAddon>
              <SearchIcon aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Search links"
              placeholder="Search name, pathname or destination"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </InputGroup>
          <SelectField
            id="filter-hostname"
            label="Domain"
            size="sm"
            className="min-w-40"
            value={hostname}
            onValueChange={setHostname}
            options={[
              { value: ANY, label: 'Any' },
              ...domains.map((domain) => ({
                value: domain.hostname,
                label: formatDomainLabel(domain)
              }))
            ]}
          />
          <SelectField
            id="filter-status"
            label="Status"
            size="sm"
            className="min-w-32"
            value={status}
            onValueChange={setStatus}
            options={STATUS_FILTER_OPTIONS}
          />
          <SelectField
            id="filter-asset-class"
            label="Asset class"
            size="sm"
            className="min-w-36"
            value={assetClass}
            onValueChange={setAssetClass}
            options={ASSET_CLASS_FILTER_OPTIONS}
          />
          <SelectField
            id="filter-placement"
            label="Placement"
            size="sm"
            className="min-w-36"
            value={placement}
            onValueChange={setPlacement}
            options={PLACEMENT_FILTER_OPTIONS}
          />
          <SelectField
            id="filter-campaign"
            label="Campaign"
            size="sm"
            className="min-w-40"
            value={campaignId}
            onValueChange={setCampaignId}
            options={[
              { value: ANY, label: 'Any' },
              ...campaigns.map((campaign) => ({
                value: campaign.id,
                label: campaign.name
              }))
            ]}
          />
          <TextField
            id="filter-tag"
            label="Tag"
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            className="min-w-32"
          />
          <SelectField
            id="filter-global"
            label="Global"
            size="sm"
            className="min-w-32"
            value={globalFilter}
            onValueChange={setGlobalFilter}
            options={GLOBAL_FILTER_OPTIONS}
          />
        </div>

        <BulkToolbar
          selectedIds={Array.from(selectedIds)}
          onDone={handleBulkDone}
        />

        <div className="relative min-h-64 overflow-x-auto">
          {loading && (
            <div className="bg-background/60 absolute inset-0 z-10 grid place-items-center">
              <Spinner aria-label="Loading links" />
            </div>
          )}
          <Table aria-label="Links">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    aria-label="Select all links on this page"
                    checked={allSelected}
                    indeterminate={someSelected && !allSelected}
                    onCheckedChange={handleToggleAll}
                  />
                </TableHead>
                <TableHead>Short URL</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Asset class</TableHead>
                <TableHead>Placement</TableHead>
                <TableHead>Campaigns</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  tabIndex={0}
                  onClick={() => router.push(`/links/${row.id}`)}
                  onKeyDown={(event) => handleRowKeyDown(event, row.id)}
                  className="cursor-pointer"
                  data-selected={selectedIds.has(row.id) ? '' : undefined}
                >
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <Checkbox
                      aria-label={`Select ${row.shortUrl}`}
                      checked={selectedIds.has(row.id)}
                      onCheckedChange={(checked) =>
                        handleToggleRow(row.id, checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <span className="truncate">{row.shortUrl}</span>
                      <CopyButton value={row.shortUrl} label="Copy short URL" />
                      {row.global && (
                        <Badge variant="info" data-testid="GlobalChip">
                          Global
                        </Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell className="max-w-72 truncate">{row.to}</TableCell>
                  <TableCell>
                    <StatusChip status={row.status} />
                  </TableCell>
                  <TableCell>
                    {labelFor(ASSET_CLASS_OPTIONS, row.assetClass)}
                  </TableCell>
                  <TableCell>
                    {labelFor(PLACEMENT_OPTIONS, row.placement)}
                  </TableCell>
                  <TableCell>{row.campaigns}</TableCell>
                  <TableCell>
                    <HealthChip health={row.health} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {row.updatedAt}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-muted-foreground">
                    No links match these filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-3">
          <span className="text-muted-foreground text-sm">
            {totalCount} links · page {page + 1}
          </span>
          <div className="flex items-center gap-2">
            <SelectField
              id="page-size"
              label={<span className="sr-only">Page size</span>}
              size="sm"
              className="w-36"
              value={String(pageSize)}
              onValueChange={handlePageSizeChange}
              options={PAGE_SIZE_OPTIONS}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => current - 1)}
              disabled={page === 0 || loading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => current + 1)}
              disabled={!hasNextPage || loading}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
