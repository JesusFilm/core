import { gql, useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import Type1Icon from '@core/shared/ui/icons/Type1'
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

const ThemeBuilderDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "ThemeBuilderDialog" */
      '../ThemeBuilderDialog'
    ).then((mod) => mod.ThemeBuilderDialog),
  { ssr: false }
)

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

  const [openThemeBuilderDialog, setOpenThemeBuilderDialog] = useState(false)

  const journeyTheme = journey?.journeyTheme
  const fontFamilies = useMemo(() => {
    if (journeyTheme == null) return

    return {
      headerFont: journeyTheme?.headerFont ?? '',
      bodyFont: journeyTheme?.bodyFont ?? '',
      labelFont: journeyTheme?.labelFont ?? ''
    }
  }, [journeyTheme])

  const withJourneyTheme = (children): ReactElement => (
    <ThemeProvider
      themeName={ThemeName.base}
      themeMode={ThemeMode.light}
      rtl={rtl}
      locale={locale}
      fontFamilies={fontFamilies}
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

  /**
   * Typography variant options with their corresponding UI labels.
   * Note: The mapping is intentional but non-obvious:
   * - TypographyVariant.h1 → "Display" (largest text)
   * - TypographyVariant.h2 → "Title"
   * - TypographyVariant.h3 → "Heading 1"
   * - TypographyVariant.h4 → "Heading 2"
   * - TypographyVariant.h5 → "Heading 3"
   * - TypographyVariant.h6 → "Heading 4"
   * - TypographyVariant.body1 → "Large Body"
   * - TypographyVariant.body2 → "Normal Body"
   * - TypographyVariant.caption → "Small Body" (smallest text)
   */
  const options = [
    {
      value: TypographyVariant.caption,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.caption}>
          {t('Small Body')}
        </Typography>
      ),
      icon: <></>
    },
    {
      value: TypographyVariant.body2,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.body2}>
          {t('Normal Body')}
        </Typography>
      ),
      icon: <></>
    },
    {
      value: TypographyVariant.body1,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.body1}>
          {t('Large Body')}
        </Typography>
      ),
      icon: <></>
    },
    {
      value: TypographyVariant.h6,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.h6}>{t('Heading 4')}</Typography>
      ),
      icon: <></>
    },
    {
      value: TypographyVariant.h5,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.h5}>{t('Heading 3')}</Typography>
      ),
      icon: <></>
    },
    {
      value: TypographyVariant.h4,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.h4}>{t('Heading 2')}</Typography>
      ),
      icon: <></>
    },
    {
      value: TypographyVariant.h3,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.h3}>{t('Heading 1')}</Typography>
      ),
      icon: <></>
    },
    {
      value: TypographyVariant.h2,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.h2}>{t('Title')}</Typography>
      ),
      icon: <></>
    },
    {
      value: TypographyVariant.h1,
      label: withJourneyTheme(
        <Typography variant={TypographyVariant.h1}>{t('Display')}</Typography>
      ),
      icon: <></>
    }
  ]

  const editFontThemeButton = (
    <Button
      color="primary"
      sx={{
        backgroundColor: 'background.default',
        height: 64,
        p: 4,
        width: '100%',
        justifyContent: 'center',
        color: '#B42318',
        borderRadius: 3
      }}
      startIcon={<Type1Icon sx={{ color: '#B42318' }} />}
      onClick={() => setOpenThemeBuilderDialog(true)}
    >
      <Typography variant="subtitle2">{t('Edit Font Theme')}</Typography>
    </Button>
  )

  return (
    <>
      <ToggleButtonGroup
        value={selectedBlock?.variant ?? TypographyVariant.body2}
        onChange={handleChange}
        options={options}
        testId="Variant"
        children={editFontThemeButton}
      />
      {openThemeBuilderDialog && (
        <ThemeBuilderDialog
          open={openThemeBuilderDialog}
          onClose={() => setOpenThemeBuilderDialog(false)}
        />
      )}
    </>
  )
}
