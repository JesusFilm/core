import { render, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import {
  IconName,
  IconColor,
  IconSize
} from '../../../../../../../../__generated__/globalTypes'
import { Icon } from '.'

describe('Button color selector', () => {
  it('should show button button for drop down', () => {
    const { getByText } = render(
      <MockedProvider>
        <Icon
          id={'button-Icon-id'}
          iconName={undefined}
          iconColor={null}
          iconSize={null}
        />
      </MockedProvider>
    )
    expect(getByText('Show Icon')).toBeInTheDocument()
    expect(getByText('Show/Hide Icon on Button')).toBeInTheDocument()
  })
  it('should change the icon', async () => {
    const { getByText } = render(
      <MockedProvider>
        <Icon
          id={'button-Icon-id'}
          iconName={IconName.ArrowForwardRounded}
          iconColor={IconColor.error}
          iconSize={IconSize.sm}
        />
      </MockedProvider>
    )
    expect(getByText('Color')).toBeInTheDocument()
    expect(getByText('Size')).toBeInTheDocument()
  })

  it('should open menu when an icon is selected', async () => {
    const { getByRole, getByText, queryByText } = render(
      <MockedProvider>
        <Icon
          id={'button-Icon-id'}
          iconName={undefined}
          iconColor={null}
          iconSize={null}
        />
      </MockedProvider>
    )

    expect(queryByText('Color')).not.toBeInTheDocument()
    expect(queryByText('Size')).not.toBeInTheDocument()

    fireEvent.mouseDown(getByRole('button', { name: 'icon-name-select' }))
    fireEvent.click(getByRole('option', { name: 'Arrowforwardrounded' }))

    expect(getByText('Color')).toBeInTheDocument()
    expect(getByText('Size')).toBeInTheDocument()
  })
})
