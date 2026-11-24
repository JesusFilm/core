import type { MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import { ThemeProvider } from '@mui/material/styles'
import type { Decorator, Meta } from '@storybook/nextjs-vite'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { CampaignPageKind } from '../../../__generated__/globalTypes'

import { CampaignProvider } from './CampaignProvider'
import { createCampaignTheme } from './libs/createCampaignTheme'
import { transformCampaignBlocks } from './libs/transformer'
import {
  campaignPublic,
  eurRegion,
  landingBlocks,
  regionPageBlocks
} from './testData'
import type { CampaignTree } from './types'

const theme = createCampaignTheme(campaignPublic.theme, false)

/** Storybook config every Campaign story shares: the campaign theme and provider around the story. */
export function campaignStoryConfig(
  pageKind: CampaignPageKind = CampaignPageKind.landing,
  mocks: MockLink.MockedResponse[] = []
): Pick<Meta, 'decorators' | 'parameters'> {
  return {
    ...journeysAdminConfig,
    // Decorators listed first wrap the story innermost, so the campaign theme wins.
    decorators: [
      (Story) => (
        <MockedProvider mocks={mocks}>
          <ThemeProvider theme={theme}>
            <CampaignProvider
              value={{
                campaign: campaignPublic,
                pageKind,
                region:
                  pageKind === CampaignPageKind.regionTemplate
                    ? eurRegion
                    : null
              }}
            >
              <Story />
            </CampaignProvider>
          </ThemeProvider>
        </MockedProvider>
      ),
      ...(journeysAdminConfig.decorators as Decorator[])
    ],
    parameters: { ...journeysAdminConfig.parameters, layout: 'fullscreen' }
  }
}

/** A root block of the fixture campaign's landing page, treed. */
export function landingTree(id: string): CampaignTree {
  return treeOf(landingBlocks, id)
}

/** A root block of the fixture campaign's Region Page, treed. */
export function regionTree(id: string): CampaignTree {
  return treeOf(regionPageBlocks, id)
}

export function treeOf(blocks: typeof landingBlocks, id: string): CampaignTree {
  const node = transformCampaignBlocks(blocks).find((block) => block.id === id)
  if (node == null) throw new Error(`No fixture block ${id}`)
  return node
}
