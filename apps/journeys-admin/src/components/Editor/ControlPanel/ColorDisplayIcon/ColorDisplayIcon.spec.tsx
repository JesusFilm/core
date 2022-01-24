import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { TypographyColor } from '../../../../../__generated__/globalTypes'
import { ColorDisplayIcon } from '.'

describe('ColorDisplayIcon', () => {
  it('should show the color', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <ColorDisplayIcon color={TypographyColor.primary} />
      </MockedProvider>
    )
    expect(getByTestId('color-display-icon')).toHaveStyle(
      'background-color: rgb(255, 255, 255)'
    )
  })
})
