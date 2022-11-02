import { ReactElement } from 'react'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { format, parseISO } from 'date-fns'
import { VisitorJourneyTimeline } from '../../VisitorJourneyTimeline'
import { JourneyWithEvents } from '../../transformVisitorEvents'
import { useVisitorInfo } from '../../VisitorInfoProvider'

interface Props {
  journey: JourneyWithEvents
  selected: boolean
}

export function VisitorJourneyListItem({
  journey,
  selected
}: Props): ReactElement {
  const { dispatch } = useVisitorInfo()
  const { title, subtitle, createdAt, events } = journey

  function handleClick(): void {
    dispatch({
      type: 'SetJourneyAction',
      journey: journey
    })
  }
  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: { sm: selected ? 'primary.main' : undefined }
      }}
    >
      <CardContent sx={{ pb: 0 }}>
        <Stack direction="row">
          <Box flex={1}>
            <Typography
              variant="h5"
              component="div"
              sx={{ color: { sm: selected ? 'primary.main' : undefined } }}
            >
              {title}
            </Typography>

            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
          {createdAt != null && (
            <Typography>{format(parseISO(createdAt), 'MMM d')}</Typography>
          )}
        </Stack>
        <VisitorJourneyTimeline
          events={events}
          variant="compact"
          filter={[
            'TextResponseSubmissionEvent',
            'RadioQuestionSubmissionEvent'
          ]}
        />
      </CardContent>
      <CardActions>
        <Button onClick={handleClick}>View Timeline</Button>
      </CardActions>
    </Card>
  )
}
