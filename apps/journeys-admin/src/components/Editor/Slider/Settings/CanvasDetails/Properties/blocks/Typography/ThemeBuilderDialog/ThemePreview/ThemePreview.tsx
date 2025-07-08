import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { Formik } from 'formik'
import noop from 'lodash/noop'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { Button } from '@core/journeys/ui/Button'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { RadioQuestion } from '@core/journeys/ui/RadioQuestion'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { TextResponse } from '@core/journeys/ui/TextResponse'
import { TextResponseFields } from '@core/journeys/ui/TextResponse/__generated__/TextResponseFields'
import { Typography } from '@core/journeys/ui/Typography'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../../../../../../../../../__generated__/globalTypes'

interface ThemePreviewProps {
  headerFont: string
  bodyFont: string
  labelFont: string
}

/**
 * Renders a preview of the theme with the specified font families
 * @param headerFont - Font family to use for headings
 * @param bodyFont - Font family to use for body text
 * @param labelFont - Font family to use for labels
 * @returns A preview of the theme with sample UI components
 */
export function ThemePreview({
  headerFont,
  bodyFont,
  labelFont
}: ThemePreviewProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)

  const textResponseBlock: TreeBlock<TextResponseFields> = {
    __typename: 'TextResponseBlock',
    id: 'textResponse0id',
    parentBlockId: '0',
    parentOrder: 0,
    label: 'Label',
    placeholder: 'Placeholder text',
    hint: 'Hint text',
    minRows: null,
    required: null,
    integrationId: null,
    type: null,
    routeId: null,
    children: []
  }

  return (
    <ThemeProvider
      themeName={ThemeName.base}
      themeMode={ThemeMode.light}
      rtl={rtl}
      locale={locale}
      nested
      fontFamilies={{
        headerFont,
        bodyFont,
        labelFont
      }}
    >
      <Box
        sx={{
          p: { xs: 0, sm: 10 },
          width: '100%',
          borderRadius: { xs: 3, sm: 0 },
          background: 'linear-gradient(to bottom, #E6E7F180 0%, #B2B4C280 100%)'
        }}
      >
        <Paper
          sx={{
            pt: 17,
            pb: 15,
            px: 10,
            borderRadius: 3,
            width: { xs: '100%', sm: 390 },
            backgroundColor: (theme) => theme.palette.background.default + '80'
          }}
        >
          <Formik
            initialValues={{ [textResponseBlock.id]: '' }}
            onSubmit={noop}
          >
            <Stack spacing={6}>
              <Stack spacing={4}>
                <Stack spacing={4} sx={{ width: '100%' }}>
                  <Typography
                    {...{
                      __typename: 'TypographyBlock',
                      id: 'heading1',
                      parentBlockId: 'question',
                      parentOrder: 0,
                      align: TypographyAlign.left,
                      color: TypographyColor.primary,
                      variant: TypographyVariant.h1,
                      content: t('Display Text'),
                      children: []
                    }}
                  />
                  <Typography
                    {...{
                      __typename: 'TypographyBlock',
                      id: 'heading2',
                      parentBlockId: 'question',
                      parentOrder: 0,
                      align: TypographyAlign.left,
                      color: TypographyColor.primary,
                      variant: TypographyVariant.h2,
                      content: t('This is a Heading'),
                      children: []
                    }}
                  />
                </Stack>
                <Stack spacing={2} sx={{ width: '100%' }}>
                  <Typography
                    {...{
                      __typename: 'TypographyBlock',
                      id: 'heading5',
                      parentBlockId: 'question',
                      parentOrder: 0,
                      align: TypographyAlign.left,
                      color: TypographyColor.primary,
                      variant: TypographyVariant.h5,
                      content: t(
                        'This is a subheading that supports additional content'
                      ),
                      children: []
                    }}
                  />
                  <Typography
                    {...{
                      __typename: 'TypographyBlock',
                      id: 'body1',
                      parentBlockId: 'question',
                      parentOrder: 0,
                      align: TypographyAlign.left,
                      color: TypographyColor.primary,
                      variant: TypographyVariant.body1,
                      content: t(
                        'This is body text, used for general content like paragraphs and instructions.'
                      ),
                      children: []
                    }}
                  />
                </Stack>
              </Stack>
              <Stack spacing={6}>
                <Button
                  {...{
                    __typename: 'ButtonBlock',
                    id: 'button',
                    parentBlockId: 'question',
                    parentOrder: 0,
                    label: 'Button',
                    buttonVariant: ButtonVariant.contained,
                    buttonColor: ButtonColor.error,
                    size: ButtonSize.large,
                    startIconId: null,
                    endIconId: null,
                    action: null,
                    submitEnabled: false,
                    children: [],
                    settings: null
                  }}
                />
                <RadioQuestion
                  {...{
                    __typename: 'RadioQuestionBlock',
                    id: 'RadioQuestion1',
                    parentBlockId: 'parent.id',
                    parentOrder: 0,
                    children: [
                      {
                        __typename: 'RadioOptionBlock',
                        id: 'RadioOption1',
                        label: 'Poll Block Option',
                        parentBlockId: 'RadioQuestion1',
                        parentOrder: 0,
                        action: null,
                        children: []
                      },
                      {
                        __typename: 'RadioOptionBlock',
                        id: 'RadioOption2',
                        label: 'Poll Block Option',
                        parentBlockId: 'RadioQuestion1',
                        parentOrder: 1,
                        action: null,
                        children: []
                      }
                    ]
                  }}
                />
                <TextResponse {...textResponseBlock} />
              </Stack>
            </Stack>
          </Formik>
        </Paper>
      </Box>
    </ThemeProvider>
  )
}
