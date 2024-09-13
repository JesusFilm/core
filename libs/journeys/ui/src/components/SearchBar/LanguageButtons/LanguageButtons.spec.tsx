import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'

import { SearchBarProvider } from '../../../libs/algolia/SearchBarProvider'
import { getLanguagesContinentsMock } from '../../../libs/useLanguagesContinentsQuery/useLanguagesContinentsQuery.mock'
import { languageRefinements } from '../data'

import { LanguageButtons } from './LanguageButtons'

describe('LanguageButtons', () => {
  const refinements = {
    items: languageRefinements,
    refine: jest.fn()
  } as unknown as RefinementListRenderState

  const refinementsWithRefinedValue = {
    items: [
      {
        ...languageRefinements[0],
        isRefined: true
      },
      ...languageRefinements
    ],
    refine: jest.fn()
  } as unknown as RefinementListRenderState

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the language button with default text', () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider>
          <LanguageButtons onClick={jest.fn()} refinements={refinements} />
        </SearchBarProvider>
      </MockedProvider>
    )
    expect(
      screen.getAllByRole('button', { name: 'Language' })[0]
    ).toBeInTheDocument()
  })

  it('should call onClick on language button click', () => {
    const onClick = jest.fn()

    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider>
          <LanguageButtons onClick={onClick} refinements={refinements} />
        </SearchBarProvider>
      </MockedProvider>
    )

    const button = screen.getAllByRole('button', { name: 'Language' })[0]
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalled()
  })

  it('should render the button with a selected language', () => {
    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider>
          <LanguageButtons
            onClick={jest.fn()}
            refinements={refinementsWithRefinedValue}
          />
        </SearchBarProvider>
      </MockedProvider>
    )
    expect(
      screen.getAllByRole('button', { name: 'English' })[0]
    ).toBeInTheDocument()
  })

  it('should render language buttons with multiple languages selected and with count', () => {
    const selectedRefinements = {
      items: [
        {
          ...languageRefinements[0],
          isRefined: true
        },
        {
          ...languageRefinements[1],

          isRefined: true
        },
        {
          ...languageRefinements[2],
          isRefined: true
        },
        ...languageRefinements
      ],
      refine: jest.fn()
    } as unknown as RefinementListRenderState

    render(
      <MockedProvider mocks={[getLanguagesContinentsMock]}>
        <SearchBarProvider>
          <LanguageButtons
            onClick={jest.fn()}
            refinements={selectedRefinements}
          />
        </SearchBarProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Spanish' })).toBeInTheDocument()
    expect(screen.getByText('+1')).toBeInTheDocument()
  })
})
