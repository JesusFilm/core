import { ReactElement, useState } from 'react'
import capitalize from 'lodash/capitalize'
import Typography from '@mui/material/Typography'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { gql, useMutation } from '@apollo/client'
import { StyledToggleButton } from '../../../../../StyledToggleButton'
import { IconColor } from '../../../../../../../../../__generated__/globalTypes'
import { ColorDisplayIcon } from '../../../../../ColorDisplayIcon'
import { IconType } from '..'
import { ButtonBlockStartIconColorUpdate } from '../../../../../../../../../__generated__/ButtonBlockStartIconColorUpdate'
import { ButtonBlockEndIconColorUpdate } from '../../../../../../../../../__generated__/ButtonBlockEndIconColorUpdate'
import { useJourney } from '../../../../../../../../libs/context'

interface ColorToggleGroupProps {
  id: string
  color: IconColor | null | undefined
  type: IconType
}

export const BUTTON_START_ICON_COLOR_UPDATE = gql`
  mutation ButtonBlockStartIconColorUpdate(
    $id: ID!
    $journeyId: ID!
    $input: ButtonBlockUpdateInput!
  ) {
    buttonBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      startIcon {
        color
      }
    }
  }
`

export const BUTTON_END_ICON_COLOR_UPDATE = gql`
  mutation ButtonBlockEndIconColorUpdate(
    $id: ID!
    $journeyId: ID!
    $input: ButtonBlockUpdateInput!
  ) {
    buttonBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      endIcon {
        color
      }
    }
  }
`

export function ColorToggleGroup({
  id,
  color,
  type
}: ColorToggleGroupProps): ReactElement {
  const [buttonBlockStartIconColorUpdate] =
    useMutation<ButtonBlockStartIconColorUpdate>(BUTTON_START_ICON_COLOR_UPDATE)
  const [buttonBlockEndIconColorUpdate] =
    useMutation<ButtonBlockEndIconColorUpdate>(BUTTON_END_ICON_COLOR_UPDATE)

  const journey = useJourney()

  const [selected, setSelected] = useState(color ?? IconColor.inherit)
  const order = [
    'inherit',
    'primary',
    'secondary',
    'error',
    'action',
    'disabled'
  ]
  const colorSorted = Object.values(IconColor).sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  )

  async function changeIconColor(
    color: IconColor,
    type: IconType
  ): Promise<void> {
    if (type === IconType.start) {
      await buttonBlockStartIconColorUpdate({
        variables: {
          id,
          journeyId: journey.id,
          input: {
            startIcon: {
              color
            }
          }
        }
      })
    } else {
      await buttonBlockEndIconColorUpdate({
        variables: {
          id,
          journeyId: journey.id,
          input: {
            endIcon: {
              color
            }
          }
        }
      })
    }
  }

  async function handleChange(
    event: React.MouseEvent<HTMLElement>,
    color: IconColor
  ): Promise<void> {
    if (color != null) {
      await changeIconColor(color, type)
      setSelected(color)
    }
  }
  return (
    <>
      <Typography variant="subtitle2" color="secondary.dark">
        Color
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
        {colorSorted.map((color) => {
          return (
            <StyledToggleButton
              value={color}
              key={`button-icon-color-${color}`}
              sx={{ justifyContent: 'flex-start' }}
            >
              {/* Bug in ColorDisplayIcon not showing correct colors */}
              <ColorDisplayIcon color={color} />
              <Typography variant="subtitle2" sx={{ pl: 2 }}>
                {capitalize(color)}
              </Typography>
            </StyledToggleButton>
          )
        })}
      </ToggleButtonGroup>
    </>
  )
}
