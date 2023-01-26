import { ReactElement, ComponentProps, SyntheticEvent, useState } from 'react'
import { Dialog } from '@core/shared/ui/Dialog'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'
import Typography from '@mui/material/Typography'
import { ImageLink } from './ImageLink'

interface ImageSelectionDialogProps
  extends Pick<ComponentProps<typeof Dialog>, 'open' | 'onClose'> {}

export function ImageSelectionDialog({
  ...dialogProps
}: ImageSelectionDialogProps): ReactElement {
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: number
  ): void => {
    setTabValue(newValue)
  }

  return (
    <Dialog
      {...dialogProps}
      dialogTitle={{
        title: 'Choose Image',
        closeButton: true
      }}
    >
      <>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="image selection tabs"
          variant="fullWidth"
        >
          <Tab
            label={<Typography variant="subtitle2">Unsplash</Typography>}
            {...tabA11yProps('unsplash', 0)}
          />
          <Tab
            label={<Typography variant="subtitle2">Upload</Typography>}
            {...tabA11yProps('upload', 1)}
          />
          <Tab
            label={<Typography variant="subtitle2">Link</Typography>}
            {...tabA11yProps('link', 2)}
          />
        </Tabs>
        <TabPanel name="unsplash" value={tabValue} index={0}>
          {/* insert unsplash component */}
        </TabPanel>
        <TabPanel name="upload" value={tabValue} index={1}>
          {/* insert upload component */}
        </TabPanel>
        <TabPanel name="link" value={tabValue} index={2}>
          <ImageLink />
        </TabPanel>
      </>
    </Dialog>
  )
}
