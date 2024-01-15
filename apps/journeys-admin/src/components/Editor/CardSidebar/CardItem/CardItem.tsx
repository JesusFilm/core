import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import { ReactElement, ReactNode } from 'react'

interface CardItemProps {
  children: ReactNode | ReactNode[]
  onClick?: () => void
  selected?: boolean
  sx?: SxProps
}
export function CardItem({
  children,
  selected,
  onClick,
  sx
}: CardItemProps): ReactElement {
  return (
    <Stack
      onClick={onClick}
      sx={{
        flexDirection: 'row',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        backgroundColor: selected === true ? 'divider' : undefined,
        borderRadius: 2,
        cursor: 'pointer',
        transition: (theme) => theme.transitions.create('background-color'),
        '> div': {
          backgroundColor: selected === true ? 'background.paper' : undefined,
          transition: (theme) => theme.transitions.create('background-color')
        },
        '&:hover': {
          backgroundColor: 'divider',
          '> div': {
            backgroundColor: 'background.paper'
          }
        },
        ...sx
      }}
    >
      {children}
    </Stack>
  )
}
