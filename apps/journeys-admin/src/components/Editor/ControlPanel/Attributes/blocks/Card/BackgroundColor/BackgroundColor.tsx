import { ReactElement, useState, useEffect, useRef } from 'react'
import { debounce } from 'lodash'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import ColorizeIcon from '@mui/icons-material/Colorize'
import { HexColorPicker } from 'react-colorful'
import { gql, useMutation } from '@apollo/client'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import { TabPanel, tabA11yProps, themes } from '@core/shared/ui'
import { useJourney } from '../../../../../../../libs/context'
import { CardFields } from '../../../../../../../../__generated__/CardFields'
import { CardBlockBackgroundColorUpdate } from '../../../../../../../../__generated__/CardBlockBackgroundColorUpdate'
import { Swatch } from './Swatch'
import { PaletteColorPicker } from './PaletteColorPicker'

const palette = [
  { dark: '#C62828', light: '#FFCDD2' },
  { dark: '#AD1457', light: '#F48FB1' },
  { dark: '#6A1B9A', light: '#CE93D8' },
  { dark: '#4527A0', light: '#B39DDB' },
  { dark: '#283593', light: '#9FA8DA' },
  { dark: '#1565C0', light: '#90CAF9' },
  { dark: '#0277BD', light: '#81D4FA' },
  { dark: '#006064', light: '#80DEEA' },
  { dark: '#00695C', light: '#80CBC4' },
  { dark: '#2E7D32', light: '#C8E6C9' },
  { dark: '#33691E', light: '#C5E1A5' },
  { dark: '#4E342E', light: '#D7CCC8' },
  { dark: '#424242', light: '#E0E0E0' },
  { dark: '#37474F', light: '#B0BEC5' },
  { dark: '#30313D', light: '#FEFEFE' }
]

export const CARD_BLOCK_BACKGROUND_COLOR_UPDATE = gql`
  mutation CardBlockBackgroundColorUpdate(
    $id: ID!
    $journeyId: ID!
    $input: CardBlockUpdateInput!
  ) {
    cardBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      backgroundColor
    }
  }
`

export function BackgroundColor(): ReactElement {
  const [cardBlockUpdate] = useMutation<CardBlockBackgroundColorUpdate>(
    CARD_BLOCK_BACKGROUND_COLOR_UPDATE
  )

  const {
    state: { selectedBlock }
  } = useEditor()

  const cardBlock = (
    selectedBlock?.__typename === 'CardBlock'
      ? selectedBlock
      : selectedBlock?.children.find(
          (child) => child.__typename === 'CardBlock'
        )
  ) as TreeBlock<CardFields> | undefined

  const journey = useJourney()

  const cardTheme =
    themes[cardBlock?.themeName ?? journey?.themeName ?? 'base'][
      cardBlock?.themeMode ?? journey?.themeMode ?? 'dark'
    ]

  const [tabValue, setTabValue] = useState(0)
  const [selectedColor, setSelectedColor] = useState(
    cardBlock?.backgroundColor ?? cardTheme.palette.background.paper
  )

  const handleTabChange = (_event, newValue): void => {
    setTabValue(newValue)
  }

  const changeCardColor = async (color: string): Promise<void> => {
    if (journey == null) return

    if (cardBlock != null) {
      await cardBlockUpdate({
        variables: {
          id: cardBlock.id,
          journeyId: journey.id,
          input: {
            backgroundColor: color === 'null' ? null : color
          }
        },
        update(cache, { data }) {
          if (data?.cardBlockUpdate != null) {
            cache.modify({
              id: cache.identify({
                __typename: 'CardBlock',
                id: cardBlock.id
              }),
              fields: {
                backgroundColor: () => data.cardBlockUpdate.backgroundColor
              }
            })
          }
        }
      })
    }
  }

  const handleColorChange = async (color: string): Promise<void> => {
    void debouncedColorChange(color.toUpperCase())
  }

  const debouncedColorChange = useRef(
    debounce(async (color) => {
      void changeCardColor(color)
      setSelectedColor(color)
    }, 100)
  ).current

  useEffect(() => {
    return () => {
      debouncedColorChange.cancel()
    }
  }, [debouncedColorChange])

  const palettePicker = (
    <PaletteColorPicker
      selectedColor={selectedColor}
      colors={palette}
      mode={cardTheme.palette.mode}
      onChange={handleColorChange}
    />
  )

  // TODO: Test onChange in E2E
  const hexColorPicker = (
    <Box sx={{ px: 6, py: 4 }}>
      <HexColorPicker
        data-testid="bgColorPicker"
        color={selectedColor}
        onChange={handleColorChange}
        style={{ width: '100%', height: 125 }}
      />
    </Box>
  )

  return (
    <>
      <Stack sx={{ p: 6, py: 4 }} spacing={3} direction="row">
        <Swatch id={`bg-color-${selectedColor}`} color={selectedColor} />
        <TextField
          data-testid="bgColorTextField"
          variant="filled"
          hiddenLabel
          value={selectedColor}
          onChange={async (e) => await handleColorChange(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <ColorizeIcon
                  onClick={(e) => handleTabChange(e, 1)}
                  style={{ cursor: 'pointer' }}
                />
              </InputAdornment>
            )
          }}
        />
      </Stack>
      <Box
        sx={{
          [cardTheme.breakpoints.up('sm')]: {
            display: 'none'
          }
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="background tabs"
          variant="fullWidth"
          centered
        >
          <Tab label="Palette" {...tabA11yProps('background-color', 0)} />
          <Tab label="Custom" {...tabA11yProps('background-color', 1)} />
        </Tabs>
        <Divider />
        <TabPanel name="background-color" value={tabValue} index={0}>
          {palettePicker}
        </TabPanel>
        <TabPanel name="background-color" value={tabValue} index={1}>
          {hexColorPicker}
        </TabPanel>
      </Box>
      <Box sx={{ [cardTheme.breakpoints.down('sm')]: { display: 'none' } }}>
        <Divider />
        <Box sx={{ px: 6, pt: 4 }}>
          <Typography variant="subtitle2">Palette</Typography>
        </Box>
        {palettePicker}
        <Divider />
        <Box sx={{ px: 6, py: 4 }}>
          <Typography variant="subtitle2">Custom</Typography>
        </Box>
        {hexColorPicker}
      </Box>
    </>
  )
}
