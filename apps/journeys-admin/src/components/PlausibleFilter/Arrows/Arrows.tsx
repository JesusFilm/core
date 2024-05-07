import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import addDays from 'date-fns/addDays'
import addMonths from 'date-fns/addMonths'
import addYears from 'date-fns/addYears'
import isSameMonth from 'date-fns/isSameMonth'
import isSameYear from 'date-fns/isSameYear'
import isToday from 'date-fns/isToday'
import subDays from 'date-fns/subDays'
import subMonths from 'date-fns/subMonths'
import subYears from 'date-fns/subYears'
import { ReactElement } from 'react'

import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'

import { usePlausibleLocal } from '../../PlausibleLocalProvider'

export function Arrows(): ReactElement {
  const {
    state: { period, date },
    dispatch
  } = usePlausibleLocal()

  let disabled = false

  switch (period) {
    case 'day':
      disabled = isToday(date)
      break
    case 'month':
      disabled = isSameMonth(date, new Date())
      break
    case 'year':
      disabled = isSameYear(date, new Date())
      break
  }

  function addClick(): void {
    switch (period) {
      case 'day':
        dispatch({ type: 'SetPeriodAction', period, date: addDays(date, 1) })
        break
      case 'month':
        dispatch({ type: 'SetPeriodAction', period, date: addMonths(date, 1) })
        break
      case 'year':
        dispatch({ type: 'SetPeriodAction', period, date: addYears(date, 1) })
        break
    }
  }

  function subClick(): void {
    switch (period) {
      case 'day':
        dispatch({ type: 'SetPeriodAction', period, date: subDays(date, 1) })
        break
      case 'month':
        dispatch({ type: 'SetPeriodAction', period, date: subMonths(date, 1) })
        break
      case 'year':
        dispatch({ type: 'SetPeriodAction', period, date: subYears(date, 1) })
        break
    }
  }

  return (
    <ButtonGroup variant="outlined">
      <Button sx={{ px: 0 }} onClick={subClick}>
        <ChevronLeftIcon />
      </Button>
      <Button sx={{ px: 0 }} onClick={addClick} disabled={disabled}>
        <ChevronRightIcon />
      </Button>
    </ButtonGroup>
  )
}
