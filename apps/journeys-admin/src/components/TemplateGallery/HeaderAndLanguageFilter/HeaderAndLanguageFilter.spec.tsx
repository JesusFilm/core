import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { getLanguagesMock } from '../data'

import { HeaderAndLanguageFilter } from '.'

import '../../../../test/i18n'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('HeaderAndLanguageFilter', () => {
  it('should open the language filter popper on button click', async () => {
    const onChange = jest.fn()
    const push = jest.fn()
    const on = jest.fn()

    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    const { getByRole, getAllByRole, getAllByText, getByTestId } = render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <HeaderAndLanguageFilter selectedLanguageIds={[]} onChange={onChange} />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(getAllByText('Journey Templates')[0]).toBeInTheDocument()
      fireEvent.click(getAllByRole('heading', { name: 'All Languages' })[0])
    })
    fireEvent.click(getByRole('button', { name: 'German, Standard Deutsch' }))
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1))
    fireEvent.click(getByRole('button', { name: 'French Français' }))
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(2))
    fireEvent.click(getByTestId('PresentationLayer'))
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(3))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith({
        query: { param: 'template-language' },
        push,
        events: {
          on
        }
      })
    })
  })

  it('should allow users to remove languages', async () => {
    const onChange = jest.fn()
    const push = jest.fn()
    const on = jest.fn()

    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    const { getByRole, getAllByRole } = render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <HeaderAndLanguageFilter
          selectedLanguageIds={['529', '496']}
          onChange={onChange}
        />
      </MockedProvider>
    )

    await waitFor(() => {
      fireEvent.click(getAllByRole('heading', { name: 'English, French' })[0])
    })

    fireEvent.click(getByRole('button', { name: 'French Français' }))

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(['529'])
    })

    fireEvent.click(getByRole('button', { name: 'English' }))

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith([])
    })
  })
})
