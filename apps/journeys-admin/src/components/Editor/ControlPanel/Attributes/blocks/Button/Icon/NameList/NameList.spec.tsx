import { render, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { NameList } from '.'

describe('Button color selector', () => {
  it('should show button button for drop down', () => {
    const { getByRole } = render(
      <MockedProvider>
        <NameList id={'button-name-id'} name={undefined} disabled={false} />
      </MockedProvider>
    )
    expect(getByRole('button')).toBeInTheDocument()
  })
  it('should change the icon', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <NameList id={'button-name-id'} name={undefined} disabled={false} />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button')) // drop down not oepning
    fireEvent.click(getByRole('option', { name: 'ArrowForwardRounded' }))
    expect(getByRole('option', { name: 'ArrowForwardRounded' })).toHaveClass(
      'Mui-selected'
    )
  })
})
