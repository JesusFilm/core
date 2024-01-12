import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useRouter } from 'next/router'
import { ReactElement, ReactNode } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'

import { setBeaconPageViewed } from '../../../../../libs/setBeaconPageViewed'
import { Accordion } from '../../Accordion'
import { Button } from '../../Button'

interface AttributeProps {
  id: string
  icon: ReactElement
  name: string
  value: string
  description: string
  drawerTitle: string
  children: ReactNode
  testId?: string
  param?: string
}

export function Attribute({
  id,
  testId,
  drawerTitle,
  param,
  children,
  ...props
}: AttributeProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const router = useRouter()
  const {
    state: { selectedAttributeId },
    dispatch
  } = useEditor()

  const handleClick = (): void => {
    dispatch({ type: 'SetSelectedAttributeIdAction', id })
    dispatch({
      type: 'SetDrawerPropsAction',
      title: drawerTitle,
      children,
      mobileOpen: true
    })
    if (param != null) {
      router.query.param = param
      void router.push(router)
      router.events.on('routeChangeComplete', () => {
        setBeaconPageViewed(param)
      })
    }
  }

  return smUp ? (
    <Accordion
      {...props}
      expanded={id === selectedAttributeId}
      onClick={handleClick}
      testId={testId ?? 'Attribute'}
    >
      {children}
    </Accordion>
  ) : (
    <Button
      {...props}
      selected={id === selectedAttributeId}
      onClick={handleClick}
      testId={testId ?? 'Attribute'}
    />
  )
}
