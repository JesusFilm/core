import { ReactElement, useState } from 'react'
import FormatAlignLeftRoundedIcon from '@mui/icons-material/FormatAlignLeftRounded'
import FormatAlignCenterRoundedIcon from '@mui/icons-material/FormatAlignCenterRounded'
import FormatAlignRightRoundedIcon from '@mui/icons-material/FormatAlignRightRounded'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import capitalize from 'lodash/capitalize'
import { gql, useMutation } from '@apollo/client'
import { TypographyAlign } from '../../../../../../../../__generated__/globalTypes'
import { useJourney } from '../../../../../../../libs/context'
import { TypographyBlockUpdate } from '../../../../../../../../__generated__/TypographyBlockUpdate'

interface TextAlignProps {
  id: string
  align: TypographyAlign | null
}

export const TYPOGRAPHY_BLOCK_UPDATE = gql`
  mutation TypographyBlockUpdate(
    $id: ID!
    $journeyId: ID!
    $input: TypographyBlockUpdateInput!
  ) {
    typographyBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      align
    }
  }
`

export function TextAlign({ id, align }: TextAlignProps): ReactElement {
  const [typographyBlockUpdate] = useMutation<TypographyBlockUpdate>(
    TYPOGRAPHY_BLOCK_UPDATE
  )
  const journey = useJourney()
  const [selected, setSelected] = useState(align ?? 'left')

  const order = ['left', 'center', 'right']
  const sorted = Object.values(TypographyAlign).sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  )

  const handleChange = async (
    event: React.MouseEvent<HTMLElement>,
    align: TypographyAlign
  ): Promise<void> => {
    if (align != null) {
      await typographyBlockUpdate({
        variables: {
          id,
          journeyId: journey.id,
          input: { align }
        }
      })
      setSelected(align)
    }
  }

  function iconSelector(align: TypographyAlign): ReactElement {
    switch (align) {
      case 'center':
        return <FormatAlignCenterRoundedIcon sx={{ ml: 1, mr: 2 }} />
      case 'right':
        return <FormatAlignRightRoundedIcon sx={{ ml: 1, mr: 2 }} />
      default:
        return <FormatAlignLeftRoundedIcon sx={{ ml: 1, mr: 2 }} />
    }
  }

  return (
    <ToggleButtonGroup
      orientation="vertical"
      value={selected}
      exclusive
      onChange={handleChange}
      fullWidth
      sx={{
        display: 'flex',
        px: 6,
        py: 4
      }}
    >
      {sorted.map((alignment) => {
        return (
          <ToggleButton
            value={alignment}
            key={`${id}-align-${alignment}`}
            sx={{ justifyContent: 'flex-start' }}
          >
            {iconSelector(alignment)}
            <Typography variant="subtitle2">{capitalize(alignment)}</Typography>
          </ToggleButton>
        )
      })}
    </ToggleButtonGroup>
  )
}
