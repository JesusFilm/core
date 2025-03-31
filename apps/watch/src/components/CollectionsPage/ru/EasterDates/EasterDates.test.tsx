import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { EasterDates } from './EasterDates'

describe('EasterDates (Russian)', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(2024, 2, 15))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('отображает компонент дат Пасхи с правильным годом', () => {
    render(<EasterDates />)

    // Check that the component renders with the correct year in Russian
    expect(
      screen.getByText('Когда отмечается Пасха в 2024 году?')
    ).toBeInTheDocument()
  })

  it('изначально отображается в свернутом состоянии', () => {
    render(<EasterDates />)

    // The details should not be visible initially
    expect(
      screen.queryByText('Западная Пасха (католическая/протестантская)')
    ).not.toBeVisible()
    expect(screen.queryByText('Православная')).not.toBeVisible()
    expect(screen.queryByText('Еврейская Пасха (Песах)')).not.toBeVisible()
  })

  it('раскрывается при клике и показывает правильные даты', () => {
    render(<EasterDates />)

    // Click to expand
    const accordionHeader = screen.getByText(
      'Когда отмечается Пасха в 2024 году?'
    )
    fireEvent.click(accordionHeader)

    // Now the details should be visible
    expect(
      screen.getByText('Западная Пасха (католическая/протестантская)')
    ).toBeVisible()
    expect(screen.getByText('Православная')).toBeVisible()
    expect(screen.getByText('Еврейская Пасха (Песах)')).toBeVisible()

    // Verify the dates for 2024 (with Russian locale format)
    // These are approximate Russian date formats and would need to be adjusted
    // based on the actual format returned by toLocaleDateString with ru-RU locale
    expect(screen.getByText(/воскресенье, 31 марта 2024/i)).toBeInTheDocument() // Western Easter 2024
    expect(screen.getByText(/воскресенье, 5 мая 2024/i)).toBeInTheDocument() // Orthodox Easter 2024
    expect(screen.getByText(/суббота, 30 марта 2024/i)).toBeInTheDocument() // Passover 2024
  })

  it('сворачивается при повторном клике', async () => {
    render(<EasterDates />)

    // Click to expand
    const accordionHeader = screen.getByText(
      'Когда отмечается Пасха в 2024 году?'
    )
    fireEvent.click(accordionHeader)

    // Details should be visible
    expect(
      screen.getByText('Западная Пасха (католическая/протестантская)')
    ).toBeVisible()

    // Click again to collapse
    fireEvent.click(accordionHeader)

    // Now the details should not be visible again
    await waitFor(() => {
      expect(
        screen.queryByText('Западная Пасха (католическая/протестантская)')
      ).not.toBeVisible()
    })
  })

  it('имеет правильный data-testid атрибут', () => {
    render(<EasterDates />)

    // Verify that the component has the correct data-testid
    expect(screen.getByTestId('EasterDates')).toBeInTheDocument()
  })
})
