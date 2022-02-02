import { ReactElement } from 'react'
import FormatAlignLeftRoundedIcon from '@mui/icons-material/FormatAlignLeftRounded'
import FormatAlignCenterRoundedIcon from '@mui/icons-material/FormatAlignCenterRounded'
import FormatAlignRightRoundedIcon from '@mui/icons-material/FormatAlignRightRounded'
import { gql, useMutation } from '@apollo/client'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import { TypographyBlockUpdateAlign } from '../../../../../../../../__generated__/TypographyBlockUpdateAlign'
import { TypographyAlign } from '../../../../../../../../__generated__/globalTypes'
import { useJourney } from '../../../../../../../libs/context'
import { ToggleButtonGroup } from '../../../ToggleButtonGroup'
import { GetJourney_journey_blocks_TypographyBlock as TypographyBlock } from '../../../../../../../../__generated__/GetJourney'

export const TYPOGRAPHY_BLOCK_UPDATE_ALIGN = gql`
  mutation TypographyBlockUpdateAlign(
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

export function Align(): ReactElement {
  const [typographyBlockUpdate] = useMutation<TypographyBlockUpdateAlign>(
    TYPOGRAPHY_BLOCK_UPDATE_ALIGN
  )
  const journey = useJourney()
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<TypographyBlock>
    | undefined

  const options = [
    {
      value: TypographyAlign.left,
      label: 'Left',
      icon: <FormatAlignLeftRoundedIcon />
    },
    {
      value: TypographyAlign.center,
      label: 'Center',
      icon: <FormatAlignCenterRoundedIcon />
    },
    {
      value: TypographyAlign.right,
      label: 'Right',
      icon: <FormatAlignRightRoundedIcon />
    }
  ]

  async function handleChange(align: TypographyAlign): Promise<void> {
    if (selectedBlock != null && align != null) {
      await typographyBlockUpdate({
        variables: {
          id: selectedBlock.id,
          journeyId: journey.id,
          input: { align }
        },
        optimisticResponse: {
          typographyBlockUpdate: {
            id: selectedBlock.id,
            align,
            __typename: 'TypographyBlock'
          }
        }
      })
    }
  }

  return (
    <ToggleButtonGroup
      value={selectedBlock?.align ?? TypographyAlign.left}
      onChange={handleChange}
      options={options}
    />
  )
}
