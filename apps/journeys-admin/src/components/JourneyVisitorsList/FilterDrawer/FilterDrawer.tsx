import { gql, useLazyQuery, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import IconButton from '@mui/material/IconButton'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { stringify } from 'csv-stringify/sync'
import { format } from 'date-fns'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import X2Icon from '@core/shared/ui/icons/X2'

import { ClearAllButton } from './ClearAllButton'

const EVENT_CSV_OPTIONS = {
  header: true,
  columns: [
    'id',
    'journeyId',
    'createdAt',
    'label',
    'value',
    'typename',
    // 'blockId',
    'action',
    'actionValue',
    'messagePlatform',
    'languageId',
    'email',
    'position',
    'source',
    'progress',
    'updatedAt',
    'journeyName',
    'visitorId',
    'visitorName'
  ]
}

interface FilterDrawerProps {
  handleClose?: () => void
  handleChange?: (e) => void
  sortSetting?: 'date' | 'duration'
  chatStarted: boolean
  withPollAnswers: boolean
  withSubmittedText: boolean
  withIcon: boolean
  hideInteractive: boolean
  handleClearAll?: () => void
  journeyId?: string
}

export const GET_JOURNEY_EVENTS_EXPORT = gql`
  query GetJourneyEvents(
    $journeyId: ID!
    $filter: JourneyEventsFilter
    $first: Int
    $after: String
  ) {
    journeyEventsConnection(
      journeyId: $journeyId
      filter: $filter
      first: $first
      after: $after
    ) {
      edges {
        node {
          id
          journeyId
          createdAt
          label
          value
          action
          actionValue
          messagePlatform
          language {
            id
            name(primary: true) {
              value
            }
          }
          email
          blockId
          position
          source
          progress
          typename
          visitorId
          journey {
            title
            slug
          }
          visitor {
            name
            email
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`

export const CREATE_EVENTS_EXPORT_LOG = gql`
  mutation CreateEventsExportLog($input: JourneyEventsExportLogInput!) {
    createJourneyEventsExportLog(input: $input) {
      id
    }
  }
`

export function FilterDrawer({
  journeyId,
  handleClose,
  handleChange,
  sortSetting,
  chatStarted,
  withPollAnswers,
  withSubmittedText,
  withIcon,
  hideInteractive,
  handleClearAll
}: FilterDrawerProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [getJourneyEvents] = useLazyQuery(GET_JOURNEY_EVENTS_EXPORT)
  const [createEventsExportLog] = useMutation(CREATE_EVENTS_EXPORT_LOG)
  const { enqueueSnackbar } = useSnackbar()

  const handleExport = async (): Promise<void> => {
    if (journeyId == null) return

    const events: any[] = []
    let cursor: string | null = null
    let hasNextPage = false

    try {
      do {
        const { data } = await getJourneyEvents({
          variables: {
            journeyId,
            first: 50,
            after: cursor
          }
        })

        if (data?.journeyEventsConnection == null) {
          throw new Error(t('Failed to retrieve data for export.'))
        }

        const edges = data?.journeyEventsConnection.edges ?? []
        events.push(...edges)

        cursor = data?.journeyEventsConnection.pageInfo.endCursor
        hasNextPage = data?.journeyEventsConnection.pageInfo.hasNextPage
      } while (hasNextPage)

      if (events.length === 0) return

      const eventData = events.map((edge) => {
        return {
          ...edge.node,
          journeyName: edge.node.journey.title,
          visitorName: edge.node.visitor?.name ?? ''
        }
      })

      const journey = events[0].node.journey

      const csv = stringify(eventData, EVENT_CSV_OPTIONS)

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })

      const url = window.URL.createObjectURL(blob)

      const today = format(new Date(), 'yyyy-MM-dd')
      const fileName = `[${today}] ${journey.slug}.csv`

      const link = document.createElement('a')
      link.target = '_blank'
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)

      link.click()

      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      await createEventsExportLog({
        variables: {
          input: {
            journeyId,
            eventsFilter: []
            // eventsFilter: ['JourneyViewEvent', 'ButtonClickEvent'],
            // preiodRangeStart: '2025-03-01T00:00:00Z',
            // periodRangeEnd: '2025-03-25T00:00:00Z'
          }
        }
      })
    } catch (error) {
      enqueueSnackbar(error.message, {
        variant: 'error'
      })
    }
  }

  return (
    <Stack sx={{ height: '100vh' }} data-testid="FilterDrawer">
      <Box sx={{ display: { sm: 'block', md: 'none' } }}>
        <Stack direction="row" sx={{ px: 6, py: 2 }} alignItems="center">
          <Typography variant="subtitle1">{t('Refine Results')}</Typography>
          <IconButton sx={{ ml: 'auto' }}>
            <X2Icon onClick={handleClose} />
          </IconButton>
        </Stack>
        <Divider />
      </Box>

      <Box sx={{ px: 6, py: 5 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle2">{t('Filter By')}</Typography>
          <ClearAllButton handleClearAll={handleClearAll} />
        </Stack>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox />}
            label={t('Chat Started')}
            value="Chat Started"
            onChange={handleChange}
            checked={chatStarted}
          />
          <FormControlLabel
            control={<Checkbox />}
            label={t('With Poll Answers')}
            value="With Poll Answers"
            onChange={handleChange}
            checked={withPollAnswers}
          />
          <FormControlLabel
            control={<Checkbox />}
            label={t('With Submitted Text')}
            value="With Submitted Text"
            onChange={handleChange}
            checked={withSubmittedText}
          />
          <FormControlLabel
            control={<Checkbox />}
            label={t('With Icon')}
            value="With Icon"
            onChange={handleChange}
            checked={withIcon}
          />
          <FormControlLabel
            control={<Checkbox />}
            label={t('Hide Inactive')}
            value="Hide Inactive"
            onChange={handleChange}
            checked={hideInteractive}
          />
        </FormGroup>
      </Box>

      <Divider />

      <Box sx={{ px: 6, py: 5 }}>
        <Typography variant="subtitle2">{t('Sort By')}</Typography>
        <RadioGroup
          aria-labelledby="journeys-sort-radio-buttons-group"
          defaultValue="date"
          name="journeys-sort-radio-group"
        >
          <FormControlLabel
            value="date"
            control={<Radio />}
            label={t('Date')}
            onChange={handleChange}
            checked={sortSetting === 'date'}
          />
          <FormControlLabel
            value="duration"
            control={<Radio />}
            label={t('Duration')}
            onChange={handleChange}
            checked={sortSetting === 'duration'}
          />
        </RadioGroup>
      </Box>

      {journeyId != null && (
        <Box sx={{ px: 6, py: 5, mt: 'auto' }}>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={handleExport}
          >
            {t('Export Data')}
          </Button>
        </Box>
      )}
    </Stack>
  )
}
