import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Trans, useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import {
  bulletListSx,
  mediaSlotSx,
  numberedListSx,
  subHeadingSx
} from '../styles'

// Visual chrome only — font/size/color come from Typography variant="body2"
// + color="text.primary" applied on the consumer element.
const calloutBoxSx = {
  p: 1,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 1,
  bgcolor: 'transparent'
}

/**
 * HowToCreateSection — Section 2 of TemplateInfoPanel (NES-1538).
 *
 * Three vertical blocks mirroring Figma `39653-66495`:
 *   1. Top-level "make a template" steps + GIF + Quick-Start callout
 *   2. Links/Images/Video sub-section + bolded "Make Customisable" inline
 *   3. Text sub-section with italic `{{date}}` and `{{date: May, 8}}` code
 *      samples + workflow GIF
 *
 * The Figma typo "your need to prepare it" is corrected to "you need to
 * prepare it" per the plan's Key Technical Decisions.
 */
export function HowToCreateSection(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Stack gap={2} data-testid="HowToCreateSection">
      <Box component="ol" sx={numberedListSx}>
        <li>{t('Click on the three dots on your project card.')}</li>
        <li>{t('Select the Make Template option.')}</li>
      </Box>
      <Box
        component="img"
        src="/assets/template-info/make-template-flow.gif"
        alt={t('Making a template: click three dots → select Make Template')}
        width={333}
        height={160}
        loading="lazy"
        sx={mediaSlotSx}
      />
      <Typography variant="body2" color="text.primary" sx={calloutBoxSx}>
        {t(
          'If you want to have a Quick-Start template, you need to prepare it.'
        )}
      </Typography>

      <Stack gap={1}>
        <Typography sx={subHeadingSx}>{t('Links, Images, Video')}</Typography>
        <Box component="ol" sx={numberedListSx}>
          <li>{t('Select a block.')}</li>
          <li>
            <Trans
              t={t}
              i18nKey="Turn on <0>Make Customisable</0>."
              components={[<strong key="emphasis" />]}
            />
          </li>
          <li>
            {t(
              'For video you also can add notes for adapter to explain its purpose.'
            )}
          </li>
        </Box>
        <Typography variant="body2">
          {t(
            'Marked blocks will be available for editing in Step-by-step customisation.'
          )}
        </Typography>
      </Stack>

      <Stack gap={1}>
        <Typography sx={subHeadingSx}>{t('Text')}</Typography>
        <Box component="ul" sx={bulletListSx}>
          <li>
            {t(
              'In your template, highlight the text snippet you want to make customisable. Copy the text.'
            )}
          </li>
          <li>
            {t(
              'Instead of it type variable like date, time, event name and so on. Put this variable inside double brackets, e.g.'
            )}{' '}
            <Typography
              component="code"
              variant="body2"
              sx={{ fontStyle: 'italic' }}
            >
              {'{{date}}'}
            </Typography>
          </li>
          <li>
            {t(
              "Click on three dots and select Template Settings. You'll see the variable you set inside the field. You need to paste the text you copied after the double dots, like this"
            )}{' '}
            <Typography
              component="code"
              variant="body2"
              sx={{ fontStyle: 'italic' }}
            >
              {'{{date: May, 8}}'}
            </Typography>
          </li>
          <li>
            {t(
              'If you have repeated text on different cards you can reuse the same variable. When the adapter customizes it, it will be changed on each card.'
            )}
          </li>
        </Box>
        <Box
          component="img"
          src="/assets/template-info/text-variable-flow.gif"
          alt={t(
            'Text variable customization: highlight text → replace with {{var}} → open Template Settings → paste original after colon'
          )}
          width={333}
          height={160}
          loading="lazy"
          sx={mediaSlotSx}
        />
      </Stack>
    </Stack>
  )
}
