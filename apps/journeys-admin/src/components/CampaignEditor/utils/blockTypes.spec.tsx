import { render, screen } from '@testing-library/react'
import { TFunction } from 'i18next'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../__generated__/GetCampaign'

import { blockIcon } from './blockIcon'
import { blockLabel } from './blockLabel'

const translate = ((key: string) => key) as TFunction

describe('block metadata helpers', () => {
  it('returns the label and icon for a known block', () => {
    expect(blockLabel(translate, 'CampaignHeroBlock')).toBe('Hero')
    render(blockIcon('CampaignHeroBlock'))
    expect(screen.getByTestId('LayoutTopIcon')).toBeInTheDocument()
  })

  it('falls back safely for a server block type absent from this build', () => {
    const typename = 'CampaignFutureBlock' as CampaignBlock['__typename']
    expect(blockLabel(translate, typename)).toBe(typename)
    render(blockIcon(typename))
    expect(screen.getByTestId('Home3Icon')).toBeInTheDocument()
  })

  it('uses the campaign icon when nothing is selected', () => {
    render(blockIcon(undefined))
    expect(screen.getByTestId('Home3Icon')).toBeInTheDocument()
  })
})
