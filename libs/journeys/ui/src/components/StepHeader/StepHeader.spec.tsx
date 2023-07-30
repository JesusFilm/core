import { fireEvent, render } from '@testing-library/react'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../libs/JourneyProvider/__generated__/JourneyFields'
import { StepHeader } from './StepHeader'

describe('StepHeader', () => {
  const defaultJourneyWithTeam: Journey = {
    __typename: 'Journey',
    id: 'journeyId',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    title: 'my journey',
    slug: 'my-journey',
    language: {
      __typename: 'Language',
      id: '529',
      bcp47: 'en',
      iso3: 'eng',
      name: [
        {
          __typename: 'Translation',
          value: 'English',
          primary: false
        }
      ]
    },
    description: 'my cool journey',
    status: JourneyStatus.draft,
    createdAt: '2021-11-19T12:34:56.647Z',
    publishedAt: null,
    blocks: [],
    primaryImageBlock: null,
    userJourneys: [],
    template: null,
    seoTitle: null,
    seoDescription: null,
    chatButtons: [],
    host: null,
    team: {
      __typename: 'Team',
      id: 'teamId',
      title: 'My Cool Team'
    }
  }
  it('should have report contact button', () => {
    const { getByRole } = render(<StepHeader />)
    fireEvent.click(getByRole('button'))

    expect(
      getByRole('menuitem', { name: 'Report this content' })
    ).toHaveAttribute(
      'href',
      'mailto:support@nextstep.is?subject=Report%20Journey:%20&body=I want to report journey (your.nextstep.is/) because ...'
    )
  })

  it('should have the terms and conditions link', () => {
    const { getByRole } = render(<StepHeader />)
    fireEvent.click(getByRole('button'))
    expect(getByRole('link', { name: 'Terms & Conditions' })).toHaveAttribute(
      'href',
      'https://www.cru.org/us/en/about/terms-of-use.html'
    )
  })

  it('should have the privacy policy link', () => {
    const { getByRole } = render(<StepHeader />)
    fireEvent.click(getByRole('button'))
    expect(getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'href',
      'https://www.cru.org/us/en/about/privacy.html'
    )
  })

  it('should have the journey creator privacy policy', () => {
    const { getByText, getByRole } = render(<StepHeader />)
    fireEvent.click(getByRole('button'))
    expect(
      getByText(
        'All personal identifiable data registered on this website will be processed by journey creator: "".'
      )
    ).toBeInTheDocument()
  })

  it('should have the journey creator identified by originating team of journey in privacy policy', () => {
    const { getByText, getByRole } = render(
      <JourneyProvider value={{ journey: defaultJourneyWithTeam }}>
        <StepHeader />
      </JourneyProvider>
    )
    fireEvent.click(getByRole('button'))
    expect(
      getByText(
        'All personal identifiable data registered on this website will be processed by journey creator: "My Cool Team".'
      )
    ).toBeInTheDocument()
  })
})
