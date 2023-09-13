import { render } from '@testing-library/react'

import { ActionInformation } from './ActionInformation'

describe('ActionInformation', () => {
  it('should render action information', () => {
    const { getByText, getByTestId } = render(<ActionInformation />)
    expect(getByText('What are Goals?')).toBeInTheDocument()
    expect(getByText('Start a Conversation')).toBeInTheDocument()
    expect(getByText('Visit a Website')).toBeInTheDocument()
    expect(getByText('Link to Bible')).toBeInTheDocument()
    expect(getByTestId('MessageChat1Icon')).toBeInTheDocument()
    expect(getByTestId('WebIcon')).toBeInTheDocument()
    expect(getByTestId('BookIcon')).toBeInTheDocument()
  })
})
