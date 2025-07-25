'use client'

import GetAppIcon from '@mui/icons-material/GetApp'
import PrintIcon from '@mui/icons-material/Print'
import SearchIcon from '@mui/icons-material/Search'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
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
import { usePathname, useRouter } from 'next/navigation'
import { ReactElement, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { useRefinementList, useSearchBox } from 'react-instantsearch'

import Lock1 from '@core/shared/ui/icons/Lock1'

import { VideoListHeader } from '../../../app/(dashboard)/videos/_VideoList/_VideoListHeader'
import { PublishedChip } from '../../../components/PublishedChip'
import {
  type AdminVideo,
  useAlgoliaAdminVideos
} from '../../../libs/algolia/useAlgoliaAdminVideos'

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

// Search Bar Component
function SearchBar(): ReactElement {
  const { query, refine } = useSearchBox()

  return (
    <TextField
      value={query}
      onChange={(e) => refine(e.target.value)}
      placeholder="Search videos by title, ID, or description..."
      variant="outlined"
      size="medium"
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        )
      }}
      sx={{
        mb: 2,
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'background.paper'
        }
      }}
    />
  )
}

// Print component for Algolia data
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
        Videos Report (Algolia)
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
        This report was generated from the Videos Admin dashboard (Algolia)
      </div>
    </div>
  )
}

export function AlgoliaVideoList(): ReactElement {
  const router = useRouter()
  const pathname = usePathname()
  const [exportLoading, setExportLoading] = useState(false)
  const [printLoading, setPrintLoading] = useState(false)

  // Algolia hooks
  const {
    items: algoliaVideos,
    loading,
    totalCount,
    showMore,
    isLastPage
  } = useAlgoliaAdminVideos<AdminVideo>()

  // Refinement lists for filtering
  const { items: publishedItems, refine: refinePublished } = useRefinementList({
    attribute: 'published'
  })

  const { items: lockedItems, refine: refineLocked } = useRefinementList({
    attribute: 'locked'
  })

  const rows: GridRowsProp = algoliaVideos.map((video) => ({
    id: video.id,
    title: video.title,
    description: video.description,
    published: video.published,
    locked: video.locked
  }))

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

  function handleLoadMore(): void {
    if (!isLastPage) {
      showMore()
    }
  }

  function handleFilterModelChange(model: GridFilterModel): void {
    // Convert DataGrid filters to Algolia refinements
    model.items.forEach((item) => {
      if (item.field === 'published' && item.operator === 'is') {
        refinePublished(String(item.value))
      }
      if (item.field === 'locked' && item.operator === 'is') {
        refineLocked(String(item.value))
      }
    })
  }

  // Custom toolbar with export functionality
  function CustomToolbar(): ReactElement {
    const handleExport = async () => {
      if (exportLoading) return
      setExportLoading(true)

      try {
        // For now, export current visible data
        // TODO: Implement full data export with Algolia search
        const csvContent =
          'ID,Title,Description,Published,Locked\n' +
          algoliaVideos
            .map(
              (row) =>
                `${row.id},${row.title ? `"${row.title.replace(/"/g, '""')}"` : ''},${row.description ? `"${row.description.replace(/"/g, '""')}"` : ''},${row.published},${row.locked}`
            )
            .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', 'videos-export-algolia.csv')
        document.body.appendChild(link)
        link.click()
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
        const printWindow = window.open('', '_blank')
        if (!printWindow) {
          console.error('Could not open print window - popup may be blocked')
          return
        }

        const printContent = renderToString(
          <PrintComponent data={algoliaVideos} />
        )

        printWindow.document.open()
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Videos Report (Algolia)</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: white; color: black; }
                @media print {
                  @page { size: landscape; margin: 10mm; }
                  body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                  table { page-break-inside: auto; }
                  tr { page-break-inside: avoid; page-break-after: auto; }
                  thead { display: table-header-group; }
                  tfoot { display: table-footer-group; }
                }
              </style>
            </head>
            <body>
              ${printContent}
              <script>
                window.onload = function() {
                  setTimeout(function() { window.print(); }, 1000);
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
        {!isLastPage && (
          <Button
            onClick={handleLoadMore}
            size="small"
            sx={{
              mx: 0.5,
              textTransform: 'none'
            }}
          >
            Load More ({totalCount} total)
          </Button>
        )}
      </GridToolbarContainer>
    )
  }

  return (
    <Stack sx={{ height: 'calc(100vh - 150px)', width: '100%' }} gap={2}>
      <VideoListHeader />
      <SearchBar />
      <DataGrid
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
        }
        density="compact"
        data-testid="AlgoliaVideoListDataGrid"
        loading={loading}
        rows={rows}
        columns={columns}
        paginationMode="client"
        rowCount={totalCount}
        onRowClick={handleClick}
        slots={{
          toolbar: CustomToolbar
        }}
        disableDensitySelector
        onFilterModelChange={handleFilterModelChange}
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
    </Stack>
  )
}
