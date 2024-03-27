import { fireEvent, render } from '@testing-library/react'

import { GetAdminJourneys_journeys as Journeys } from '../../../../../__generated__/GetAdminJourneys'

import { DefaultJourneyForm } from './DefaultJourneyForm'

describe('DefaultJourneyForm', () => {
  const handleOnchange = jest.fn()

  it('should call handle on change', () => {
    const { getByRole } = render(
      <DefaultJourneyForm
        handleOnChange={handleOnchange}
        domainName="www.mockDomain.com"
        defaultValue="1"
        journeys={
          [
            { id: '1', title: 'Journey1' },
            { id: '2', title: 'Journey2' }
          ] as Journeys[]
        }
      />
    )

    fireEvent.mouseDown(getByRole('combobox'))
    fireEvent.click(getByRole('option', { name: 'Journey2' }))
    expect(handleOnchange).toHaveBeenCalled()
  })
})
