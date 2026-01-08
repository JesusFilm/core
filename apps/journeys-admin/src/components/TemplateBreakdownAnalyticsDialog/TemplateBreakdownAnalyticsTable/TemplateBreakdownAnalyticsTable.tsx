import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { ReactElement, useMemo, useState } from 'react'

import { GetTemplateFamilyStatsBreakdown } from '../../../../__generated__/GetTemplateFamilyStatsBreakdown'
import {
  addRestrictedRowToTotal,
  addRowToTotal,
  createInitialTotalRow,
  processRow,
  sortRows,
  trackNonZeroColumns,
  COLUMN_HEADERS,
  NUMERIC_COLUMNS,
  UNKNOWN_JOURNEYS_AGGREGATE_ID,
  Order,
  ProcessedRow,
  SortableColumn
} from './utils'

const COLUMN_MAX_WIDTH = 120
const FIRST_COLUMN_MAX_WIDTH = 200

interface TemplateBreakdownAnalyticsTableProps {
  data: GetTemplateFamilyStatsBreakdown | null | undefined
  loading?: boolean
  error?: unknown
}

export function TemplateBreakdownAnalyticsTable({
  data,
  loading,
  error
}: TemplateBreakdownAnalyticsTableProps): ReactElement | null {
  const [orderBy, setOrderBy] = useState<SortableColumn>('views')
  const [order, setOrder] = useState<Order>('desc')

  const processedData = useMemo(() => {
    if (data?.templateFamilyStatsBreakdown == null) {
      return null
    }

    const columnsWithNonZero = new Set<SortableColumn>()

    const rows: ProcessedRow[] = data.templateFamilyStatsBreakdown.map(
      (row) => {
        const processedRow = processRow(row)
        trackNonZeroColumns(processedRow, columnsWithNonZero)
        return processedRow
      }
    )

    const sortedRows = sortRows(rows, orderBy, order)

    const restrictedRow = sortedRows.find(
      (row) => row.journeyId === UNKNOWN_JOURNEYS_AGGREGATE_ID
    )
    const regularRows = sortedRows.filter(
      (row) => row.journeyId !== UNKNOWN_JOURNEYS_AGGREGATE_ID
    )

    const totalRow = regularRows.reduce(addRowToTotal, createInitialTotalRow())

    if (restrictedRow != null) {
      addRestrictedRowToTotal(totalRow, restrictedRow)
      trackNonZeroColumns(restrictedRow, columnsWithNonZero)
    }

    const columnsWithZeros = new Set<SortableColumn>()
    for (const column of NUMERIC_COLUMNS) {
      if (!columnsWithNonZero.has(column)) {
        columnsWithZeros.add(column)
      }
    }

    return {
      totalRow,
      regularRows,
      restrictedRow,
      columnsWithZeros
    }
  }, [data, orderBy, order])

  const handleRequestSort = (property: SortableColumn): void => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  if (loading === true || error != null || processedData == null) {
    return <Box data-testid="template-breakdown-analytics-table-empty" />
  }

  const { totalRow, regularRows, restrictedRow, columnsWithZeros } =
    processedData
  const displayRows = regularRows.slice(0, 10)

  const visibleColumnHeaders = COLUMN_HEADERS.filter(
    (header) =>
      header.id === 'journeyName' ||
      header.id === 'views' ||
      !columnsWithZeros.has(header.id)
  )

  const renderNumericCell = (
    column: SortableColumn,
    value: number
  ): ReactElement | null => {
    if (columnsWithZeros.has(column) && column !== 'views') {
      return null
    }
    return <TableCell width={COLUMN_MAX_WIDTH}>{value}</TableCell>
  }

  return (
    <Box data-testid="template-breakdown-analytics-table">
      <TableContainer
        sx={{
          maxHeight: 600,
          overflow: 'auto'
        }}
      >
        <Table size="small" sx={{ tableLayout: 'fixed' }}>
          <TableHead
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 2,
              backgroundColor: 'background.paper'
            }}
          >
            <TableRow>
              {visibleColumnHeaders.map((header) => (
                <TableCell
                  key={header.id}
                  width={
                    header.id === 'journeyName'
                      ? FIRST_COLUMN_MAX_WIDTH
                      : COLUMN_MAX_WIDTH
                  }
                  sx={{
                    backgroundColor: 'background.paper',
                    fontWeight: 'bold',
                    borderBottom: 'none'
                  }}
                >
                  <TableSortLabel
                    active={orderBy === header.id}
                    direction={orderBy === header.id ? order : 'asc'}
                    onClick={() => handleRequestSort(header.id)}
                    hideSortIcon
                    sx={{
                      '& .MuiTableSortLabel-icon': {
                        display: 'none'
                      }
                    }}
                  >
                    <Box>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        {header.id === 'views' && orderBy === 'views' && (
                          <ArrowUpwardIcon
                            sx={{
                              fontSize: '0.875rem',
                              color: 'text.secondary',
                              transform:
                                order === 'desc'
                                  ? 'rotate(180deg)'
                                  : 'rotate(0deg)'
                            }}
                          />
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 'bold',
                            color:
                              header.id === 'views' ? 'text.primary' : 'inherit'
                          }}
                        >
                          {header.label}
                        </Typography>
                      </Box>
                      {header.subtitle != null && (
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', display: 'block' }}
                        >
                          {header.subtitle}
                        </Typography>
                      )}
                    </Box>
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
            {/* Total Row */}
            <TableRow
              sx={{
                backgroundColor: 'action.hover',
                '& .MuiTableCell-root': {
                  fontWeight: 'bold',
                  backgroundColor: 'divider',
                  zIndex: 1
                }
              }}
            >
              <TableCell width={FIRST_COLUMN_MAX_WIDTH}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 'bold',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {totalRow.journeyName}
                </Typography>
              </TableCell>
              {renderNumericCell('views', totalRow.views)}
              {renderNumericCell('responses', totalRow.responses)}
              {renderNumericCell(
                'christDecisionCapture',
                totalRow.christDecisionCapture
              )}
              {renderNumericCell(
                'prayerRequestCapture',
                totalRow.prayerRequestCapture
              )}
              {renderNumericCell(
                'specialVideoStartCapture',
                totalRow.specialVideoStartCapture
              )}
              {renderNumericCell(
                'specialVideoCompleteCapture',
                totalRow.specialVideoCompleteCapture
              )}
              {renderNumericCell(
                'gospelStartCapture',
                totalRow.gospelStartCapture
              )}
              {renderNumericCell(
                'gospelCompleteCapture',
                totalRow.gospelCompleteCapture
              )}
              {renderNumericCell('rsvpCapture', totalRow.rsvpCapture)}
              {renderNumericCell('custom1Capture', totalRow.custom1Capture)}
              {renderNumericCell('custom2Capture', totalRow.custom2Capture)}
              {renderNumericCell('custom3Capture', totalRow.custom3Capture)}
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              '& .MuiTableCell-root': {
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`
              },
              '& .MuiTableRow-root:last-child .MuiTableCell-root': {
                borderBottom: 'none'
              }
            }}
          >
            {/* Regular Rows */}
            {displayRows.map((row) => (
              <TableRow key={row.journeyId}>
                <TableCell
                  width={FIRST_COLUMN_MAX_WIDTH}
                  sx={{ overflow: 'hidden' }}
                >
                  <Typography variant="body2">{row.teamName}</Typography>
                  <Link
                    component={NextLink}
                    href={`/journeys/${row.journeyId}`}
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    sx={{
                      textDecoration: 'underline',
                      textDecorationColor: (theme) => theme.palette.divider,
                      color: 'inherit',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%'
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block'
                      }}
                    >
                      {row.journeyName}
                    </Typography>
                  </Link>
                </TableCell>
                {renderNumericCell('views', row.views)}
                {renderNumericCell('responses', row.responses)}
                {renderNumericCell(
                  'christDecisionCapture',
                  row.christDecisionCapture
                )}
                {renderNumericCell(
                  'prayerRequestCapture',
                  row.prayerRequestCapture
                )}
                {renderNumericCell(
                  'specialVideoStartCapture',
                  row.specialVideoStartCapture
                )}
                {renderNumericCell(
                  'specialVideoCompleteCapture',
                  row.specialVideoCompleteCapture
                )}
                {renderNumericCell(
                  'gospelStartCapture',
                  row.gospelStartCapture
                )}
                {renderNumericCell(
                  'gospelCompleteCapture',
                  row.gospelCompleteCapture
                )}
                {renderNumericCell('rsvpCapture', row.rsvpCapture)}
                {renderNumericCell('custom1Capture', row.custom1Capture)}
                {renderNumericCell('custom2Capture', row.custom2Capture)}
                {renderNumericCell('custom3Capture', row.custom3Capture)}
              </TableRow>
            ))}

            {/* Restricted Row */}
            {restrictedRow != null && (
              <TableRow>
                <TableCell width={FIRST_COLUMN_MAX_WIDTH}>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', fontWeight: 'bold' }}
                    >
                      Restricted teams
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block' }}
                    >
                      This data is from teams you don't have access to.
                    </Typography>
                  </Box>
                </TableCell>
                {renderNumericCell('views', restrictedRow.views)}
                {renderNumericCell('responses', restrictedRow.responses)}
                {renderNumericCell(
                  'christDecisionCapture',
                  restrictedRow.christDecisionCapture
                )}
                {renderNumericCell(
                  'prayerRequestCapture',
                  restrictedRow.prayerRequestCapture
                )}
                {renderNumericCell(
                  'specialVideoStartCapture',
                  restrictedRow.specialVideoStartCapture
                )}
                {renderNumericCell(
                  'specialVideoCompleteCapture',
                  restrictedRow.specialVideoCompleteCapture
                )}
                {renderNumericCell(
                  'gospelStartCapture',
                  restrictedRow.gospelStartCapture
                )}
                {renderNumericCell(
                  'gospelCompleteCapture',
                  restrictedRow.gospelCompleteCapture
                )}
                {renderNumericCell('rsvpCapture', restrictedRow.rsvpCapture)}
                {renderNumericCell(
                  'custom1Capture',
                  restrictedRow.custom1Capture
                )}
                {renderNumericCell(
                  'custom2Capture',
                  restrictedRow.custom2Capture
                )}
                {renderNumericCell(
                  'custom3Capture',
                  restrictedRow.custom3Capture
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
