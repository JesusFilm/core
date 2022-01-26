import { ReactElement, useState } from 'react'
import capitalize from 'lodash/capitalize'
import lowerCase from 'lodash/lowerCase'
import Typography from '@mui/material/Typography'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { gql, useMutation } from '@apollo/client'
import HorizontalRuleRoundedIcon from '@mui/icons-material/HorizontalRuleRounded'
import { TypographyVariant } from '../../../../../../../../__generated__/globalTypes'
import { StyledToggleButton } from '../../../../StyledToggleButton'
import { TypographyBlockUpdate } from '../../../../../../../../__generated__/TypographyBlockUpdate'
import { useJourney } from '../../../../../../../libs/context'

interface VariantProps {
  id: string
  variant: TypographyVariant | null
}

export const TYPOGRAPHY_BLOCK_UPDATE = gql`
  mutation TypographyBlockUpdateVariant(
    $id: ID!
    $journeyId: ID!
    $input: TypographyBlockUpdateInput!
  ) {
    typographyBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      variant
    }
  }
`

export function Variant({ id, variant }: VariantProps): ReactElement {
  const [typographyBlockUpdate] = useMutation<TypographyBlockUpdate>(
    TYPOGRAPHY_BLOCK_UPDATE
  )

  const journey = useJourney()
  const [selected, setSelected] = useState(variant ?? 'body2')

  const order = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'subtitle1',
    'subtitle2',
    'body1',
    'body2',
    'caption',
    'overline'
  ]
  const sorted = Object.values(TypographyVariant).sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  )

  async function handleChange(
    event: React.MouseEvent<HTMLElement>,
    variant: TypographyVariant
  ): Promise<void> {
    if (variant != null) {
      await typographyBlockUpdate({
        variables: {
          id,
          journeyId: journey.id,
          input: { variant }
        }
      })
      setSelected(variant)
    }
  }

  return (
    <ToggleButtonGroup
      orientation="vertical"
      value={selected}
      exclusive
      onChange={handleChange}
      fullWidth
      color="primary"
      sx={{
        display: 'flex',
        px: 6,
        py: 4
      }}
    >
      {sorted.map((variant) => {
        return (
          <StyledToggleButton
            value={variant}
            key={`typography-variant-${variant}`}
            sx={{ justifyContent: 'flex-start' }}
          >
            <HorizontalRuleRoundedIcon sx={{ ml: 1, mr: 2 }} />
            <Typography variant={variant}>
              {capitalize(
                lowerCase(variant?.toString() ?? 'body2').replace('h', 'header')
              )}
            </Typography>
          </StyledToggleButton>
        )
      })}
    </ToggleButtonGroup>
  )
}
