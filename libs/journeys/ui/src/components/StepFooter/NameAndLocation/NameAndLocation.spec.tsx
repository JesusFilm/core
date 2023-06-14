import { render } from '@testing-library/react'

import { JourneyProvider } from '../../../libs/JourneyProvider'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../__generated__/globalTypes'
import { NameAndLocation } from './NameAndLocation'

describe('NameAndLocation', () => {
  const mockProps = {
    name: 'Edmond Shen',
    location: 'Student Life',
    rtl: false,
    src1: undefined,
    src2: undefined,
    admin: true
  }

  const journey = {
    __typename: 'Journey' as const,
    id: 'journeyId',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    title: 'my journey',
    slug: 'my-journey',
    language: {
      __typename: 'Language' as const,
      id: '529',
      bcp47: 'ar',
      iso3: 'arb',
      name: [
        {
          __typename: 'Translation' as const,
          value: 'Arabic',
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
    seoDescription: null
  }

  it('renders the name and location correctly', () => {
    const { getByText } = render(<NameAndLocation {...mockProps} />)

    expect(getByText('Edmond Shen · Student Life')).toBeInTheDocument()
  })

  it('renders RTL correctly', () => {
    const props = {
      ...mockProps
    }

    const { getByText } = render(
      <JourneyProvider value={{ journey }}>
        <NameAndLocation {...props} />
      </JourneyProvider>
    )

    expect(getByText('Student Life · Edmond Shen')).toBeInTheDocument()
  })

  it('renders only the name when location is not provided', () => {
    const props = {
      ...mockProps,
      location: undefined
    }

    const { getByText, queryByText } = render(<NameAndLocation {...props} />)

    const nameElement = getByText('Edmond Shen')
    const locationElement = queryByText(' · Student Life')

    expect(nameElement).toBeInTheDocument()
    expect(locationElement).toBeNull()
  })
})
