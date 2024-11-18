'use client'

import { useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import {
  DataGrid,
  GridCallbackDetails,
  GridColDef,
  GridColumnVisibilityModel,
  GridFilterModel,
  GridPaginationMeta,
  GridPaginationModel,
  GridRenderCellParams,
  GridRowParams,
  GridRowsProp,
  GridToolbar,
  GridValidRowModel,
  MuiEvent,
  getGridStringOperators,
  gridClasses
} from '@mui/x-data-grid'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ReactElement, useEffect, useMemo, useRef, useState } from 'react'

import { ShortLinkDomainListToolbar } from './ShortLinkDomainListToolbar'

export const GET_SHORT_LINK_DOMAINS = graphql(`
  query GetShortLinkDomains($first: Int, $after: String, $service: Service) {
    shortLinkDomains(first: $first, after: $after, service: $service) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          id
          hostname
          services
        }
      }
    }
  }
`)

type Service = VariablesOf<typeof GET_SHORT_LINK_DOMAINS>['service']

const PAGE_SIZE = 50

export function ShortLinkDomainList(): ReactElement {
  const t = useTranslations()

  const mapPageToNextCursor = useRef<{ [page: number]: string }>({})

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGE_SIZE
  })

  const queryOptions: Pick<
    VariablesOf<typeof GET_SHORT_LINK_DOMAINS>,
    'after' | 'first'
  > = useMemo(
    () => ({
      after: mapPageToNextCursor.current[paginationModel.page - 1],
      first: paginationModel.pageSize
    }),
    [paginationModel]
  )
  const { data, loading } = useQuery(GET_SHORT_LINK_DOMAINS, {
    variables: {
      // service,
      ...queryOptions
    }
  })

  type GridValidRowModel = Exclude<
    Exclude<
      Exclude<
        ResultOf<typeof GET_SHORT_LINK_DOMAINS>['shortLinkDomains']['edges'],
        null
      >[0],
      null
    >['node'],
    null
  >

  const columns: Array<GridColDef<GridValidRowModel>> = [
    {
      field: 'id',
      headerName: t('ID'),
      filterable: false,
      sortable: false
    },
    {
      field: 'hostname',
      headerName: t('Host Name'),
      filterable: false,
      sortable: false
    },
    {
      field: 'services',
      headerName: t('Services'),
      flex: 1,
      filterable: false,
      sortable: false
    }
  ]

  const rows: GridRowsProp<GridValidRowModel> =
    data?.shortLinkDomains?.edges?.reduce((result, shortLinkDomain) => {
      if (shortLinkDomain?.node != null)
        result.push({
          id: shortLinkDomain.node.id,
          hostname: shortLinkDomain.node.hostname,
          services: shortLinkDomain.node.services
        })
      return result
    }, [] as GridValidRowModel[]) ?? []

  const handlePaginationModelChange = (
    newPaginationModel: GridPaginationModel
  ) => {
    // We have the cursor, we can allow the page transition.
    if (
      newPaginationModel.page === 0 ||
      mapPageToNextCursor.current[newPaginationModel.page - 1] != null
    ) {
      setPaginationModel(newPaginationModel)
    }
  }

  const paginationMetaRef = useRef<GridPaginationMeta>()

  // Memoize to avoid flickering when the `hasNextPage` is `undefined` during refetch
  const paginationMeta = useMemo(() => {
    const hasNextPage = data?.shortLinkDomains?.pageInfo.hasNextPage
    if (
      hasNextPage != null &&
      paginationMetaRef.current?.hasNextPage !== hasNextPage
    ) {
      paginationMetaRef.current = { hasNextPage }
    }
    return paginationMetaRef.current
  }, [data?.shortLinkDomains?.pageInfo.hasNextPage])

  useEffect(() => {
    const nextCursor = data?.shortLinkDomains?.pageInfo.endCursor
    if (!loading && nextCursor != null) {
      // We add nextCursor when available
      mapPageToNextCursor.current[paginationModel.page] = nextCursor
    }
  }, [
    paginationModel.page,
    loading,
    data?.shortLinkDomains?.pageInfo.endCursor
  ])

  // Some API clients return undefined while loading
  // Following lines are here to prevent `rowCountState` from being undefined during the loading
  const [rowCountState, setRowCountState] = useState(
    data?.shortLinkDomains?.totalCount ?? 0
  )
  useEffect(() => {
    const totalRowCount = data?.shortLinkDomains?.totalCount
    setRowCountState((prevRowCountState) =>
      totalRowCount !== undefined ? totalRowCount : prevRowCountState
    )
  }, [paginationMeta?.hasNextPage, data?.shortLinkDomains?.totalCount])

  return (
    <Box sx={{ height: 'calc(100vh - 150px)', width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[PAGE_SIZE]}
        rowCount={rowCountState}
        onRowCountChange={(newRowCount) => setRowCountState(newRowCount)}
        paginationMeta={paginationMeta}
        paginationMode="server"
        onPaginationModelChange={handlePaginationModelChange}
        paginationModel={paginationModel}
        loading={loading}
        disableRowSelectionOnClick
        slots={{
          toolbar: ShortLinkDomainListToolbar
        }}
        sx={{
          [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
            outline: 'transparent'
          },
          [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]:
            {
              outline: 'none'
            }
        }}
        slotProps={{
          row: {
            style: {
              cursor: 'pointer'
            }
          }
        }}
      />
    </Box>
  )
}
