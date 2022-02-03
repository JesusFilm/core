import { ReactElement, useState } from 'react'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import Stack from '@mui/material/Stack'
import ColorizeIcon from '@mui/icons-material/Colorize'
import { RgbaStringColorPicker } from 'react-colorful'
import { Theme } from '@mui/material/styles'
import { gql, useMutation } from '@apollo/client'
import { TabPanel, tabA11yProps } from '@core/shared/ui'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import { HorizontalSelect } from '../../../../../../HorizontalSelect'
import { useJourney } from '../../../../../../../libs/context'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../../../../__generated__/GetJourney'
import { CardBlockBgColorUpdate } from '../../../../../../../../__generated__/CardBlockBgColorUpdate'

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

export const CARD_BLOCK_BGCOLOR_UPDATE = gql`
  mutation CardBlockBgColorUpdate(
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

  const [tabValue, setTabValue] = useState(0)
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const [cardBlockUpdate] = useMutation<CardBlockBgColorUpdate>(
    CARD_BLOCK_BGCOLOR_UPDATE
  )
  const handleTabChange = (event, newValue): void => {
    setTabValue(newValue)
  }

  const handleColorChange = async (color: string): Promise<void> => {
    if (cardBlock != null) {
      await cardBlockUpdate({
        variables: {
          id: cardBlock.id,
          journeyId: journeyId,
          input: {
            backgroundColor: color === 'null' ? null : color
          }
        },
        optimisticResponse: {
          cardBlockUpdate: {
            id: cardBlock.id,
            __typename: 'CardBlock',
            backgroundColor: color === 'null' ? null : color
          }
        }
      })
    }
  }

  return (
    <>
      <Box sx={{ px: 6, py: 4 }}>
        <Stack spacing={3} direction="row">
          <Box
            sx={{
              backgroundColor: cardBlock?.backgroundColor ?? '#FFFFFF',
              width: 56,
              height: 56,
              borderRadius: 2,
              outline: '1px solid rgba(0, 0, 0, 0.2)',
              outlineOffset: '-1px'
            }}
          />
          <TextField
            variant="filled"
            hiddenLabel
            value={cardBlock?.backgroundColor ?? 'Default'}
            onChange={async (e) => await handleColorChange(e.target.value)}
            data-testid="bgColorTextField"
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
            <Tab label="Theme" {...tabA11yProps('background-color', 0)}></Tab>
            <Tab label="Custom" {...tabA11yProps('background-color', 1)}></Tab>
          </Tabs>
          <Divider />
          <TabPanel name="background-color" value={tabValue} index={0}>
            <HorizontalSelect
              onChange={handleColorChange}
              id={cardBlock?.backgroundColor ?? 'null'}
              sx={{
                height: 134,
                alignItems: 'center'
              }}
            >
              {themeColors.map((col) => (
                <Box
                  id={col}
                  key={col}
                  sx={{
                    backgroundColor: col === 'null' ? '#FFFFFF' : col,
                    m: 0.5,
                    width: 60,
                    height: 60,
                    borderRadius: 2,
                    outline: '1px solid rgba(0, 0, 0, 0.2)',
                    outlineOffset: '-1px',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </HorizontalSelect>
          </TabPanel>
          <TabPanel name="background-color" value={tabValue} index={1}>
            <Box sx={{ display: 'flex', px: 6, py: 4, height: 134 }}>
              <RgbaStringColorPicker
                data-testid="bgColorPicker"
                color={cardBlock?.backgroundColor ?? '#FFFFFF'}
                onChange={handleColorChange}
                style={{ height: '100%', width: '100%' }}
              />
            </Box>
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
                  m: 0.5,
                  width: 60,
                  height: 60,
                  borderRadius: 2,
                  outline: '1px solid rgba(0, 0, 0, 0.2)',
                  outlineOffset: '-1px',
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
    </>
  )
}
