import { ReactElement, useState } from 'react'
import capitalize from 'lodash/capitalize'
import Typography from '@mui/material/Typography'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { gql, useMutation } from '@apollo/client'
import { StyledToggleButton } from '../../../../../StyledToggleButton'
import { IconSize } from '../../../../../../../../../__generated__/globalTypes'
import { IconType } from '..'
import { ButtonBlockStartIconSizeUpdate } from '../../../../../../../../../__generated__/ButtonBlockStartIconSizeUpdate'
import { ButtonBlockEndIconSizeUpdate } from '../../../../../../../../../__generated__/ButtonBlockEndIconSizeUpdate'
import { useJourney } from '../../../../../../../../libs/context'

interface SizeToggleGroupProps {
  id: string
  size: IconSize | null | undefined
  type: IconType
}

enum IconSizeName {
  sm = 'small',
  md = 'medium',
  lg = 'large',
  xl = 'extra large',
  inherit = 'inherit'
}

export const BUTTON_START_ICON_SIZE_UPDATE = gql`
  mutation ButtonBlockStartIconSizeUpdate(
    $id: ID!
    $journeyId: ID!
    $input: ButtonBlockUpdateInput!
  ) {
    buttonBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      startIcon {
        size
      }
    }
  }
`

export const BUTTON_END_ICON_SIZE_UPDATE = gql`
  mutation ButtonBlockEndIconSizeUpdate(
    $id: ID!
    $journeyId: ID!
    $input: ButtonBlockUpdateInput!
  ) {
    buttonBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      endIcon {
        size
      }
    }
  }
`

export function SizeToggleGroup({
  id,
  size,
  type
}: SizeToggleGroupProps): ReactElement {
  const [buttonBlockStartIconSizeUpdate] =
    useMutation<ButtonBlockStartIconSizeUpdate>(BUTTON_START_ICON_SIZE_UPDATE)
  const [buttonBlockEndIconSizeUpdate] =
    useMutation<ButtonBlockEndIconSizeUpdate>(BUTTON_END_ICON_SIZE_UPDATE)

  const journey = useJourney()

  const [selected, setSelected] = useState(size ?? IconSize.md)
  const order = ['sm', 'md', 'lg', 'xl', 'inherit']
  const sorted = Object.values(IconSize).sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  )

  async function changeIconSize(size: IconSize, type: IconType): Promise<void> {
    console.log(size)
    if (type === IconType.start) {
      await buttonBlockStartIconSizeUpdate({
        variables: {
          id,
          journeyId: journey.id,
          input: {
            startIcon: {
              size
            }
          }
        }
      })
    } else {
      await buttonBlockEndIconSizeUpdate({
        variables: {
          id,
          journeyId: journey.id,
          input: {
            endIcon: {
              size
            }
          }
        }
      })
    }
  }

  async function handleChange(
    event: React.MouseEvent<HTMLElement>,
    size: IconSize
  ): Promise<void> {
    if (size != null) {
      await changeIconSize(size, type)
      setSelected(size)
    }
  }
  return (
    <>
      <Typography variant="subtitle2" color="secondary.dark">
        Size
      </Typography>
      <ToggleButtonGroup
        orientation="vertical"
        value={selected}
        exclusive
        onChange={handleChange}
        fullWidth
        sx={{ display: 'flex', py: 4 }}
        color="primary"
      >
        {sorted.map((size) => {
          return (
            <StyledToggleButton
              value={size}
              key={`button-icon-size-${size}`}
              sx={{ justifyContent: 'flex-start' }}
            >
              {/* Icon */}
              <Typography variant="subtitle2" sx={{ pl: 2 }}>
                {capitalize(IconSizeName[size])}
              </Typography>
            </StyledToggleButton>
          )
        })}
      </ToggleButtonGroup>
    </>
  )
}
