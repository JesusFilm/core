import { gql, useMutation } from '@apollo/client'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import Dash from '@core/shared/ui/icons/Dash'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { GetJourney_journey_blocks_TypographyBlock as TypographyBlock } from '../../../../../../../../__generated__/GetJourney'
import {
  ThemeMode,
  ThemeName,
  TypographyVariant
} from '../../../../../../../../__generated__/globalTypes'
import { TypographyBlockUpdateVariant } from '../../../../../../../../__generated__/TypographyBlockUpdateVariant'
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
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<TypographyBlock>
    | undefined

  const withJourneyTheme = (children): ReactElement => (
    <ThemeProvider
      themeName={ThemeName.base}
      themeMode={ThemeMode.light}
      rtl={rtl}
      locale={locale}
      nested
    >
      {children}
    </ThemeProvider>
  )

  const options = [
    {
      value: TypographyVariant.h1,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.h1}>Header 1</Typography>
      ),
      icon: <Dash />
    },
    {
      value: TypographyVariant.h2,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.h2}>Header 2</Typography>
      ),
      icon: <Dash />
    },
    {
      value: TypographyVariant.h3,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.h3}>Header 3</Typography>
      ),
      icon: <Dash />
    },
    {
      value: TypographyVariant.h4,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.h4}>Header 4</Typography>
      ),
      icon: <Dash />
    },
    {
      value: TypographyVariant.h5,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.h5}>Header 5</Typography>
      ),
      icon: <Dash />
    },
    {
      value: TypographyVariant.h6,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.h6}>Header 6</Typography>
      ),
      icon: <Dash />
    },
    {
      value: TypographyVariant.subtitle1,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.subtitle1}>
          Subtitle 1
        </Typography>
      ),
      icon: <Dash />
    },
    {
      value: TypographyVariant.subtitle2,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.subtitle2}>
          Subtitle 2
        </Typography>
      ),
      icon: <Dash />
    },
    {
      value: TypographyVariant.body1,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.body1}>Body 1</Typography>
      ),
      icon: <Dash />
    },
    {
      value: TypographyVariant.body2,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.body2}>Body 2</Typography>
      ),
      icon: <Dash />
    },
    {
      value: TypographyVariant.caption,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.caption}>Caption</Typography>
      ),
      icon: <Dash />
    },
    {
      value: TypographyVariant.overline,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.overline}>Overline</Typography>
      ),
      icon: <Dash />
    }
  ]

  async function handleChange(variant: TypographyVariant): Promise<void> {
    if (selectedBlock != null && variant != null && journey != null) {
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
