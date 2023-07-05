import { ReactElement, ReactNode } from 'react'
import { styled } from '@mui/material/styles'
import Button, { ButtonProps } from '@mui/material/Button'

const StyledButton = styled(Button)<ButtonProps>(({ theme }) => ({
  minWidth: 56,
  borderRadius: 20,
  backgroundColor: theme.palette.grey[800],
  '&.hover': {
    backgroundColor: theme.palette.grey[800]
  },
  color: theme.palette.grey[100],
  [theme.breakpoints.down('sm')]: {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? `${theme.palette.grey[200]}26`
        : `${theme.palette.grey[200]}4D`,
    '&.hover': {
      backgroundColor:
        theme.palette.mode === 'dark'
          ? `${theme.palette.grey[200]}26`
          : `${theme.palette.grey[200]}4D`
    },
    border: theme.palette.mode === 'dark' ? 'none' : '0.8px solid #0000000D',
    color:
      theme.palette.mode === 'dark'
        ? `${theme.palette.grey[200]}FF`
        : `${theme.palette.grey[800]}FF`
  }
}))

interface Props {
  handleClick: () => void
  children: ReactNode
}

export function CustomChip({ handleClick, children }: Props): ReactElement {
  return <StyledButton onClick={handleClick}>{children}</StyledButton>
}
