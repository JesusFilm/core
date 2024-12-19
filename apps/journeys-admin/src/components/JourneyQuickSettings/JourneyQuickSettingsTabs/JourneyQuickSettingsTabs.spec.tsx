import { fireEvent, render } from '@testing-library/react'

import { JourneyQuickSettingsTabs } from './JourneyQuickSettingsTabs'

describe('JourneyQuickSettingsTabs', () => {
  it('should select first tab when tab value is zero', () => {
    const { getByRole } = render(
      <JourneyQuickSettingsTabs tabValue={0} setTabValue={jest.fn()} />
    )

    expect(getByRole('tab', { selected: true })).toHaveTextContent('Chat')
  })

  it('should select goals tab when clicked', () => {
    const setTabValue = jest.fn()
    const { getByRole } = render(
      <JourneyQuickSettingsTabs tabValue={0} setTabValue={setTabValue} />
    )

    fireEvent.click(getByRole('tab', { name: 'Goals' }))
    expect(setTabValue).toHaveBeenCalledWith(1)
  })
})
