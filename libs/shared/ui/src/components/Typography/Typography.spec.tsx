import { render } from '@testing-library/react'

import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../__generated__/globalTypes'

import Typography from './Typography'

describe('Typography', () => {
  it('should render successfully', () => {
    const { getByRole } = render(
      <Typography
        __typename="TypographyBlock"
        id="heading3"
        parentBlockId="question"
        content={'Hello World!'}
        variant={TypographyVariant.h3}
        color={TypographyColor.primary}
        align={TypographyAlign.left}
      />
    )
    expect(
      getByRole('heading', { name: 'Hello World!', level: 3 })
    ).toBeTruthy()
  })
})
