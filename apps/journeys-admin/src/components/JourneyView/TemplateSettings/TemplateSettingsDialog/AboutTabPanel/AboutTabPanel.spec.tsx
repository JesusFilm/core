import { fireEvent, render } from '@testing-library/react'

import { AboutTabPanel } from './AboutTabPanel'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('AboutTabPanel', () => {
  afterEach(() => jest.clearAllMocks())

  const handleChange = jest.fn()

  it('should call onChange on form change', async () => {
    const { getByLabelText } = render(
      <AboutTabPanel
        name="strategySlug"
        errors={{ strategySlug: '' }}
        value=""
        tabValue={3}
        onChange={handleChange}
      />
    )

    fireEvent.change(getByLabelText('Paste URL here'), {
      target: { value: 'https://www.canva.com/design/DAFvDBw1z1A/view' }
    })
    expect(handleChange).toHaveBeenCalled()
  })

  it('should validate form on error', async () => {
    const { getByText } = render(
      <AboutTabPanel
        name="strategySlug"
        errors={{ strategySlug: 'Invalid embed link' }}
        value="some invalid value"
        tabValue={3}
        onChange={handleChange}
      />
    )

    expect(getByText('Invalid embed link')).toBeInTheDocument()
  })

  it('should render strategy section preview', async () => {
    const { queryByText, getByTestId } = render(
      <AboutTabPanel
        name="strategySlug"
        errors={{ strategySlug: '' }}
        value="https://www.canva.com/design/DAFvDBw1z1A/view"
        tabValue={3}
        onChange={handleChange}
      />
    )

    expect(queryByText('Strategy')).not.toBeInTheDocument()
    expect(getByTestId('strategy-iframe')).toBeInTheDocument()
  })
})
