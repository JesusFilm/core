import Box from '@mui/material/Box'
import { ReactElement, createContext, forwardRef, useContext } from 'react'

export const OuterElementContext = createContext({})

export const OuterElement = forwardRef<HTMLDivElement>(
  function OuterElement(props, ref): ReactElement {
    const outerProps = useContext(OuterElementContext)
    return <Box ref={ref} {...props} {...outerProps} />
  }
)
