import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import { ReactElement } from 'react'

interface Props {
  value: string
  handleClick: () => void
}

export function CompactEvent({ value, handleClick }: Props): ReactElement {
  return (
    <TimelineItem
      sx={{
        minHeight: '56px',
        maxHeight: '56px',
        '&:before': {
          flex: 0
        }
      }}
    >
      <TimelineSeparator sx={{ ml: '41px', mr: '26px' }}>
        <TimelineConnector sx={{ flexGrow: '2' }} />
      </TimelineSeparator>

      <TimelineContent
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
          pt: 2,
          px: 2,
          pb: 5
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
              py: 0,
              px: 3
            }}
          />
        </Divider>
      </TimelineContent>
    </TimelineItem>
  )
}
