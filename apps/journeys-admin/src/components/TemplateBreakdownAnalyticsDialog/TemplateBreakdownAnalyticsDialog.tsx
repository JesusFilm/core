import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Link from '@mui/material/Link'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import Typography from '@mui/material/Typography'
import { formatISO } from 'date-fns'
import NextLink from 'next/link'
import { ReactElement, useEffect, useMemo, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import {
  GetTemplateFamilyStatsBreakdown,
  GetTemplateFamilyStatsBreakdownVariables
} from '../../../__generated__/GetTemplateFamilyStatsBreakdown'
import { earliestStatsCollected } from '../Editor/Slider/JourneyFlow/AnalyticsOverlaySwitch'
import {
  IdType,
  JourneyStatus,
  PlausibleEvent
} from '../../../__generated__/globalTypes'
import FormGroup from '@mui/material/FormGroup'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'

const UNKNOWN_JOURNEYS_AGGREGATE_ID = '__unknown_journeys__'

interface TemplateBreakdownAnalyticsDialogProps {
  journeyId: string
  open: boolean
  handleClose: () => void
}

export const GET_TEMPLATE_FAMILY_STATS_BREAKDOWN = gql`
  query GetTemplateFamilyStatsBreakdown(
    $id: ID!
    $idType: IdType
    $where: PlausibleStatsBreakdownFilter!
    $events: [PlausibleEvent!]
    $status: [JourneyStatus!]
  ) {
    templateFamilyStatsBreakdown(
      id: $id
      idType: $idType
      where: $where
      events: $events
      status: $status
    ) {
      journeyId
      journeyName
      teamName
      status
      stats {
        event
        visitors
      }
    }
  }
`

export function TemplateBreakdownAnalyticsDialog({
  journeyId,
  open,
  handleClose
}: TemplateBreakdownAnalyticsDialogProps): ReactElement {
  const [includeArchivedJourneys, setIncludeArchivedJourneys] = useState(true)

  const defaultVariables: GetTemplateFamilyStatsBreakdownVariables = useMemo(
    () => ({
      id: journeyId,
      idType: IdType.databaseId,
      where: {
        property: 'event:props:templateKey',
        period: 'custom',
        date: `${earliestStatsCollected},${formatISO(new Date(), {
          representation: 'date'
        })}`
      },
      events: [
        PlausibleEvent.journeyVisitors,
        PlausibleEvent.journeyResponses,
        PlausibleEvent.prayerRequestCapture,
        PlausibleEvent.christDecisionCapture,
        PlausibleEvent.gospelStartCapture,
        PlausibleEvent.gospelCompleteCapture,
        PlausibleEvent.rsvpCapture,
        PlausibleEvent.specialVideoStartCapture,
        PlausibleEvent.specialVideoCompleteCapture,
        PlausibleEvent.custom1Capture,
        PlausibleEvent.custom2Capture,
        PlausibleEvent.custom3Capture
      ],
      status: [
        JourneyStatus.published,
        JourneyStatus.draft,
        JourneyStatus.archived
      ]
    }),
    [journeyId]
  )

  const { data, loading, error, refetch } = useQuery<
    GetTemplateFamilyStatsBreakdown,
    GetTemplateFamilyStatsBreakdownVariables
  >(GET_TEMPLATE_FAMILY_STATS_BREAKDOWN, {
    variables: defaultVariables,
    skip: !open
  })

  useEffect(() => {
    if (open) {
      void refetch({
        ...defaultVariables,
        status: includeArchivedJourneys
          ? [
              JourneyStatus.published,
              JourneyStatus.draft,
              JourneyStatus.archived
            ]
          : [JourneyStatus.published, JourneyStatus.draft]
      })
    }
  }, [includeArchivedJourneys, refetch, open, journeyId])

  type Order = 'asc' | 'desc'
  type SortableColumn =
    | 'journeyName'
    | 'views'
    | 'responses'
    | 'christDecisionCapture'
    | 'prayerRequestCapture'
    | 'specialVideoStartCapture'
    | 'specialVideoCompleteCapture'
    | 'gospelStartCapture'
    | 'gospelCompleteCapture'
    | 'rsvpCapture'
    | 'custom1Capture'
    | 'custom2Capture'
    | 'custom3Capture'

  const [orderBy, setOrderBy] = useState<SortableColumn>('views')
  const [order, setOrder] = useState<Order>('desc')

  const eventColumnMap: Record<string, SortableColumn> = {
    journeyVisitors: 'views',
    journeyResponses: 'responses',
    christDecisionCapture: 'christDecisionCapture',
    prayerRequestCapture: 'prayerRequestCapture',
    specialVideoStartCapture: 'specialVideoStartCapture',
    specialVideoCompleteCapture: 'specialVideoCompleteCapture',
    gospelStartCapture: 'gospelStartCapture',
    gospelCompleteCapture: 'gospelCompleteCapture',
    rsvpCapture: 'rsvpCapture',
    custom1Capture: 'custom1Capture',
    custom2Capture: 'custom2Capture',
    custom3Capture: 'custom3Capture'
  }

  const columnHeaders = [
    {
      id: 'journeyName' as SortableColumn,
      label: 'Team',
      subtitle: 'Link to journey'
    },
    { id: 'views' as SortableColumn, label: 'Views' },
    { id: 'responses' as SortableColumn, label: 'Responses' },
    {
      id: 'christDecisionCapture' as SortableColumn,
      label: 'Decision for Christ'
    },
    { id: 'prayerRequestCapture' as SortableColumn, label: 'Prayer Request' },
    {
      id: 'specialVideoStartCapture' as SortableColumn,
      label: 'Feature Video Started'
    },
    {
      id: 'specialVideoCompleteCapture' as SortableColumn,
      label: 'Feature Video Ended'
    },
    {
      id: 'gospelStartCapture' as SortableColumn,
      label: 'Gospel Presentation Started'
    },
    {
      id: 'gospelCompleteCapture' as SortableColumn,
      label: 'Gospel Presentation Completed'
    },
    { id: 'rsvpCapture' as SortableColumn, label: 'RSVP' },
    { id: 'custom1Capture' as SortableColumn, label: 'Custom Event 1' },
    { id: 'custom2Capture' as SortableColumn, label: 'Custom Event 2' },
    { id: 'custom3Capture' as SortableColumn, label: 'Custom Event 3' }
  ]

  type BreakdownRow = NonNullable<
    GetTemplateFamilyStatsBreakdown['templateFamilyStatsBreakdown']
  >[0]

  const getEventValue = (row: BreakdownRow, event: PlausibleEvent): number => {
    const stat = row.stats.find((s) => s.event === event)
    return stat?.visitors ?? 0
  }

  const processedData = useMemo(() => {
    if (data?.templateFamilyStatsBreakdown == null) return null

    const rows = data.templateFamilyStatsBreakdown.map((row) => ({
      ...row,
      views: getEventValue(row, PlausibleEvent.journeyVisitors),
      responses: getEventValue(row, PlausibleEvent.journeyResponses),
      christDecisionCapture: getEventValue(
        row,
        PlausibleEvent.christDecisionCapture
      ),
      prayerRequestCapture: getEventValue(
        row,
        PlausibleEvent.prayerRequestCapture
      ),
      specialVideoStartCapture: getEventValue(
        row,
        PlausibleEvent.specialVideoStartCapture
      ),
      specialVideoCompleteCapture: getEventValue(
        row,
        PlausibleEvent.specialVideoCompleteCapture
      ),
      gospelStartCapture: getEventValue(row, PlausibleEvent.gospelStartCapture),
      gospelCompleteCapture: getEventValue(
        row,
        PlausibleEvent.gospelCompleteCapture
      ),
      rsvpCapture: getEventValue(row, PlausibleEvent.rsvpCapture),
      custom1Capture: getEventValue(row, PlausibleEvent.custom1Capture),
      custom2Capture: getEventValue(row, PlausibleEvent.custom2Capture),
      custom3Capture: getEventValue(row, PlausibleEvent.custom3Capture)
    }))

    const sortedRows = [...rows].sort((a, b) => {
      const aValue = a[orderBy]
      const bValue = b[orderBy]
      const comparison =
        typeof aValue === 'number' && typeof bValue === 'number'
          ? aValue - bValue
          : String(aValue).localeCompare(String(bValue))
      return order === 'asc' ? comparison : -comparison
    })

    const restrictedRow = sortedRows.find(
      (row) => row.journeyId === UNKNOWN_JOURNEYS_AGGREGATE_ID
    )
    const regularRows = sortedRows.filter(
      (row) => row.journeyId !== UNKNOWN_JOURNEYS_AGGREGATE_ID
    )

    const totalRow = regularRows.reduce(
      (acc, row) => ({
        journeyId: 'total',
        journeyName: 'TOTAL',
        teamName: '',
        status: null,
        views: acc.views + row.views,
        responses: acc.responses + row.responses,
        christDecisionCapture:
          acc.christDecisionCapture + row.christDecisionCapture,
        prayerRequestCapture:
          acc.prayerRequestCapture + row.prayerRequestCapture,
        specialVideoStartCapture:
          acc.specialVideoStartCapture + row.specialVideoStartCapture,
        specialVideoCompleteCapture:
          acc.specialVideoCompleteCapture + row.specialVideoCompleteCapture,
        gospelStartCapture: acc.gospelStartCapture + row.gospelStartCapture,
        gospelCompleteCapture:
          acc.gospelCompleteCapture + row.gospelCompleteCapture,
        rsvpCapture: acc.rsvpCapture + row.rsvpCapture,
        custom1Capture: acc.custom1Capture + row.custom1Capture,
        custom2Capture: acc.custom2Capture + row.custom2Capture,
        custom3Capture: acc.custom3Capture + row.custom3Capture,
        stats: []
      }),
      {
        journeyId: 'total',
        journeyName: 'TOTAL',
        teamName: '',
        status: null,
        views: 0,
        responses: 0,
        christDecisionCapture: 0,
        prayerRequestCapture: 0,
        specialVideoStartCapture: 0,
        specialVideoCompleteCapture: 0,
        gospelStartCapture: 0,
        gospelCompleteCapture: 0,
        rsvpCapture: 0,
        custom1Capture: 0,
        custom2Capture: 0,
        custom3Capture: 0,
        stats: []
      }
    )

    return {
      totalRow,
      regularRows,
      restrictedRow
    }
  }, [data, orderBy, order])

  const handleRequestSort = (property: SortableColumn): void => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  if (loading) {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        dialogTitle={{
          title: 'Template Breakdown Analytics',
          closeButton: true
        }}
        divider
        maxWidth="xl"
        dialogActionChildren={
          <FormGroup
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-start'
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={includeArchivedJourneys}
                  onChange={() =>
                    setIncludeArchivedJourneys(!includeArchivedJourneys)
                  }
                />
              }
              label="Include archived journeys"
            />
          </FormGroup>
        }
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400
          }}
        >
          <CircularProgress />
        </Box>
      </Dialog>
    )
  }

  if (error != null) {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        dialogTitle={{
          title: 'Template Breakdown Analytics',
          closeButton: true
        }}
        divider
        maxWidth="xl"
        dialogActionChildren={
          <FormGroup
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-start'
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={includeArchivedJourneys}
                  onChange={() =>
                    setIncludeArchivedJourneys(!includeArchivedJourneys)
                  }
                />
              }
              label="Include archived journeys"
            />
          </FormGroup>
        }
      >
        <Box sx={{ p: 2 }}>
          <Typography color="error">
            Error loading template breakdown analytics: {error.message}
          </Typography>
        </Box>
      </Dialog>
    )
  }

  if (processedData == null) {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        dialogTitle={{
          title: 'Template Breakdown Analytics',
          closeButton: true
        }}
        divider
        maxWidth="xl"
        dialogActionChildren={
          <FormGroup
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-start'
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={includeArchivedJourneys}
                  onChange={() =>
                    setIncludeArchivedJourneys(!includeArchivedJourneys)
                  }
                />
              }
              label="Include archived journeys"
            />
          </FormGroup>
        }
      >
        <Box sx={{ p: 2 }}>
          <Typography>No data available</Typography>
        </Box>
      </Dialog>
    )
  }

  const { totalRow, regularRows, restrictedRow } = processedData
  const displayRows = regularRows.slice(0, 10)

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      dialogTitle={{ title: 'Template Breakdown Analytics', closeButton: true }}
      divider
      maxWidth="xl"
      dialogActionChildren={
        <FormGroup
          sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={includeArchivedJourneys}
                onChange={() =>
                  setIncludeArchivedJourneys(!includeArchivedJourneys)
                }
              />
            }
            label="Include archived journeys"
          />
        </FormGroup>
      }
      sx={{
        '& .MuiDialogContent-dividers': {
          px: 0
        }
      }}
    >
      <TableContainer
        sx={{
          maxHeight: 600,
          overflow: 'auto'
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columnHeaders.map((header) => (
                <TableCell
                  key={header.id}
                  sx={{
                    backgroundColor: 'background.paper',
                    fontWeight: 'bold'
                  }}
                >
                  <TableSortLabel
                    active={orderBy === header.id}
                    direction={orderBy === header.id ? order : 'asc'}
                    onClick={() => handleRequestSort(header.id)}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {header.id === 'views' && orderBy === 'views'
                          ? order === 'desc'
                            ? '↑ '
                            : '↓ '
                          : ''}
                        {header.label}
                      </Typography>
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
          </TableHead>
          <TableBody>
            <TableRow
              sx={{
                backgroundColor: 'action.hover',
                '& .MuiTableCell-root': {
                  fontWeight: 'bold',
                  backgroundColor: 'action.hover',
                  position: 'sticky',
                  top: 53,
                  zIndex: 1
                }
              }}
            >
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {totalRow.journeyName}
                </Typography>
              </TableCell>
              <TableCell>{totalRow.views}</TableCell>
              <TableCell>{totalRow.responses}</TableCell>
              <TableCell>{totalRow.christDecisionCapture}</TableCell>
              <TableCell>{totalRow.prayerRequestCapture}</TableCell>
              <TableCell>{totalRow.specialVideoStartCapture}</TableCell>
              <TableCell>{totalRow.specialVideoCompleteCapture}</TableCell>
              <TableCell>{totalRow.gospelStartCapture}</TableCell>
              <TableCell>{totalRow.gospelCompleteCapture}</TableCell>
              <TableCell>{totalRow.rsvpCapture}</TableCell>
              <TableCell>{totalRow.custom1Capture}</TableCell>
              <TableCell>{totalRow.custom2Capture}</TableCell>
              <TableCell>{totalRow.custom3Capture}</TableCell>
            </TableRow>
            {displayRows.map((row) => (
              <TableRow key={row.journeyId} hover>
                <TableCell>
                  <Link
                    component={NextLink}
                    href={`/journeys/${row.journeyId}`}
                    sx={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Typography variant="body2">{row.journeyName}</Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block' }}
                    >
                      {row.teamName}
                    </Typography>
                  </Link>
                </TableCell>
                <TableCell>{row.views}</TableCell>
                <TableCell>{row.responses}</TableCell>
                <TableCell>{row.christDecisionCapture}</TableCell>
                <TableCell>{row.prayerRequestCapture}</TableCell>
                <TableCell>{row.specialVideoStartCapture}</TableCell>
                <TableCell>{row.specialVideoCompleteCapture}</TableCell>
                <TableCell>{row.gospelStartCapture}</TableCell>
                <TableCell>{row.gospelCompleteCapture}</TableCell>
                <TableCell>{row.rsvpCapture}</TableCell>
                <TableCell>{row.custom1Capture}</TableCell>
                <TableCell>{row.custom2Capture}</TableCell>
                <TableCell>{row.custom3Capture}</TableCell>
              </TableRow>
            ))}
            {restrictedRow != null && (
              <TableRow>
                <TableCell>
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
                <TableCell>{restrictedRow.views}</TableCell>
                <TableCell>{restrictedRow.responses}</TableCell>
                <TableCell>{restrictedRow.christDecisionCapture}</TableCell>
                <TableCell>{restrictedRow.prayerRequestCapture}</TableCell>
                <TableCell>{restrictedRow.specialVideoStartCapture}</TableCell>
                <TableCell>
                  {restrictedRow.specialVideoCompleteCapture}
                </TableCell>
                <TableCell>{restrictedRow.gospelStartCapture}</TableCell>
                <TableCell>{restrictedRow.gospelCompleteCapture}</TableCell>
                <TableCell>{restrictedRow.rsvpCapture}</TableCell>
                <TableCell>{restrictedRow.custom1Capture}</TableCell>
                <TableCell>{restrictedRow.custom2Capture}</TableCell>
                <TableCell>{restrictedRow.custom3Capture}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Dialog>
  )
}
