import { ReactElement, useState } from 'react'
import {
  Box,
  Divider,
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
import Stack from '@mui/material/Stack'
import { useMutation } from '@apollo/client'
import { TabPanel, tabProps } from '@core/shared/ui'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import { HorizontalSelect } from '../../../../../../HorizontalSelect'
import { CARD_BLOCK_UPDATE } from '../CardBlockUpdate'
import { useJourney } from '../../../../../../../libs/context'
import { CardBlockUpdateInput } from '../../../../../../../../__generated__/globalTypes'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../../../../__generated__/GetJourney'

const themeColors = [
  'null',
  '#FFFFFF',
  '#DCDDE5',
  '#AAACBA',
  'rgba(0, 0, 0, 0)',
  '#30313C',
  '#26262D',
  '#EB6C57',
  '#CC4530'
]

export function BackgroundColor(): ReactElement {
  const {
    state: { selectedBlock }
  } = useEditor()

  const cardBlock = (
    selectedBlock?.__typename === 'CardBlock'
      ? selectedBlock
      : selectedBlock?.children.find(
          (child) => child.__typename === 'CardBlock'
        )
  ) as TreeBlock<CardBlock> | undefined
  const { id: journeyId } = useJourney()

  // const [color, setColor] = useState(backgroundColor)
  const [tabValue, setTabValue] = useState(0)
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const [cardBlockUpdate] =
    useMutation<{ cardBlockUpdate: CardBlockUpdateInput }>(CARD_BLOCK_UPDATE)
  const handleTabChange = (event, newValue): void => {
    setTabValue(newValue)
  }

  const handleColorChange = async (color: string): Promise<void> => {
    await cardBlockUpdate({
      variables: {
        id: cardBlock?.id,
        journeyId: journeyId,
        input: {
          backgroundColor: color === 'null' ? null : color
        }
      }
    })
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ px: 6, py: 4 }}>
        <Stack spacing={3} direction="row">
          <Box
            sx={{
              backgroundColor: cardBlock?.backgroundColor ?? '#FFFFFF',
              width: 56,
              height: 56,
              border: 1,
              borderRadius: 2
            }}
          />
          <TextField
            variant="outlined"
            value={cardBlock?.backgroundColor ?? 'Default'}
            onChange={async (e) => await handleColorChange(e.target.value)}
            data-testid="bgColorTextField"
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
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="background tabs"
            variant="fullWidth"
            centered
          >
            <Tab label="Theme" {...tabProps(0)}></Tab>
            <Tab label="Custom" {...tabProps(1)}></Tab>
          </Tabs>
          <TabPanel value={tabValue} index={0}>
            <HorizontalSelect
              onChange={handleColorChange}
              id={cardBlock?.backgroundColor ?? 'null'}
            >
              {themeColors.map((col) => (
                <Box
                  id={col}
                  key={col}
                  sx={{
                    backgroundColor: col === 'null' ? '#FFFFFF' : col,
                    width: 56,
                    height: 56,
                    border: 1,
                    borderRadius: 2,
                    margin: 1,
                    cursor: 'pointer'
                  }}
                />
              ))}
            </HorizontalSelect>
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <RgbaStringColorPicker
              data-testid="bgColorPicker"
              color={cardBlock?.backgroundColor ?? '#FFFFFF'}
              onChange={handleColorChange}
              style={{ width: 'auto', height: 125 }}
            />
          </TabPanel>
        </>
      )}
      {smUp && (
        <>
          <Divider />
          <Box sx={{ px: 6, paddingTop: 4 }}>
            <Typography variant="subtitle2">Theme</Typography>
          </Box>
          <HorizontalSelect
            onChange={handleColorChange}
            id={cardBlock?.backgroundColor ?? 'null'}
          >
            {themeColors.map((col) => (
              <Box
                id={col}
                key={col}
                sx={{
                  backgroundColor: col === 'null' ? '#FFFFFF' : col,
                  width: 56,
                  height: 56,
                  border: 1,
                  borderRadius: 2,
                  margin: 1,
                  cursor: 'pointer'
                }}
                data-testid={col}
              />
            ))}
          </HorizontalSelect>
          <Divider />
          <Box sx={{ px: 6, py: 4 }}>
            <Typography variant="subtitle2">Custom</Typography>
          </Box>
          <Box sx={{ px: 6 }}>
            <RgbaStringColorPicker
              data-testid="bgColorPicker"
              color={cardBlock?.backgroundColor ?? '#FFFFFF'}
              onChange={handleColorChange}
              style={{ width: 'auto', height: 125 }}
            />
          </Box>
        </>
      )}
    </Box>
  )
}
