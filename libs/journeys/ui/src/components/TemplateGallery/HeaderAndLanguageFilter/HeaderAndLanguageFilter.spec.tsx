import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'
import { NextRouter, useRouter } from 'next/router'
import { type MockedFunction } from 'vitest'

import '../../../../test/i18n'
import { setBeaconPageViewed } from '../../../libs/beaconHooks'
import { getJourneyTemplateLanguageIdsMock, getLanguagesMock } from '../data'

import { HeaderAndLanguageFilter } from '.'

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn(() => ({ query: { tab: 'active' } }))
}))

vi.mock('../../../libs/beaconHooks', () => ({
  setBeaconPageViewed: vi.fn()
}))

const mockedUseRouter = useRouter as MockedFunction<typeof useRouter>

describe('HeaderAndLanguageFilter', () => {
  it('should open the language filter popper on button click', async () => {
    const onChange = vi.fn()
    const push = vi.fn()
    const on = vi.fn()

    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    render(
      <MockedProvider
        mocks={[getJourneyTemplateLanguageIdsMock, getLanguagesMock]}
      >
        <HeaderAndLanguageFilter selectedLanguageIds={[]} onChange={onChange} />
      </MockedProvider>
    )
    // Wait for both queries to resolve (template language IDs + languages)
    await waitFor(() => {
      expect(
        screen.getAllByRole('heading', { name: 'All Languages' })[0]
      ).toBeInTheDocument()
    })
    fireEvent.click(
      screen.getAllByRole('heading', { name: 'All Languages' })[0]
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'German, Standard Deutsch' })
    )
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1))
    fireEvent.click(screen.getByRole('button', { name: 'French Français' }))
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(2))
    fireEvent.click(screen.getByTestId('PresentationLayer'))
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(2))
    fireEvent.click(
      screen.getAllByRole('heading', { name: 'All Languages' })[0]
    )
    expect(setBeaconPageViewed).toHaveBeenCalledWith('template-language')
  })

  it('should show loading', () => {
    render(
      <MockedProvider
        mocks={[getJourneyTemplateLanguageIdsMock, getLanguagesMock]}
      >
        <HeaderAndLanguageFilter onChange={noop} />
      </MockedProvider>
    )
    expect(
      screen.getByTestId('local-language-loading-desktop')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('local-language-loading-mobile')
    ).toBeInTheDocument()
  })
})
