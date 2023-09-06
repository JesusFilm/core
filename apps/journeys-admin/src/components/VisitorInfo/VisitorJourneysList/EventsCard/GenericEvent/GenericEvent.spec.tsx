import { render } from '@testing-library/react'

import { EventVariant } from '../../utils'

import { GenericEvent } from '.'

describe('GenericEvent', () => {
  it('should render text', () => {
    const { getByText } = render(
      <GenericEvent
        label="button label"
        value="button text"
        activity="button clicked"
        duration="0.10"
      />
    )
    expect(getByText('0.10')).toBeInTheDocument()
    expect(getByText('button text')).toBeInTheDocument()
    expect(getByText('button clicked')).toBeInTheDocument()
    expect(getByText('button label')).toBeInTheDocument()
  })

  it('should show createdAt date for position start', () => {
    const { getByText, queryByText } = render(
      <GenericEvent
        createdAt="2021-02-18T00:00:00.000Z"
        duration="0.10"
        variant={EventVariant.start}
      />
    )
    expect(queryByText('0.01')).not.toBeInTheDocument()
    expect(getByText('12:00 AM')).toBeInTheDocument()
  })
})
