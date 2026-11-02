import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReactElement, ReactNode } from 'react'
import { userEvent, within } from 'storybook/test'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import {
  CanvasHoverReporter,
  NavigatorHoverProvider
} from '../../Navigator/NavigatorHover'
import { HOVER_OUTLINE_SX } from '../hoverOutline'

import { SelectionBadge, SelectionBadgePlacement } from '.'

interface BlockStandProps {
  id: string
  label: string
  selected: boolean
  placement?: SelectionBadgePlacement
  children: ReactNode
}

/** A stand-in canvas block: outlined while selected or hovered, with its badge on the corner. */
function BlockStand({
  id,
  label,
  selected,
  placement,
  children
}: BlockStandProps): ReactElement {
  return (
    <Box
      id={id}
      data-testid={`Block-${id}`}
      data-hoverable
      data-selected={selected}
      sx={{
        position: 'relative',
        p: 3,
        bgcolor: 'background.paper',
        ...HOVER_OUTLINE_SX,
        ...(selected ? { outline: '2px solid #C52D3A', outlineOffset: -2 } : {})
      }}
    >
      <SelectionBadge
        id={id}
        label={label}
        selected={selected}
        placement={placement}
      />
      {children}
    </Box>
  )
}

interface SelectionBadgeStoryProps {
  width: number
  selectedId?: string
}

/** A section with a nested Extra and a Region card with a Region Line, at the given canvas width. */
function SelectionBadgeStory({
  width,
  selectedId
}: SelectionBadgeStoryProps): ReactElement {
  return (
    <NavigatorHoverProvider>
      <CanvasHoverReporter document={document} />
      <Stack spacing={4} sx={{ width, pt: 4, pb: 2, px: 2 }}>
        <BlockStand
          id="hero"
          label="Hero"
          selected={selectedId === 'hero'}
          placement="inside"
        >
          <Stack spacing={3}>
            <Typography variant="h4">Outreach 2026</Typography>
            <BlockStand
              id="button"
              label="Button"
              selected={selectedId === 'button'}
            >
              <Typography>Watch now</Typography>
            </BlockStand>
          </Stack>
        </BlockStand>
        <BlockStand
          id="card"
          label="Region card"
          selected={selectedId === 'card'}
        >
          <Stack spacing={2}>
            <Typography variant="h5">Europe</Typography>
            <BlockStand
              id="line"
              label="Region Line"
              selected={selectedId === 'line'}
            >
              <Typography>Merry Outreach</Typography>
            </BlockStand>
          </Stack>
        </BlockStand>
      </Stack>
    </NavigatorHoverProvider>
  )
}

const SelectionBadgeMeta: Meta<typeof SelectionBadgeStory> = {
  ...journeysAdminConfig,
  component: SelectionBadgeStory,
  title: 'Journeys-Admin/CampaignEditor/Canvas/SelectionBadge',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'centered'
  },
  args: { width: 480 }
}

type Story = StoryObj<typeof SelectionBadgeStory>

/** At rest no badge shows. */
export const Resting: Story = {}

/** The selected section carries the solid badge inside its top-left corner. */
export const SelectedSection: Story = { args: { selectedId: 'hero' } }

/** A selected Extra carries it above its top-left corner. */
export const SelectedExtra: Story = { args: { selectedId: 'button' } }

/** A selected Region Line inside its Region card. */
export const SelectedRegionLine: Story = { args: { selectedId: 'line' } }

/** Hovering a nested block shows the muted badge of the innermost one only. */
export const HoveredRegionLine: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(
      await within(canvasElement).findByTestId('Block-line')
    )
  }
}

/** Hovering the outer Region card shows its muted badge. */
export const HoveredRegionCard: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(await within(canvasElement).findByText('Europe'))
  }
}

/** At phone width the badges still fit. */
export const SelectedAtPhoneWidth: Story = {
  args: { width: 320, selectedId: 'line' }
}

export default SelectionBadgeMeta
