import { ReactElement, useState } from 'react'
import capitalize from 'lodash/capitalize'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { gql, useMutation } from '@apollo/client'
import { TypographyColor } from '../../../../../../../../__generated__/globalTypes'
import { ColorDisplayIcon } from '../../../../ColorDisplayIcon'
import { StyledToggleButton } from '../../../../StyledToggleButton'
import { TypographyBlockUpdate } from '../../../../../../../../__generated__/TypographyBlockUpdate'
import { useJourney } from '../../../../../../../libs/context'

interface ColorProps {
  id: string
  color: TypographyColor | null
}

export const TYPOGRAPHY_BLOCK_UPDATE = gql`
  mutation TypographyBlockUpdateColor(
    $id: ID!
    $journeyId: ID!
    $input: TypographyBlockUpdateInput!
  ) {
    typographyBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      color
    }
  }
`

export function Color({ id, color }: ColorProps): ReactElement {
  const [typographyBlockUpdate] = useMutation<TypographyBlockUpdate>(
    TYPOGRAPHY_BLOCK_UPDATE
  )

  const journey = useJourney()
  const [selected, setSelected] = useState(color ?? 'primary')

  async function handleChange(
    event: React.MouseEvent<HTMLElement>,
    color: TypographyColor
  ): Promise<void> {
    if (color != null) {
      await typographyBlockUpdate({
        variables: {
          id,
          journeyId: journey.id,
          input: { color }
        }
      })
      setSelected(color)
    }
  }

  const order = ['primary', 'secondary', 'error']
  const sorted = Object.values(TypographyColor).sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  )

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
            key={`$typography-color-${color}`}
            sx={{ justifyContent: 'flex-start' }}
          >
            <ColorDisplayIcon color={color} />
            <Typography variant="subtitle2" sx={{ pl: 2 }}>
              {capitalize(color)}
            </Typography>
          </StyledToggleButton>
        )
      })}
    </ToggleButtonGroup>
  )
}
