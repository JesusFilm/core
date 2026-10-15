import { fireEvent, render, screen, within } from '@testing-library/react'
import { ReactElement } from 'react'

import { useCampaignEditor } from '../CampaignEditorProvider'
import { campaign } from '../data'
import { CommandProbe, StaticEditor } from '../testing'

import { PreviewLanguageChip } from './PreviewLanguageChip'

const FRENCH = campaign.languages[1].languageId

function PreviewLanguageProbe(): ReactElement {
  const {
    state: { previewLanguageId }
  } = useCampaignEditor()
  return <span data-testid="PreviewLanguageId">{previewLanguageId}</span>
}

function renderChip(campaignProp = campaign): ReturnType<typeof render> {
  return render(
    <StaticEditor campaignProp={campaignProp}>
      <CommandProbe />
      <PreviewLanguageProbe />
      <PreviewLanguageChip />
    </StaticEditor>
  )
}

describe('PreviewLanguageChip', () => {
  it('reads the current Preview Language and lists the campaign languages', () => {
    renderChip()

    const chip = screen.getByTestId('PreviewLanguageChip')
    expect(chip).toHaveTextContent('English')

    fireEvent.click(chip)

    const menu = screen.getByRole('menu', { name: 'Preview language' })
    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((item) => item.textContent)
    ).toEqual(['English', 'Français'])
    expect(
      within(menu).getByRole('menuitem', { name: 'English' })
    ).toHaveAttribute('aria-current', 'true')
  })

  it('switches the Preview Language without adding a Command', () => {
    renderChip()

    fireEvent.click(screen.getByTestId('PreviewLanguageChip'))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Français' }))

    expect(screen.getByTestId('PreviewLanguageId')).toHaveTextContent(FRENCH)
    expect(screen.getByTestId('PreviewLanguageChip')).toHaveTextContent(
      'Français'
    )
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  it('is absent while the campaign has one language', () => {
    renderChip({ ...campaign, languages: campaign.languages.slice(0, 1) })

    expect(screen.queryByTestId('PreviewLanguageChip')).not.toBeInTheDocument()
  })
})
