import { ReactElement } from 'react'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'

interface Props {
  value: string
  handleClick: () => void
}

export function CompactEvent({ value, handleClick }: Props): ReactElement {
  return (
    <TimelineItem
      sx={{
        '&:before': {
          flex: 0,
          padding: 0
        }
      }}
    >
      <TimelineSeparator sx={{ ml: '17px' }}>
        <TimelineConnector />
      </TimelineSeparator>

      <TimelineContent
        sx={{
          p: 2,
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Divider sx={{ width: '100%' }}>
          <Chip
            label={value}
            onClick={handleClick}
            variant="outlined"
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 8,
              px: 3
            }}
          />
        </Divider>
      </TimelineContent>
    </TimelineItem>
  )
}
