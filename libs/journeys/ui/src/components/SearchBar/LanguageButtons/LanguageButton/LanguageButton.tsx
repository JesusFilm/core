import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import { ComponentProps, MouseEventHandler, ReactElement } from 'react'

import ChevronDown from '@core/shared/ui/icons/ChevronDown'
import Globe1Icon from '@core/shared/ui/icons/Globe1'
import X2Icon from '@core/shared/ui/icons/X2'

const StyledButton = styled(Button)(({ theme }) => ({
  minWidth: 168,
  borderRadius: 32,
  gap: 0,
  padding: '8px 20px 8px 20px',
  border: `2px solid ${theme.palette.text.primary}${
    theme.palette.mode === 'dark' ? '2E' : '1A'
  }`,
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.down('lg')]: {
    padding: 4
  }
}))

interface LanguageButtonProps {
  content: string
  index?: number
  isDropdown?: boolean
  handleClick?: MouseEventHandler<HTMLButtonElement> | undefined
  props?: ComponentProps<typeof Button>
}

export function LanguageButton({
  content,
  index,
  isDropdown = true,
  handleClick,
  ...props
}: LanguageButtonProps): ReactElement {
  return (
    <StyledButton
      key={index}
      size="small"
      color="inherit"
      onClick={handleClick}
      startIcon={<Globe1Icon />}
      endIcon={isDropdown ? <ChevronDown /> : <X2Icon />}
      {...props}
    >
      {content}
    </StyledButton>
  )
}
