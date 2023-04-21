import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { Event } from '../../JourneyList'

interface Props {
  events: Event[]
  open: boolean
}

export function EventsList({ events, open }: Props): ReactElement {
  const toSort: number[] = [1, 2, 2, 3, 4, 4, 5]
  let res: Array<number | number[]> = []
  let pointer = 0
  toSort.forEach((number) => {
    if (number % 2 !== 0) {
      if (res[pointer] != null) pointer++
      res = [...res, number]
      pointer++
    } else {
      const val = res[pointer]
      if (val == null) {
        res = [...res, [number]]
      } else if (Array.isArray(val)) {
        val.push(number)
      }
    }
  })

  console.log(res)

  return (
    <Box sx={{ p: 6 }}>
      {events.map((event) => {
        if (open) {
          return <Typography key={event.id}>{event.value}</Typography>
        } else if (!open && event.summaryEvent) {
          return <Typography key={event.id}>{event.value}</Typography>
        } else {
          return <></>
        }
        // return <Typography key={event.id}>{event.value}</Typography>
      })}
    </Box>
  )
}
