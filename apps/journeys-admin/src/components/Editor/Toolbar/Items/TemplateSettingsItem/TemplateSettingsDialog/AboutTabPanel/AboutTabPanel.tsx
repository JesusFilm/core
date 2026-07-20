import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { ImageEdit } from '../../../../../Slider/Settings/Drawer/ImageEdit/ImageEdit'
import { useTemplateSettingsForm } from '../useTemplateSettingsForm'

import { CustomizeTemplate } from './CustomizeTemplate'

// NES-1678: the strategy section (Canva / Google Slides embed for global
// templates) was removed per QA's call — the helper-text approach in
// NES-1660 was rejected, and the team chose to remove the editing surface
// entirely. The `strategySlug` field is still carried through the form
// (via `TemplateSettingsFormValues` → `JourneyUpdateInput`) so existing
// values round-trip on save and stay intact, but there is no UI to create
// or edit one. The shared `StrategySection` component still exists and is
// reused by the LTL collection media preview.
export function AboutTabPanel(): ReactElement {
  const { values, handleChange, errors } = useTemplateSettingsForm()
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <Stack direction="row" spacing={5}>
        <Box>
          <ImageEdit size="small" target="creator" variant="dialog" />
        </Box>
        <TextField
          id="creatorDescription"
          name="creatorDescription"
          value={values.creatorDescription}
          error={Boolean(errors?.creatorDescription)}
          variant="filled"
          helperText={
            errors?.creatorDescription != null
              ? errors?.creatorDescription
              : t(
                  'Public information about a person or a team created this journey'
                )
          }
          onChange={handleChange}
          label={t("Creator's Info")}
          multiline
          rows={2}
          sx={{ flex: 1 }}
        />
      </Stack>
      <Divider />
      <CustomizeTemplate />
    </>
  )
}
