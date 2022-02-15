import { ReactElement } from 'react'
// import { gql, useMutation } from '@apollo/client'
import {
  // useEditor,
  TreeBlock
} from '@core/journeys/ui'
import { IconColor } from '../../../../../../../../../__generated__/globalTypes'
import { ColorDisplayIcon } from '../../../../../ColorDisplayIcon'
// import { useJourney } from '../../../../../../../../libs/context'
import { ToggleButtonGroup } from '../../../../ToggleButtonGroup'
// import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../../../__generated__/GetJourney'
import { IconFields } from '../../../../../../../../../__generated__/IconFields'

// export const BUTTON_START_ICON_COLOR_UPDATE = gql`
//   mutation ButtonBlockStartIconColorUpdate(
//     $id: ID!
//     $journeyId: ID!
//     $input: ButtonBlockUpdateInput!
//   ) {
//     buttonBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
//       id
//       startIcon {
//         color
//       }
//     }
//   }
// `

// export const BUTTON_END_ICON_COLOR_UPDATE = gql`
//   mutation ButtonBlockEndIconColorUpdate(
//     $id: ID!
//     $journeyId: ID!
//     $input: ButtonBlockUpdateInput!
//   ) {
//     buttonBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
//       id
//       endIcon {
//         color
//       }
//     }
//   }
// `

interface ColorToggleGroupProps {
  iconBlock: TreeBlock<IconFields>
}

export function ColorToggleGroup({
  iconBlock
}: ColorToggleGroupProps): ReactElement {
  // const [buttonBlockStartIconColorUpdate] =
  //   useMutation<ButtonBlockStartIconColorUpdate>(BUTTON_START_ICON_COLOR_UPDATE)
  // const [buttonBlockEndIconColorUpdate] =
  //   useMutation<ButtonBlockEndIconColorUpdate>(BUTTON_END_ICON_COLOR_UPDATE)

  // const journey = useJourney()

  // const { state } = useEditor()
  // const selectedBlock = state.selectedBlock as
  //   | TreeBlock<ButtonBlock>
  //   | undefined

  async function handleChange(color: IconColor): Promise<void> {
    // if (selectedBlock != null && color != null) {
    //   if (type === IconType.start) {
    //     await buttonBlockStartIconColorUpdate({
    //       variables: {
    //         id: selectedBlock.id,
    //         journeyId: journey.id,
    //         input: {
    //           startIcon: {
    //             color
    //           }
    //         }
    //       }
    //     })
    //   } else {
    //     await buttonBlockEndIconColorUpdate({
    //       variables: {
    //         id: selectedBlock.id,
    //         journeyId: journey.id,
    //         input: {
    //           endIcon: {
    //             color
    //           }
    //         }
    //       }
    //     })
    //   }
    // }
  }

  const options = [
    {
      value: IconColor.inherit,
      label: 'Default',
      icon: <ColorDisplayIcon color={IconColor.inherit} />
    },
    {
      value: IconColor.primary,
      label: 'Primary',
      icon: <ColorDisplayIcon color={IconColor.primary} />
    },
    {
      value: IconColor.secondary,
      label: 'Secondary',
      icon: <ColorDisplayIcon color={IconColor.secondary} />
    },
    {
      value: IconColor.error,
      label: 'Error',
      icon: <ColorDisplayIcon color={IconColor.error} />
    }
  ]

  return (
    <ToggleButtonGroup
      value={iconBlock?.iconColor ?? IconColor.inherit}
      onChange={handleChange}
      options={options}
    />
  )
}
