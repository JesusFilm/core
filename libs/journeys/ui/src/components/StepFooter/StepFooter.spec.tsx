import { fireEvent, render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../libs/JourneyProvider/__generated__/JourneyFields'
import { StepFooter } from './StepFooter'

describe('StepFooter', () => {
  const journey: Journey = {
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
          primary: true
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
    seoTitle: 'My awesome journey',
    seoDescription: null,
    chatButtons: [],
    host: {
      id: 'hostId',
      __typename: 'Host',
      teamId: 'teamId',
      title: 'Cru International',
      location: 'Florida, USA',
      src1: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      src2: null
    }
  }

  it('should display host avatar, name and location', () => {
    const { getByTestId } = render(
      <JourneyProvider value={{ journey }}>
        <StepFooter />
      </JourneyProvider>
    )

    expect(getByTestId('host-avatars')).toBeInTheDocument()
    expect(getByTestId('host-name-location')).toBeInTheDocument()
  })

  it('should display social media journey title by default', () => {
    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey }}>
          <StepFooter />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByText('My awesome journey')).toBeInTheDocument()
  })

  it('should display journey title if no social media title', () => {
    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey: { ...journey, seoTitle: null } }}>
          <StepFooter />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByText('my journey')).toBeInTheDocument()
  })

  it('should render custom styles', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey }}>
          <StepFooter sx={{ outline: '1px solid red' }} />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByTestId('stepFooter')).toHaveStyle('outline: 1px solid red')
  })

  it('should call onFooterClick on click', () => {
    const onFooterClick = jest.fn()
    const { getByTestId } = render(
      <MockedProvider>
        <JourneyProvider
          value={{ admin: true, journey: { ...journey, seoTitle: null } }}
        >
          <StepFooter onFooterClick={onFooterClick} />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('stepFooter'))

    expect(onFooterClick).toBeCalledTimes(1)
    expect(getByTestId('Plus2Icon')).toBeInTheDocument()
  })
})
