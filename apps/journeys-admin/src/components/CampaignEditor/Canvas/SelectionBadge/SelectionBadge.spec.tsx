import { fireEvent, render, screen, within } from '@testing-library/react'
import { ReactElement } from 'react'

import { transformCampaignBlocks } from '@core/journeys/ui/Campaign'
import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'

import { CampaignPageKind } from '../../../../../__generated__/globalTypes'
import { CampaignEditorState } from '../../CampaignEditorProvider'
import { campaignWithRegions } from '../../data'
import { CanvasHoverReporter } from '../../Navigator/NavigatorHover'
import { RegionSwitcherEdit } from '../../RegionSwitcherEdit'
import { ShareSectionEdit } from '../../ShareSectionEdit'
import { SelectionProbe, StaticEditor } from '../../testing'
import { CanvasBlock, CanvasSection } from '../CanvasSection'

import { SelectionBadge } from '.'

const languagesMock = {
  request: { query: GET_LANGUAGES, variables: { languageId: '529' } },
  result: { data: { languages: [] } }
}

const hero = transformCampaignBlocks(campaignWithRegions.blocks).find(
  (block) => block.id === 'heroId'
) as CanvasBlock

function renderEditor(
  children: ReactElement,
  initialState?: Partial<CampaignEditorState>
): ReturnType<typeof render> {
  return render(
    <StaticEditor
      campaignProp={campaignWithRegions}
      initialState={initialState}
      mocks={[languagesMock]}
    >
      <CanvasHoverReporter document={document} />
      <SelectionProbe />
      {children}
    </StaticEditor>
  )
}

describe('SelectionBadge', () => {
  it('shows nothing while the block is neither selected nor hovered', () => {
    renderEditor(<SelectionBadge id="blockId" label="Hero" selected={false} />)

    expect(screen.queryByTestId('SelectionBadge')).not.toBeInTheDocument()
  })

  it('shows the label solid while the block is selected', () => {
    renderEditor(<SelectionBadge id="blockId" label="Hero" selected />)

    const badge = screen.getByTestId('SelectionBadge')
    expect(badge).toHaveTextContent('Hero')
    expect(badge).toHaveAttribute('data-state', 'selected')
    expect(badge).toHaveAttribute('data-placement', 'above')
  })

  it('takes no pointer events, so it never covers what is under it', () => {
    renderEditor(<SelectionBadge id="blockId" label="Hero" selected />)

    expect(screen.getByTestId('SelectionBadge')).toHaveStyle({
      pointerEvents: 'none'
    })
  })

  it('sits inside the corner when asked to', () => {
    renderEditor(
      <SelectionBadge id="blockId" label="Hero" selected placement="inside" />
    )

    expect(screen.getByTestId('SelectionBadge')).toHaveAttribute(
      'data-placement',
      'inside'
    )
  })
})

describe('SelectionBadge on the canvas', () => {
  describe('section', () => {
    it('labels the selected section with its Navigator label', () => {
      renderEditor(<CanvasSection block={hero} draggable />, {
        selectedBlockId: 'heroId'
      })

      const badge = within(
        screen.getByTestId('CanvasSection-heroId')
      ).getByText('Hero')
      expect(badge).toHaveAttribute('data-testid', 'SelectionBadge')
      expect(badge).toHaveAttribute('data-state', 'selected')
      expect(badge).toHaveAttribute('data-placement', 'inside')
    })

    it('shows the muted badge on hover and drops it when the pointer leaves', () => {
      renderEditor(<CanvasSection block={hero} />)
      expect(screen.queryByTestId('SelectionBadge')).not.toBeInTheDocument()

      fireEvent.mouseOver(screen.getByTestId('CanvasSection-heroId'))
      expect(screen.getByTestId('SelectionBadge')).toHaveTextContent('Hero')
      expect(screen.getByTestId('SelectionBadge')).toHaveAttribute(
        'data-state',
        'hovered'
      )

      fireEvent.mouseLeave(document.documentElement)
      expect(screen.queryByTestId('SelectionBadge')).not.toBeInTheDocument()
    })
  })

  describe('Extra', () => {
    it('badges only the hovered Extra, not the section around it', () => {
      renderEditor(<CanvasSection block={hero} />)

      fireEvent.mouseOver(screen.getByTestId('CanvasExtra-heroButtonId'))

      const badges = screen.getAllByTestId('SelectionBadge')
      expect(badges).toHaveLength(1)
      expect(badges[0]).toHaveTextContent('Button')
      expect(screen.getByTestId('CanvasExtra-heroButtonId')).toContainElement(
        badges[0]
      )
    })

    it('badges the selected Extra above its content', () => {
      renderEditor(<CanvasSection block={hero} />, {
        selectedBlockId: 'heroButtonId'
      })

      const badge = within(
        screen.getByTestId('CanvasExtra-heroButtonId')
      ).getByTestId('SelectionBadge')
      expect(badge).toHaveTextContent('Button')
      expect(badge).toHaveAttribute('data-state', 'selected')
      expect(badge).toHaveAttribute('data-placement', 'above')
    })
  })

  describe('region card and Region Line', () => {
    function renderSwitcher(
      initialState?: Partial<CampaignEditorState>
    ): ReturnType<typeof render> {
      return renderEditor(
        <RegionSwitcherEdit block={{ id: 'landingSwitcherId' }} />,
        initialState
      )
    }

    it('shows the Region card badge on hover, and selects the card on click', () => {
      renderSwitcher()

      fireEvent.mouseOver(screen.getByTestId('RegionCardEdit-eurRegionId'))
      expect(
        within(screen.getByTestId('RegionCardEdit-eurRegionId')).getByText(
          'Region card'
        )
      ).toHaveAttribute('data-state', 'hovered')

      fireEvent.click(screen.getByTestId('RegionCardEdit-eurRegionId'))
      expect(screen.getByTestId('SelectedRegionId')).toHaveTextContent(
        'eurRegionId'
      )
      expect(screen.getByText('Region card')).toHaveAttribute(
        'data-state',
        'selected'
      )
    })

    it('shows the Region Line badge on the line, not on its card, and selects the line on click', () => {
      renderSwitcher()

      fireEvent.mouseOver(screen.getByTestId('RegionLineEdit-eurLineId'))
      expect(screen.getAllByTestId('SelectionBadge')).toHaveLength(1)
      expect(
        within(screen.getByTestId('RegionLineEdit-eurLineId')).getByText(
          'Region Line'
        )
      ).toHaveAttribute('data-state', 'hovered')

      fireEvent.click(screen.getByTestId('RegionLineEdit-eurLineId'))
      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'eurLineId'
      )
      expect(screen.getByText('Region Line')).toHaveAttribute(
        'data-state',
        'selected'
      )
      expect(screen.queryByText('Region card')).not.toBeInTheDocument()
    })
  })

  describe('Share Language row', () => {
    it('shows the Share language badge on hover and selects the Share section on click', () => {
      renderEditor(<ShareSectionEdit block={{ id: 'regionShareId' }} />, {
        pageKind: CampaignPageKind.regionTemplate,
        regionId: 'eurRegionId'
      })

      fireEvent.mouseOver(screen.getByTestId('ShareLanguageRow-496'))
      expect(
        within(screen.getByTestId('ShareLanguageRow-496')).getByText(
          'Share language'
        )
      ).toHaveAttribute('data-state', 'hovered')

      fireEvent.click(screen.getByTestId('ShareLanguageRow-496'))
      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'regionShareId'
      )
    })
  })
})
