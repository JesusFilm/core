import { render, screen } from '@testing-library/react'

import { CampaignSectionHeading } from './CampaignSectionHeading'

describe('CampaignSectionHeading', () => {
  it('renders nothing when every field is empty', () => {
    const { container } = render(
      <CampaignSectionHeading eyebrow="" title={null} lede="  " />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('keeps the line breaks the author typed in every field', () => {
    render(
      <CampaignSectionHeading
        eyebrow={'Why\nit matters'}
        title={'A story\nfor every home'}
        lede={'Short films.\nIn your language.'}
      />
    )

    for (const [testId, text] of [
      ['CampaignEyebrow', 'Why\nit matters'],
      ['CampaignTitle', 'A story\nfor every home'],
      ['CampaignLede', 'Short films.\nIn your language.']
    ]) {
      const field = screen.getByTestId(testId)
      expect(field.textContent).toBe(text)
      expect(field).toHaveStyle({ whiteSpace: 'pre-line' })
    }
  })
})
