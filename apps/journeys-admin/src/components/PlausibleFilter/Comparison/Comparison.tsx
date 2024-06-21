import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useTranslation } from 'next-i18next'
import { MouseEvent, ReactElement, useRef, useState } from 'react'
import { DateRange } from 'react-day-picker'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { formatDateRange } from '../../../libs/plausible/formatters'
import { usePlausibleLocal } from '../../PlausibleLocalProvider'
import { RangePicker } from '../RangePicker'

import 'react-day-picker/dist/style.css'

export function Comparison(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const ref = useRef<HTMLButtonElement | null>(null)
  const [rangePickerOpen, setRangePickerOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const {
    state: { comparison, matchDayOfWeek, comparisonRange },
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
      type: 'SetComparisonRangeAction',
      range
    })
    dispatch({ type: 'SetComparisonAction', comparison: 'custom' })
    setRangePickerOpen(false)
  }

  function handleRenderValue(): string | undefined {
    switch (comparison) {
      case 'previous_period':
        return t('Previous period')
      case 'year_over_year':
        return t('Year over year')
      case 'custom':
        if (
          comparisonRange == null ||
          comparisonRange.from == null ||
          comparisonRange.to == null
        )
          return t('Custom range')
        return formatDateRange(comparisonRange.from, comparisonRange.to)
    }
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
        color="secondary"
        endIcon={<ChevronDownIcon />}
        ref={ref}
        sx={{ minWidth: 180, justifyContent: 'space-between',
        backgroundColor: 'background.paper',
        ':hover': {
        backgroundColor: 'background.paper',
        }
       }}
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
          dense
          onClick={() => {
            dispatch({ type: 'SetComparisonAction', comparison: undefined })
            setAnchorEl(null)
          }}
        >
          {t('Disable comparison')}
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            dispatch({
              type: 'SetComparisonAction',
              comparison: 'previous_period'
            })
            setAnchorEl(null)
          }}
          selected={comparison === 'previous_period'}
        >
          {t('Previous period')}
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            dispatch({
              type: 'SetComparisonAction',
              comparison: 'year_over_year'
            })
            setAnchorEl(null)
          }}
          selected={comparison === 'year_over_year'}
        >
          {t('Year over year')}
        </MenuItem>
        <MenuItem
          value="custom"
          dense
          onClick={() => {
            if (comparison !== 'custom')
              dispatch({ type: 'SetComparisonRangeAction' })
            setRangePickerOpen(true)
            setAnchorEl(null)
          }}
          selected={comparison === 'custom'}
        >
          {t('Custom period')}
        </MenuItem>
        {comparison !== 'custom' && <Divider />}
        {comparison !== 'custom' && (
          <MenuItem
            dense
            onClick={() => {
              dispatch({
                type: 'SetMatchDayOfWeekAction',
                matchDayOfWeek: true
              })
              setAnchorEl(null)
            }}
            selected={matchDayOfWeek}
          >
            {t('Match day of the week')}
          </MenuItem>
        )}
        {comparison !== 'custom' && (
          <MenuItem
            dense
            onClick={() => {
              dispatch({
                type: 'SetMatchDayOfWeekAction',
                matchDayOfWeek: false
              })
              setAnchorEl(null)
            }}
            selected={!matchDayOfWeek}
          >
            {t('Match exact date')}
          </MenuItem>
        )}
      </Menu>
    </>
  )
}
