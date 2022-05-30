import { ReactElement } from 'react'
import { useRouter } from 'next/router'
import MuiButton from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useMutation, gql } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'
import TagManager from 'react-gtm-module'
import {
  handleAction,
  TreeBlock,
  useJourney,
  useBlocks,
  getStepHeading
} from '../..'
import { ButtonVariant } from '../../../__generated__/globalTypes'
import { IconFields } from '../Icon/__generated__/IconFields'
import { Icon } from '../Icon'
import { ButtonFields } from './__generated__/ButtonFields'
import { ButtonClickEventCreate } from './__generated__/ButtonClickEventCreate'

export const BUTTON_CLICK_EVENT_CREATE = gql`
  mutation ButtonClickEventCreate($input: ButtonClickEventCreateInput!) {
    buttonClickEventCreate(input: $input) {
      id
    }
  }
`

export interface ButtonProps extends TreeBlock<ButtonFields> {
  editableLabel?: ReactElement
}

export function Button({
  id: blockId,
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
  const [buttonClickEventCreate] = useMutation<ButtonClickEventCreate>(
    BUTTON_CLICK_EVENT_CREATE
  )

  const { admin } = useJourney()
  const { treeBlocks, activeBlock } = useBlocks()

  const heading =
    activeBlock != null
      ? getStepHeading(activeBlock.id, activeBlock.children, treeBlocks)
      : 'None'

  const startIcon = children.find((block) => block.id === startIconId) as
    | TreeBlock<IconFields>
    | undefined

  const endIcon = children.find((block) => block.id === endIconId) as
    | TreeBlock<IconFields>
    | undefined

  function createEvent(): void {
    if (!admin) {
      const id = uuidv4()
      void buttonClickEventCreate({
        variables: {
          input: {
            id,
            blockId
          }
        }
      })
      TagManager.dataLayer({
        dataLayer: {
          event: 'button_click',
          eventId: id,
          blockId,
          stepName: heading
        }
      })
    }
  }

  const router = useRouter()
  const handleClick = async (): Promise<void> => {
    void createEvent()
    handleAction(router, action)
  }

  return (
    // Margin added via Box so it's ignored by admin selection border outline
    <Box
      sx={{
        mb: 4,
        mt:
          size === 'large'
            ? 6
            : size === 'medium'
            ? 5
            : size === 'small'
            ? 4
            : 5
      }}
    >
      <MuiButton
        variant={buttonVariant ?? ButtonVariant.contained}
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
      </MuiButton>
    </Box>
  )
}
