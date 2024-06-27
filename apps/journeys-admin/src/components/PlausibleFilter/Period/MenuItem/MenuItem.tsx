import MuiMenuItem from '@mui/material/MenuItem'
import { ReactElement, ReactNode } from 'react'

import {
  PlausibleLocalState,
  PlausiblePeriod,
  usePlausibleLocal
} from '../../../PlausibleLocalProvider'

interface MenuItemProps {
  setAnchorEl: (value: HTMLButtonElement | null) => void
  value: PlausiblePeriod
  date?: Date
  selected?: (state: PlausibleLocalState) => boolean
  children?: ReactNode
}

export function MenuItem({
  setAnchorEl,
  value,
  date = new Date(),
  selected,
  children
}: MenuItemProps): ReactElement {
  const { state, dispatch } = usePlausibleLocal()

  return (
    <MuiMenuItem
      value="30d"
      dense
      onClick={() => {
        dispatch({
          type: 'SetPeriodAction',
          period: value,
          date
        })
        setAnchorEl(null)
      }}
      selected={state.period === value && (selected == null || selected(state))}
    >
      {children}
    </MuiMenuItem>
  )
}
