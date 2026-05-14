import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Trans, useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { bodySx, mediaSlotSx } from '../styles'

/**
 * SharingAndPublishingSection — Section 4 of TemplateInfoPanel (NES-1538).
 *
 * Mirrors Figma `39657-66751`. Figma typo "there dots menu" is corrected to
 * "three dots menu" per the plan's Key Technical Decisions.
 */
export function SharingAndPublishingSection(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Stack gap={1} data-testid="SharingAndPublishingSection">
      <Typography sx={bodySx}>
        {t(
          'When your template is ready (you set trackable and customizable items) you can publish it.'
        )}
      </Typography>
      <Typography sx={bodySx}>
        <Trans
          t={t}
          i18nKey="Select <0>Publish</0> in the three dots menu to get a link to share. Anyone with the link can use your project as template, and you can track its impact."
          components={[<strong key="emphasis" />]}
        />
      </Typography>
      <Typography sx={bodySx}>
        {t('You can add as many templates as you want!')}
      </Typography>
      <Typography sx={bodySx}>
        <Trans
          t={t}
          i18nKey="You also can use your template with any team you have access to. No publishing needed in this case. Select <0>Use in a team</0> in the three dots menu."
          components={[<strong key="emphasis" />]}
        />
      </Typography>
      <Box
        component="img"
        src="/assets/template-info/publish-and-share-flow.gif"
        alt={t('Publish flow via three dots menu and/or Use in a team flow')}
        width={333}
        height={160}
        loading="lazy"
        sx={{ ...mediaSlotSx, mt: 1 }}
      />
    </Stack>
  )
}
