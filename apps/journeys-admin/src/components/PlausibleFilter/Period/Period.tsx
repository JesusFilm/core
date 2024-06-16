import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Menu from '@mui/material/Menu'
import MuiMenuItem from '@mui/material/MenuItem'
import isSameMonth from 'date-fns/isSameMonth'
import isSameYear from 'date-fns/isSameYear'
import isToday from 'date-fns/isToday'
import sub from 'date-fns/sub'
import { useTranslation } from 'next-i18next'
import { MouseEvent, ReactElement, useRef, useState } from 'react'
import { DateRange } from 'react-day-picker'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import {
  formatDateRange,
  formatDay,
  formatMonth
} from '../../../libs/plausible/formatters'
import { usePlausibleLocal } from '../../PlausibleLocalProvider'
import { RangePicker } from '../RangePicker'

import { MenuItem } from './MenuItem'
import 'react-day-picker/dist/style.css'

export function Period(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const ref = useRef<HTMLButtonElement | null>(null)
  const [rangePickerOpen, setRangePickerOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const {
    state: { period, comparison, periodRange, date },
    dispatch
  } = usePlausibleLocal()

  function handleClick(event: MouseEvent<HTMLButtonElement>): void {
    setAnchorEl(event.currentTarget)
  }

  function handleClose(): void {
    setAnchorEl(null)
  }

  function handleRangeSelect(range: DateRange): void {
    dispatch({
      type: 'SetPeriodRangeAction',
      range
    })
    dispatch({ type: 'SetPeriodAction', period: 'custom' })
    setRangePickerOpen(false)
  }

  function handleRenderValue(): string {
    if (period === 'day') {
      if (isToday(date)) return t('Today')
      return formatDay(date)
    }
    if (period === '7d') {
      return t('Last 7 days')
    }
    if (period === '30d') {
      return t('Last 30 days')
    }
    if (period === 'month') {
      if (isSameMonth(date, new Date())) return t('Month to Date')
      return formatMonth(date)
    }
    if (period === '6mo') {
      return t('Last 6 months')
    }
    if (period === '12mo') {
      return t('Last 12 months')
    }
    if (period === 'year') {
      if (isSameYear(date, new Date())) return t('Year to Date')
      return date.getFullYear().toString()
    }
    if (period === 'all') {
      return t('All time')
    }
    if (period === 'custom') {
      if (
        periodRange == null ||
        periodRange.from == null ||
        periodRange.to == null
      )
        return t('Custom range')
      return formatDateRange(periodRange.from, periodRange.to)
    }
    return t('Realtime')
  }

  return (
    <>
      <RangePicker
        onSelect={handleRangeSelect}
        onClose={() => setRangePickerOpen(false)}
        anchorEl={ref.current}
        open={rangePickerOpen}
      />
      <Button
        onClick={handleClick}
        variant="outlined"
        endIcon={<ChevronDownIcon />}
        ref={ref}
        sx={{ minWidth: 180, justifyContent: 'space-between' }}
      >
        {handleRenderValue()}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        slotProps={{ paper: { sx: { minWidth: 180 } } }}
      >
        <MenuItem
          value="day"
          setAnchorEl={setAnchorEl}
          selected={({ date }) => isToday(date)}
        >
          {t('Today')}
        </MenuItem>
        <MenuItem value="realtime" setAnchorEl={setAnchorEl}>
          {t('Realtime')}
        </MenuItem>
        <Divider />
        <MenuItem value="7d" setAnchorEl={setAnchorEl}>
          {t('Last 7 days')}
        </MenuItem>
        <MenuItem value="30d" setAnchorEl={setAnchorEl}>
          {t('Last 30 days')}
        </MenuItem>
        <Divider />
        <MenuItem
          value="month"
          setAnchorEl={setAnchorEl}
          selected={({ date }) => isSameMonth(date, new Date())}
        >
          {t('Month to Date')}
        </MenuItem>
        <MenuItem
          value="month"
          date={sub(new Date(), { months: 1 })}
          setAnchorEl={setAnchorEl}
          selected={({ date }) =>
            isSameMonth(date, sub(new Date(), { months: 1 }))
          }
        >
          {t('Last month')}
        </MenuItem>
        <Divider />
        <MenuItem
          value="year"
          setAnchorEl={setAnchorEl}
          selected={({ date }) => isSameYear(date, new Date())}
        >
          {t('Year to Date')}
        </MenuItem>
        <MenuItem value="12mo" setAnchorEl={setAnchorEl}>
          {t('Last 12 months')}
        </MenuItem>
        <Divider />
        <MenuItem value="all" setAnchorEl={setAnchorEl}>
          {t('All time')}
        </MenuItem>
        <MuiMenuItem
          value="custom"
          dense
          onClick={() => {
            if (period !== 'custom') dispatch({ type: 'SetPeriodRangeAction' })
            setRangePickerOpen(true)
            setAnchorEl(null)
          }}
        >
          {t('Custom range')}
        </MuiMenuItem>
        {period !== 'all' && <Divider />}
        {period !== 'all' && (
          <MuiMenuItem
            value="compare"
            dense
            onClick={() => {
              dispatch({
                type: 'SetComparisonAction',
                comparison: comparison != null ? undefined : 'previous_period'
              })
              setAnchorEl(null)
            }}
          >
            {comparison != null ? t('Disable comparison') : t('Compare')}
          </MuiMenuItem>
        )}
      </Menu>
    </>
  )
}
