import { ReactElement, ReactNode, useState } from 'react'
import {
  Box,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Theme,
  Typography,
  useMediaQuery
} from '@mui/material'
import { Colorize } from '@mui/icons-material'
import { RgbaStringColorPicker } from 'react-colorful'
import PropTypes from 'prop-types'
import Stack from '@mui/material/Stack'
import { Swiper, SwiperSlide } from 'swiper/react'
import SwiperCore from 'swiper'

interface BackgroundColorProps {
  id: string
  backgroundColor: string | null
}

interface TabPanelProps {
  children?: ReactNode
  value: number
  index: number
}
function TabPanel({
  children,
  value,
  index,
  ...other
}: TabPanelProps): ReactElement {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired
}

function tabProps(index: number): { id: string; 'aria-controls': string } {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  }
}

const themeColors = [
  '#FFFFFF',
  '#DCDDE5',
  '#AAACBA',
  'rgba(0, 0, 0, 0)',
  '#30313C',
  '#26262D',
  '#EB6C57',
  '#CC4530'
]

export function BackgroundColor({
  id,
  backgroundColor
}: BackgroundColorProps): ReactElement {
  const [color, setColor] = useState(backgroundColor ?? '#FFFFFF')
  const [tabValue, setTabValue] = useState(0)
  const [swiper] = useState<SwiperCore>()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const handleTabChange = (event, newValue): void => {
    setTabValue(newValue)
  }

  if (swiper != null && themeColors.includes(color)) {
    swiper.slideTo(themeColors.findIndex((col) => col === color))
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ px: 6, py: 4 }}>
        <Stack spacing={3} direction="row">
          <Box
            sx={{
              backgroundColor: color,
              width: 56,
              height: 56,
              border: 1,
              borderRadius: 2
            }}
          />
          <TextField
            variant="outlined"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Colorize
                    onClick={(e) => handleTabChange(e, 1)}
                    style={{ cursor: 'pointer' }}
                  ></Colorize>
                </InputAdornment>
              )
            }}
          ></TextField>
        </Stack>
      </Box>
      {!smUp && (
        <>
          <Box sx={{ px: 6, py: 4 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="background tabs"
              centered
            >
              <Tab label="Theme" {...tabProps(0)}></Tab>
              <Tab label="Custom" {...tabProps(1)}></Tab>
            </Tabs>
          </Box>
          <TabPanel value={tabValue} index={0}>
            <Swiper
              slidesPerView={'auto'}
              spaceBetween={12}
              style={{ height: 125 }}
            >
              {themeColors.map((col, index) => (
                <SwiperSlide key={index} style={{ width: 56 }}>
                  <Box
                    sx={{
                      backgroundColor: col,
                      width: 56,
                      height: 56,
                      border: 1,
                      borderRadius: 2,
                      cursor: 'pointer',
                      borderColor: col === color ? 'red' : ''
                    }}
                    onClick={() => setColor(col)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <RgbaStringColorPicker
              color={color}
              onChange={setColor}
              style={{ width: 'auto', height: 125 }}
            />
          </TabPanel>
        </>
      )}
      {smUp && (
        <>
          <Box sx={{ px: 6, py: 4 }}>Theme</Box>
          <Box sx={{ px: 6 }}>
            <Swiper
              slidesPerView={'auto'}
              spaceBetween={12}
              style={{ height: 125 }}
            >
              {themeColors.map((col, index) => (
                <SwiperSlide key={index} style={{ width: 56 }}>
                  <Box
                    sx={{
                      backgroundColor: col,
                      width: 56,
                      height: 56,
                      border: 1,
                      borderRadius: 2,
                      cursor: 'pointer',
                      borderColor: col === color ? 'red' : ''
                    }}
                    onClick={() => setColor(col)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
          <Box sx={{ px: 6, py: 4 }}>Custom</Box>
          <Box sx={{ px: 6 }}>
            <RgbaStringColorPicker
              color={color}
              onChange={setColor}
              style={{ width: 'auto', height: 125 }}
            />
          </Box>
        </>
      )}
    </Box>
  )
}
