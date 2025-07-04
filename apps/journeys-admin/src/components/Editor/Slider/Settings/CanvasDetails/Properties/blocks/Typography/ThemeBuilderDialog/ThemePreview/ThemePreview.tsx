import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { Formik } from 'formik'

import { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { RadioQuestion } from '@core/journeys/ui/RadioQuestion'
import { RadioQuestionFields } from '@core/journeys/ui/RadioQuestion/__generated__/RadioQuestionFields'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
import { Button } from '@core/journeys/ui/Button'
import { ButtonFields } from '@core/journeys/ui/Button/__generated__/ButtonFields'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from 'libs/journeys/ui/__generated__/globalTypes'
import { TextResponseFields } from '@core/journeys/ui/TextResponse/__generated__/TextResponseFields'
import { TextResponse } from '@core/journeys/ui/TextResponse'
import { Typography } from '@core/journeys/ui/Typography'
import { useEditor } from '@core/journeys/ui/EditorProvider'

interface ThemePreviewProps {
  headerFont: string
  bodyFont: string
  labelFont: string
}

export function ThemePreview({
  headerFont,
  bodyFont,
  labelFont
}: ThemePreviewProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)
  const {
    state: { selectedStep }
  } = useEditor()

  const currentCard = selectedStep?.children.find(
    (child) => child.__typename === 'CardBlock'
  )

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
      themeMode={currentCard?.themeMode ?? ThemeMode.light}
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
          background: 'linear-gradient(to bottom, #E6E7F180 0%, #B2B4C280 100%)'
        }}
      >
        <Paper
          sx={{
            pt: 17,
            pb: 15,
            px: 10,
            borderRadius: 3,
            width: 390
          }}
        >
          <Formik
            initialValues={{ [textResponseBlock.id]: '' }}
            onSubmit={() => {}}
          >
            <Stack direction="column" spacing={6}>
              <Stack direction="column" spacing={4}>
                <Stack direction="column" spacing={4} sx={{ width: '100%' }}>
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
                <Stack direction="column" spacing={2} sx={{ width: '100%' }}>
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
              <Stack direction="column" spacing={6}>
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
                    children: []
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
