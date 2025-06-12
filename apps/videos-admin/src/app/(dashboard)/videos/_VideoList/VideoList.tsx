'use client'

import { useQuery } from '@apollo/client'
import GetAppIcon from '@mui/icons-material/GetApp'
import PrintIcon from '@mui/icons-material/Print'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import {
  DataGrid,
  GridCallbackDetails,
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridRenderCellParams,
  GridRowParams,
  GridRowsProp,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridValidRowModel,
  MuiEvent,
  getGridBooleanOperators,
  getGridStringOperators,
  gridClasses,
  useGridApiContext
} from '@mui/x-data-grid'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import omitBy from 'lodash/omitBy'
import { usePathname, useRouter } from 'next/navigation'
import { ReactElement, useState } from 'react'
import { renderToString } from 'react-dom/server'

import Lock1 from '@core/shared/ui/icons/Lock1'

import { PublishedChip } from '../../../../components/PublishedChip'
import { useVideoFilter } from '../../../../libs/useVideoFilter'

import { VideoListHeader } from './_VideoListHeader'

function LockedCell(
  params: GridRenderCellParams<GridValidRowModel, boolean>
): ReactElement | null {
  return params.value ? (
    <Stack
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Paper
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          height: 28,
          width: 28,
          borderRadius: 1,
          display: 'grid',
          placeItems: 'center'
        }}
      >
        <Lock1 fontSize="small" />
      </Paper>
    </Stack>
  ) : null
}

export const GET_ADMIN_VIDEOS_AND_COUNT = graphql(`
  query GetAdminVideosAndCount(
    $limit: Int
    $offset: Int
    $showTitle: Boolean!
    $showSnippet: Boolean!
    $where: VideosFilter
  ) {
    adminVideos(limit: $limit, offset: $offset, where: $where) {
      id
      locked
      title @include(if: $showTitle) {
        primary
        value
      }
      snippet @include(if: $showSnippet) {
        primary
        value
      }
      published
    }
    adminVideosCount(where: $where)
  }
`)

export type GetAdminVideosAndCount = ResultOf<typeof GET_ADMIN_VIDEOS_AND_COUNT>
export type GetAdminVideosAndCountVariables = VariablesOf<
  typeof GET_ADMIN_VIDEOS_AND_COUNT
>

// Separate component for printing that displays all data in a table format
function PrintComponent({
  data
}: {
  data: Array<{
    id: string
    title?: string
    description?: string
    published: boolean
    locked: boolean
  }>
}) {
  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '100%'
      }}
    >
      <h1
        style={{ textAlign: 'center', marginBottom: '20px', fontSize: '24px' }}
      >
        Videos Report
      </h1>

      <div style={{ marginBottom: '20px', fontSize: '14px' }}>
        <div>
          <strong>Total Records:</strong> {data.length}
        </div>
        <div>
          <strong>Generated:</strong> {new Date().toLocaleString()}
        </div>
      </div>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '20px',
          fontSize: '12px'
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                border: '1px solid #ddd',
                padding: '8px',
                textAlign: 'left',
                backgroundColor: '#f2f2f2',
                fontWeight: 'bold'
              }}
            >
              ID
            </th>
            <th
              style={{
                border: '1px solid #ddd',
                padding: '8px',
                textAlign: 'left',
                backgroundColor: '#f2f2f2',
                fontWeight: 'bold'
              }}
            >
              Title
            </th>
            <th
              style={{
                border: '1px solid #ddd',
                padding: '8px',
                textAlign: 'left',
                backgroundColor: '#f2f2f2',
                fontWeight: 'bold'
              }}
            >
              Description
            </th>
            <th
              style={{
                border: '1px solid #ddd',
                padding: '8px',
                textAlign: 'center',
                backgroundColor: '#f2f2f2',
                fontWeight: 'bold',
                width: '80px'
              }}
            >
              Published
            </th>
            <th
              style={{
                border: '1px solid #ddd',
                padding: '8px',
                textAlign: 'center',
                backgroundColor: '#f2f2f2',
                fontWeight: 'bold',
                width: '80px'
              }}
            >
              Locked
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  verticalAlign: 'top'
                }}
              >
                {row.id}
              </td>
              <td
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  verticalAlign: 'top'
                }}
              >
                {row.title || ''}
              </td>
              <td
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  verticalAlign: 'top'
                }}
              >
                {row.description
                  ? row.description.length > 150
                    ? `${row.description.substring(0, 150)}...`
                    : row.description
                  : ''}
              </td>
              <td
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  textAlign: 'center',
                  verticalAlign: 'top'
                }}
              >
                {row.published ? '✓' : '✗'}
              </td>
              <td
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  textAlign: 'center',
                  verticalAlign: 'top'
                }}
              >
                {row.locked ? '✓' : '✗'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          textAlign: 'center',
          fontSize: '10px',
          color: '#666',
          marginTop: '30px',
          borderTop: '1px solid #ddd',
          paddingTop: '10px'
        }}
      >
        This report was generated from the Videos Admin dashboard
      </div>
    </div>
  )
}

export function VideoList(): ReactElement {
  const router = useRouter()
  const pathname = usePathname()
  const [exportLoading, setExportLoading] = useState(false)
  const [printLoading, setPrintLoading] = useState(false)

  const { filters, tableFilterProps, updateQueryParams, dispatch } =
    useVideoFilter()

  const { data, loading, fetchMore, client } = useQuery<
    GetAdminVideosAndCount,
    GetAdminVideosAndCountVariables
  >(GET_ADMIN_VIDEOS_AND_COUNT, {
    variables: {
      ...filters
    }
  })

  const rows: GridRowsProp =
    data?.adminVideos?.map((video) => {
      const title = video?.title?.find(({ primary }) => primary)?.value
      const description = video?.snippet?.find(({ primary }) => primary)?.value
      return {
        id: video.id,
        title,
        description,
        published: video.published,
        locked: video.locked
      }
    }) ?? []

  const columns: GridColDef[] = [
    {
      field: 'locked',
      headerName: 'Locked',
      width: 68,
      renderCell: (params) => <LockedCell {...params} />,
      filterOperators: getGridBooleanOperators().filter(
        (operator) => operator.value === 'is'
      )
    },
    {
      field: 'id',
      headerName: 'ID',
      minWidth: 150,
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'equals'
      )
    },
    {
      field: 'title',
      headerName: 'Title',
      minWidth: 200,
      filterOperators: getGridStringOperators().filter(
        (operator) => operator.value === 'equals'
      )
    },
    {
      field: 'published',
      headerName: 'Published',
      width: 112,
      filterOperators: getGridBooleanOperators().filter(
        (operator) => operator.value === 'is'
      ),
      renderCell: (
        params: GridRenderCellParams<GridValidRowModel, boolean>
      ) => <PublishedChip published={params.value ?? false} />
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      filterable: false
    }
  ]

  function handleClick(
    params: GridRowParams,
    _event: MuiEvent,
    _details: GridCallbackDetails
  ): void {
    if (params.row.locked) return

    router.push(`${pathname}/${params.id}`)
  }

  async function handleChangePage(
    model: GridPaginationModel,
    _details: GridCallbackDetails
  ): Promise<void> {
    await fetchMore({
      variables: {
        offset: model.page * filters.limit
      }
    })

    dispatch({ type: 'PageChange', model })

    updateQueryParams({ page: model.page })
  }

  function handleFilterModelChange(model: GridFilterModel): void {
    const params = model.items.reduce((acc, item) => {
      acc[item.field] = {
        [item.operator]: item.value === '' ? null : item.value
      }
      return acc
    }, {})

    dispatch({
      type: 'PageChange',
      model: { pageSize: filters.limit, page: 0 }
    })
    dispatch({
      type: 'FilterChange',
      model
    })

    updateQueryParams({ filters: params })
  }

  const handleColumnVisibilityModelChange = (model) => {
    dispatch({ type: 'ColumnChange', model })

    const columns = omitBy(model)
    delete columns.undefined

    updateQueryParams({ columns })
  }

  // Custom toolbar component to handle export all functionality
  function CustomToolbar(): ReactElement {
    const apiRef = useGridApiContext()

    const handleExport = async () => {
      if (exportLoading) return
      setExportLoading(true)

      try {
        // Initialize an empty array to store all rows
        interface ExportRow {
          id: string
          title?: string
          description?: string
          published: boolean
          locked: boolean
        }

        const allRows: ExportRow[] = []

        // Function to fetch all data in chunks
        const fetchAllData = async (offset = 0) => {
          try {
            // Fetch data with the current filters but with a larger limit
            const result = await client.query({
              query: GET_ADMIN_VIDEOS_AND_COUNT,
              variables: {
                limit: 1000, // Fetch a larger batch
                offset,
                showTitle: true,
                showSnippet: true,
                where: filters.where
              }
            })

            const videos = result.data.adminVideos || []

            // Process the data to match the grid's format
            const processedRows = videos.map((video) => {
              const title = video?.title?.find(({ primary }) => primary)?.value
              const description = video?.snippet?.find(
                ({ primary }) => primary
              )?.value
              return {
                id: video.id,
                title,
                description,
                published: video.published,
                locked: video.locked
              }
            })

            // Add the processed rows to our collection
            allRows.push(...processedRows)

            // If there are more records, fetch them
            if (videos.length === 1000) {
              await fetchAllData(offset + 1000)
            }
          } catch (error) {
            console.error('Error fetching data for export:', error)
          }
        }

        // Start fetching all the data
        await fetchAllData()

        // Create CSV content
        let csvContent = 'ID,Title,Description,Published,Locked\n'

        allRows.forEach((row) => {
          csvContent += `${row.id},${row.title ? `"${row.title.replace(/"/g, '""')}"` : ''},${row.description ? `"${row.description.replace(/"/g, '""')}"` : ''},${row.published},${row.locked}\n`
        })

        // Create a download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', 'videos-export.csv')
        document.body.appendChild(link)

        // Trigger the download
        link.click()

        // Clean up
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } finally {
        setExportLoading(false)
      }
    }

    const handlePrint = async () => {
      if (printLoading) return
      setPrintLoading(true)

      try {
        // Initialize an empty array to store all rows
        interface PrintRow {
          id: string
          title?: string
          description?: string
          published: boolean
          locked: boolean
        }

        const allRows: PrintRow[] = []

        // Function to fetch all data in chunks (same approach as export)
        const fetchAllData = async (offset = 0) => {
          try {
            // Fetch data with the current filters but with a larger limit
            const result = await client.query({
              query: GET_ADMIN_VIDEOS_AND_COUNT,
              variables: {
                limit: 1000, // Fetch a larger batch
                offset,
                showTitle: true,
                showSnippet: true,
                where: filters.where
              }
            })

            const videos = result.data.adminVideos || []

            // Process the data to match the grid's format
            const processedRows = videos.map((video) => {
              const title = video?.title?.find(({ primary }) => primary)?.value
              const description = video?.snippet?.find(
                ({ primary }) => primary
              )?.value
              return {
                id: video.id,
                title,
                description,
                published: video.published,
                locked: video.locked
              }
            })

            // Add the processed rows to our collection
            allRows.push(...processedRows)

            // If there are more records, fetch them
            if (videos.length === 1000) {
              await fetchAllData(offset + 1000)
            }
          } catch (error) {
            console.error('Error fetching data for printing:', error)
          }
        }

        // Start fetching all the data
        await fetchAllData()

        // Create a new window for printing
        const printWindow = window.open('', '_blank')
        if (!printWindow) {
          console.error('Could not open print window - popup may be blocked')
          return
        }

        // Render the print component in the new window
        const printContent = renderToString(<PrintComponent data={allRows} />)

        printWindow.document.open()
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Videos Report</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  font-family: Arial, sans-serif;
                  background-color: white;
                  color: black;
                }
                
                @media print {
                  @page {
                    size: landscape;
                    margin: 10mm;
                  }
                  
                  body {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  
                  table {
                    page-break-inside: auto;
                  }
                  
                  tr {
                    page-break-inside: avoid;
                    page-break-after: auto;
                  }
                  
                  thead {
                    display: table-header-group;
                  }
                  
                  tfoot {
                    display: table-footer-group;
                  }
                }
              </style>
            </head>
            <body>
              ${printContent}
              <script>
                // Auto print when content is loaded
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    // Optional: Close the window after printing
                    // Uncomment the line below to close automatically
                    // window.addEventListener('afterprint', function() { window.close(); });
                  }, 1000);
                }
              </script>
            </body>
          </html>
        `)
        printWindow.document.close()
      } finally {
        setPrintLoading(false)
      }
    }

    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        {printLoading ? (
          <CircularProgress size={24} sx={{ mx: 1 }} />
        ) : (
          <Button
            onClick={handlePrint}
            size="small"
            startIcon={<PrintIcon />}
            sx={{
              mx: 0.5,
              textTransform: 'none'
            }}
          >
            Print
          </Button>
        )}
        {exportLoading ? (
          <CircularProgress size={24} sx={{ mx: 1 }} />
        ) : (
          <Button
            onClick={handleExport}
            size="small"
            startIcon={<GetAppIcon />}
            sx={{
              mx: 0.5,
              textTransform: 'none'
            }}
          >
            Export
          </Button>
        )}
      </GridToolbarContainer>
    )
  }

  return (
    <Stack sx={{ height: 'calc(100vh - 150px)', width: '100%' }} gap={2}>
      <VideoListHeader />
      <DataGrid
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
        }
        density="compact"
        data-testid="VideoListDataGrid"
        loading={loading}
        rows={rows}
        columns={columns}
        {...tableFilterProps}
        pageSizeOptions={[10]}
        paginationMode="server"
        onPaginationModelChange={handleChangePage}
        rowCount={data?.adminVideosCount ?? 0}
        onRowClick={handleClick}
        slots={{
          toolbar: CustomToolbar
        }}
        disableDensitySelector
        onColumnVisibilityModelChange={handleColumnVisibilityModelChange}
        onFilterModelChange={handleFilterModelChange}
        filterMode="server"
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
          },
          toolbar: {
            csvOptions: {
              allColumns: true,
              fileName: 'videos-export'
            }
          }
        }}
        showToolbar
      />
    </Stack>
  )
}
