import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { GET_LANGUAGES } from './LanguageSelect'
import { LanguageSelect } from '.'

describe('LanguageSelect', () => {
  const mocks = [
    {
      request: {
        query: GET_LANGUAGES,
        variables: {
          languageId: '529'
        }
      },
      result: {
        data: {
          languages: [
            {
              id: '529',
              name: [
                {
                  value: 'English',
                  primary: true
                }
              ]
            },
            {
              id: '496',
              name: [
                {
                  value: 'Français',
                  primary: true
                },
                {
                  value: 'French',
                  primary: false
                }
              ]
            },
            {
              id: '1106',
              name: [
                {
                  value: 'Deutsch',
                  primary: true
                },
                {
                  value: 'German, Standard',
                  primary: false
                }
              ]
            }
          ]
        }
      }
    }
  ]

  it('should select languages based on selectedId', async () => {
    const handleChange = jest.fn()
    const result = jest.fn(() => mocks[0].result)
    const { getByRole } = render(
      <MockedProvider mocks={[{ ...mocks[0], result }]}>
        <LanguageSelect onChange={handleChange} currentLanguageId="529" />
      </MockedProvider>
    )
    fireEvent.focus(getByRole('textbox'))
    fireEvent.keyDown(getByRole('textbox'), { key: 'ArrowDown' })
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getByRole('option', { name: 'French Français' }))
    expect(handleChange).toHaveBeenCalledWith('496')
  })

  it('should set default value based on selectedId', async () => {
    const result = jest.fn(() => mocks[0].result)
    const { getByRole } = render(
      <MockedProvider mocks={[{ ...mocks[0], result }]}>
        <LanguageSelect
          onChange={jest.fn()}
          value="1106"
          currentLanguageId="529"
        />
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(getByRole('textbox')).toHaveValue('German, Standard')
  })
})
