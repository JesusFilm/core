import { gql, useMutation } from '@apollo/client'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import DashIcon from '@core/shared/ui/icons/Dash'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { BlockFields_TypographyBlock as TypographyBlock } from '../../../../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName,
  TypographyVariant
} from '../../../../../../../../../../__generated__/globalTypes'
import { TypographyBlockUpdateVariant } from '../../../../../../../../../../__generated__/TypographyBlockUpdateVariant'
import { ToggleButtonGroup } from '../../../controls/ToggleButtonGroup'

export const TYPOGRAPHY_BLOCK_UPDATE_VARIANT = gql`
  mutation TypographyBlockUpdateVariant(
    $id: ID!
    $input: TypographyBlockUpdateInput!
  ) {
    typographyBlockUpdate(id: $id, input: $input) {
      id
      variant
    }
  }
`

export function Variant(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [typographyBlockUpdate] = useMutation<TypographyBlockUpdateVariant>(
    TYPOGRAPHY_BLOCK_UPDATE_VARIANT
  )
  const { add } = useCommand()
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)
  const {
    state: { selectedBlock: stateSelectedBlock, selectedStep },
    dispatch
  } = useEditor()
  const selectedBlock = stateSelectedBlock as
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

  function handleChange(variant: TypographyVariant): void {
    if (selectedBlock == null || variant == null) return

    add({
      parameters: {
        execute: { variant },
        undo: {
          variant: selectedBlock.variant
        }
      },
      execute({ variant }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStep,
          selectedBlock
        })
        void typographyBlockUpdate({
          variables: {
            id: selectedBlock.id,
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
    })
  }

  const options = [
    {
      value: TypographyVariant.h1,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.h1}>{t('Header 1')}</Typography>
      ),
      icon: <DashIcon />
    },
    {
      value: TypographyVariant.h2,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.h2}>{t('Header 2')}</Typography>
      ),
      icon: <DashIcon />
    },
    {
      value: TypographyVariant.h3,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.h3}>{t('Header 3')}</Typography>
      ),
      icon: <DashIcon />
    },
    {
      value: TypographyVariant.h4,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.h4}>{t('Header 4')}</Typography>
      ),
      icon: <DashIcon />
    },
    {
      value: TypographyVariant.h5,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.h5}>{t('Header 5')}</Typography>
      ),
      icon: <DashIcon />
    },
    {
      value: TypographyVariant.h6,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.h6}>{t('Header 6')}</Typography>
      ),
      icon: <DashIcon />
    },
    {
      value: TypographyVariant.subtitle1,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.subtitle1}>
          {t('Subtitle 1')}
        </Typography>
      ),
      icon: <DashIcon />
    },
    {
      value: TypographyVariant.subtitle2,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.subtitle2}>
          {t('Subtitle 2')}
        </Typography>
      ),
      icon: <DashIcon />
    },
    {
      value: TypographyVariant.body1,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.body1}>{t('Body 1')}</Typography>
      ),
      icon: <DashIcon />
    },
    {
      value: TypographyVariant.body2,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.body2}>{t('Body 2')}</Typography>
      ),
      icon: <DashIcon />
    },
    {
      value: TypographyVariant.caption,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.caption}>
          {t('Caption')}
        </Typography>
      ),
      icon: <DashIcon />
    },
    {
      value: TypographyVariant.overline,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.overline}>
          {t('Overline')}
        </Typography>
      ),
      icon: <DashIcon />
    }
  ]

  return (
    <ToggleButtonGroup
      value={selectedBlock?.variant ?? TypographyVariant.body2}
      onChange={handleChange}
      options={options}
      testId="Variant"
    />
  )
}
