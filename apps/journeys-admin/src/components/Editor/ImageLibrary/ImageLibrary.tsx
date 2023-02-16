import { ReactElement, useState, SyntheticEvent } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Close from '@mui/icons-material/Close'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Drawer from '@mui/material/Drawer'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import BrushRounded from '@mui/icons-material/BrushRounded'
import DashboardRounded from '@mui/icons-material/DashboardRounded'
import useMediaQuery from '@mui/material/useMediaQuery'
import { object, string } from 'yup'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { ImageBlockHeader } from '../ImageBlockHeader'
import { CustomImage } from './CustomImage'
import { ImageUpload } from './CustomImage/ImageUpload'

export const DRAWER_WIDTH = 328

interface ImageLibraryProps {
  open: boolean
  onClose?: () => void
  onChange: (image: ImageBlock) => Promise<void>
  onDelete?: () => Promise<void>
  selectedBlock: ImageBlock | null
  loading?: boolean
}

export function ImageLibrary({
  open,
  onClose,
  onChange,
  onDelete,
  selectedBlock,
  loading
}: ImageLibraryProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const [tabValue, setTabValue] = useState(0)

  const srcSchema = object().shape({
    src: string().url('Please enter a valid url').required('Required')
  })

  const handleSrcChange = async (src: string): Promise<void> => {
    if (!(await srcSchema.isValid({ src })) || src === selectedBlock?.src)
      return

    const block = {
      ...selectedBlock,
      src,
      alt: src.replace(/(.*\/)*/, '').replace(/\?.*/, '') // per Vlad 26/1/22, we are hardcoding the image alt for now
    }
    await onChange(block as ImageBlock)
  }

  const handleTabChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: number
  ): void => {
    setTabValue(newValue)
  }

  return (
    <Drawer
      anchor={smUp ? 'right' : 'bottom'}
      variant="temporary"
      open={open}
      hideBackdrop
      elevation={smUp ? 1 : 0}
      sx={{
        left: {
          xs: 0,
          sm: 'unset'
        },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: smUp ? DRAWER_WIDTH : '100%',
          height: '100%'
        }
      }}
    >
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography
            variant="subtitle1"
            noWrap
            component="div"
            sx={{ flexGrow: 1 }}
          >
            Image
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{ display: 'inline-flex' }}
            edge="end"
          >
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        sx={{ width: '100%', justifyContent: 'center', display: 'flex', py: 4 }}
      >
        <ImageBlockHeader
          selectedBlock={
            selectedBlock != null &&
            selectedBlock.height < 0 &&
            selectedBlock.width < 0
              ? selectedBlock
              : null
          }
          onDelete={onDelete}
          loading={loading}
        />
      </Box>
      <Box data-testid="ImageLibrary">
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="image selection tabs"
          variant="fullWidth"
        >
          <Tab
            icon={<DashboardRounded />}
            label={<Typography variant="subtitle2">Unsplash</Typography>}
            {...tabA11yProps('unsplash', 0)}
          />
          <Tab
            icon={<BrushRounded />}
            label={<Typography variant="subtitle2">Custom</Typography>}
            {...tabA11yProps('custom', 1)}
          />
        </Tabs>
        <TabPanel name="unsplash" value={tabValue} index={0}>
          {/* insert unsplash component */}
        </TabPanel>
        <TabPanel name="custom" value={tabValue} index={1}>
          <ImageUpload onChange={handleSrcChange} loading={loading} />
          <CustomImage onChange={handleSrcChange} />
        </TabPanel>
      </Box>
    </Drawer>
  )
}
