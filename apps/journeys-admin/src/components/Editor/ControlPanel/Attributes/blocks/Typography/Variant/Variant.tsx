import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import { gql, useMutation } from '@apollo/client'
import HorizontalRuleRoundedIcon from '@mui/icons-material/HorizontalRuleRounded'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import { TypographyBlockUpdateVariant } from '../../../../../../../../__generated__/TypographyBlockUpdateVariant'
import { TypographyVariant } from '../../../../../../../../__generated__/globalTypes'
import { useJourney } from '../../../../../../../libs/context'
import { GetJourney_journey_blocks_TypographyBlock as TypographyBlock } from '../../../../../../../../__generated__/GetJourney'
import { ToggleButtonGroup } from '../../../ToggleButtonGroup'

export const TYPOGRAPHY_BLOCK_UPDATE_VARIANT = gql`
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

export function Variant(): ReactElement {
  const [typographyBlockUpdate] = useMutation<TypographyBlockUpdateVariant>(
    TYPOGRAPHY_BLOCK_UPDATE_VARIANT
  )
  const journey = useJourney()
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<TypographyBlock>
    | undefined
  const options = [
    {
      value: TypographyVariant.h1,
      label: <Typography variant={TypographyVariant.h1}>Header 1</Typography>,
      icon: <HorizontalRuleRoundedIcon />
    },
    {
      value: TypographyVariant.h2,
      label: <Typography variant={TypographyVariant.h2}>Header 2</Typography>,
      icon: <HorizontalRuleRoundedIcon />
    },
    {
      value: TypographyVariant.h3,
      label: <Typography variant={TypographyVariant.h3}>Header 3</Typography>,
      icon: <HorizontalRuleRoundedIcon />
    },
    {
      value: TypographyVariant.h4,
      label: <Typography variant={TypographyVariant.h4}>Header 4</Typography>,
      icon: <HorizontalRuleRoundedIcon />
    },
    {
      value: TypographyVariant.h5,
      label: <Typography variant={TypographyVariant.h5}>Header 5</Typography>,
      icon: <HorizontalRuleRoundedIcon />
    },
    {
      value: TypographyVariant.h6,
      label: <Typography variant={TypographyVariant.h6}>Header 6</Typography>,
      icon: <HorizontalRuleRoundedIcon />
    },
    {
      value: TypographyVariant.subtitle1,
      label: (
        <Typography variant={TypographyVariant.subtitle1}>
          Subtitle 1
        </Typography>
      ),
      icon: <HorizontalRuleRoundedIcon />
    },
    {
      value: TypographyVariant.subtitle2,
      label: (
        <Typography variant={TypographyVariant.subtitle2}>
          Subtitle 2
        </Typography>
      ),
      icon: <HorizontalRuleRoundedIcon />
    },
    {
      value: TypographyVariant.body1,
      label: <Typography variant={TypographyVariant.body1}>Body 1</Typography>,
      icon: <HorizontalRuleRoundedIcon />
    },
    {
      value: TypographyVariant.body2,
      label: <Typography variant={TypographyVariant.body2}>Body 2</Typography>,
      icon: <HorizontalRuleRoundedIcon />
    },
    {
      value: TypographyVariant.caption,
      label: (
        <Typography variant={TypographyVariant.caption}>Caption</Typography>
      ),
      icon: <HorizontalRuleRoundedIcon />
    },
    {
      value: TypographyVariant.overline,
      label: (
        <Typography variant={TypographyVariant.overline}>Overline</Typography>
      ),
      icon: <HorizontalRuleRoundedIcon />
    }
  ]

  async function handleChange(variant: TypographyVariant): Promise<void> {
    if (selectedBlock != null && variant != null) {
      await typographyBlockUpdate({
        variables: {
          id: selectedBlock.id,
          journeyId: journey.id,
          input: { variant }
        },
        optimisticResponse: {
          typographyBlockUpdate: {
            id: selectedBlock.id,
            variant,
            __typename: 'TypographyBlock'
          }
        }
      })
    }
  }

  return (
    <ToggleButtonGroup
      value={selectedBlock?.variant ?? TypographyVariant.body2}
      onChange={handleChange}
      options={options}
    />
  )
}
