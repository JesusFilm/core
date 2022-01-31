import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { ReactElement, useState } from 'react'
import capitalize from 'lodash/capitalize'
import Typography from '@mui/material/Typography'
import { gql, useMutation } from '@apollo/client'
import { ButtonColor } from '../../../../../../../../__generated__/globalTypes'
import { StyledToggleButton } from '../../../../StyledToggleButton'
import { ColorDisplayIcon } from '../../../../ColorDisplayIcon'
import { ButtonBlockUpdateColor } from '../../../../../../../../__generated__/ButtonBlockUpdateColor'
import { useJourney } from '../../../../../../../libs/context'

interface ColorProps {
  id: string
  color: ButtonColor | null
}

export const BUTTON_BLOCK_UPDATE = gql`
  mutation ButtonBlockUpdateColor(
    $id: ID!
    $journeyId: ID!
    $input: ButtonBlockUpdateInput!
  ) {
    buttonBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      color
    }
  }
`

export function Color({ id, color }: ColorProps): ReactElement {
  const [buttonBlockUpdate] =
    useMutation<ButtonBlockUpdateColor>(BUTTON_BLOCK_UPDATE)

  const journey = useJourney()
  const [selected, setSelected] = useState(color ?? ButtonColor.primary)

  const order = ['inherit', 'primary', 'secondary', 'error']
  const sorted = Object.values(ButtonColor).sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  )

  async function handleChange(
    event: React.MouseEvent<HTMLElement>,
    color: ButtonColor
  ): Promise<void> {
    if (color != null) {
      await buttonBlockUpdate({
        variables: {
          id,
          journeyId: journey.id,
          input: { color }
        }
      })
      setSelected(color)
    }
  }

  return (
    <ToggleButtonGroup
      orientation="vertical"
      value={selected}
      exclusive
      onChange={handleChange}
      fullWidth
      sx={{ display: 'flex', px: 6, py: 4 }}
      color="primary"
    >
      {sorted.map((color) => {
        return (
          <StyledToggleButton
            value={color}
            key={`button-color-${color}`}
            sx={{ justifyContent: 'flex-start' }}
          >
            <ColorDisplayIcon color={color} />
            <Typography variant="subtitle2" sx={{ pl: 2 }}>
              {capitalize(color === ButtonColor.inherit ? 'default' : color)}
            </Typography>
          </StyledToggleButton>
        )
      })}
    </ToggleButtonGroup>
  )
}
