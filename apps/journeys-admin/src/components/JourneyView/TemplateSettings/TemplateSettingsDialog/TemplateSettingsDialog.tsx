import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useFormikContext } from 'formik'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@core/shared/ui/Dialog'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import { TemplateSettingsFormValues } from '../TemplateSettingsForm/TemplateSettingsForm'

import { AboutTabPanel } from './AboutTabPanel'
import { CategoriesTabPanel } from './CategoriesTabPanel'
import { MetadataTabPanel } from './MetadataTabPanel/MetadataTabPanel'

interface TemplateSettingsDialogProps {
  open: boolean
  onClose: () => void
}

export function TemplateSettingsDialog({
  open,
  onClose
}: TemplateSettingsDialogProps): ReactElement {
  const [tab, setTab] = useState(0)
  function handleTabChange(_event, newValue): void {
    setTab(newValue)
  }
  const { t } = useTranslation()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { handleSubmit, resetForm, isSubmitting } =
    useFormikContext<TemplateSettingsFormValues>()

  function handleClose(): void {
    onClose()
    // wait for dialog animation to complete
    setTimeout(() => resetForm())
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      dialogTitle={{ title: 'Template Settings' }}
      dialogAction={{
        onSubmit: handleSubmit,
        closeLabel: 'Cancel'
      }}
      divider
      fullscreen={!smUp}
      loading={isSubmitting}
    >
      <>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          aria-label="template-settings-dialog-tabs"
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={t('Metadata')} {...tabA11yProps('metadata', 0)} />
          <Tab label={t('Categories')} {...tabA11yProps('categories', 1)} />
          <Tab label={t('About')} {...tabA11yProps('about', 2)} />
        </Tabs>
        <TabPanel name="metadata" value={tab} index={0}>
          <Stack sx={{ pt: 6 }} gap={5}>
            <MetadataTabPanel />
          </Stack>
        </TabPanel>
        <TabPanel name="categories" value={tab} index={1}>
          <Stack gap={4} sx={{ pt: 6 }}>
            <CategoriesTabPanel />
          </Stack>
        </TabPanel>
        <TabPanel name="about" value={tab} index={2}>
          <Stack sx={{ pt: 6 }} gap={6}>
            <AboutTabPanel />
          </Stack>
        </TabPanel>
      </>
    </Dialog>
  )
}
