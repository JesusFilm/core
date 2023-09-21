import { render } from '@testing-library/react'

import { GetJourneys_journeys as Journeys } from '../../../__generated__/GetJourneys'

import { journeys } from './data'
import { TemplateSection } from './TemplateSection'

describe('TemplateSection', () => {
  it('should render TemplateSection', () => {
    const { getByText } = render(
      <TemplateSection
        category="Easter"
        journeys={journeys as unknown as Journeys[]}
      />
    )
    expect(getByText('Easter')).toBeInTheDocument()
    // 1st card
    expect(getByText('I think I just sorted the problem')).toBeInTheDocument()
    // 2nd card
    expect(getByText('Dev Onboarding Journey')).toBeInTheDocument()
  })
})
