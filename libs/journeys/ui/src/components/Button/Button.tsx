import { ReactElement } from 'react'
import { useRouter } from 'next/router'
import { styled } from '@mui/material/styles'
import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button'
import Box from '@mui/material/Box'
import { handleAction, TreeBlock } from '../..'
import { ButtonVariant } from '../../../__generated__/globalTypes'
import { IconFields } from '../Icon/__generated__/IconFields'
import { Icon } from '../Icon'
import { ButtonFields } from './__generated__/ButtonFields'

export interface ButtonProps extends TreeBlock<ButtonFields> {
  editableLabel?: ReactElement
}

const StyledButton = styled(MuiButton)<MuiButtonProps>(({ theme, size }) => ({
  minHeight:
    size === 'large' ? '42px' : size === 'medium' ? '36.5px' : '30.75px',
  borderRadius: size === 'large' ? '16px' : size === 'medium' ? '12px' : '8px',
  fontWeight: size === 'small' ? undefined : 700
}))

export function Button({
  buttonVariant,
  label,
  buttonColor,
  size,
  startIconId,
  endIconId,
  action,
  children,
  editableLabel
}: ButtonProps): ReactElement {
  const startIcon = children.find((block) => block.id === startIconId) as
    | TreeBlock<IconFields>
    | undefined

  const endIcon = children.find((block) => block.id === endIconId) as
    | TreeBlock<IconFields>
    | undefined

  const router = useRouter()
  const handleClick = (): void => {
    handleAction(router, action)
  }

  return (
    // Margin-bottom added via Box so it's ignored by admin selection border outline
    <Box
      sx={{
        mb: size === 'large' ? 3 : size === 'medium' ? 2 : 1
      }}
    >
      <StyledButton
        variant={buttonVariant ?? 'contained'}
        color={buttonColor ?? undefined}
        size={size ?? undefined}
        startIcon={startIcon != null ? <Icon {...startIcon} /> : undefined}
        endIcon={endIcon != null ? <Icon {...endIcon} /> : undefined}
        onClick={handleClick}
        fullWidth
        sx={
          editableLabel != null
            ? {
                '&:hover': {
                  backgroundColor:
                    buttonVariant === ButtonVariant.text
                      ? 'transparent'
                      : `${buttonColor ?? 'primary'}.main`
                }
              }
            : undefined
        }
      >
        {editableLabel ?? label}
      </StyledButton>
    </Box>
  )
}
