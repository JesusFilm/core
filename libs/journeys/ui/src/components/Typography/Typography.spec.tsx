import { createTheme } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'

import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../__generated__/globalTypes'
import type { TreeBlock } from '../../libs/block'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../libs/JourneyProvider/__generated__/JourneyFields'

import { TypographyFields } from './__generated__/TypographyFields'
import { Typography } from './Typography'

const theme = createTheme()

const block: TreeBlock<TypographyFields> = {
  __typename: 'TypographyBlock',
  id: 'heading3',
  parentBlockId: 'question',
  parentOrder: 0,
  content: 'Hello World!',
  variant: TypographyVariant.h3,
  color: TypographyColor.primary,
  align: TypographyAlign.left,
  children: [],
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
}

describe('Typography', () => {
  it('should render successfully', () => {
    const { getByRole } = render(<Typography {...block} />)
    expect(
      getByRole('heading', { name: 'Hello World!', level: 3 })
    ).toBeInTheDocument()
  })

  it('should render overline as paragraph', () => {
    const { getByText } = render(
      <Typography {...block} variant={TypographyVariant.overline} />
    )
    expect(getByText('Hello World!').tagName).toBe('P')
  })

  it('should render caption as paragraph', () => {
    const { getByText } = render(
      <Typography {...block} variant={TypographyVariant.caption} />
    )
    expect(getByText('Hello World!').tagName).toBe('P')
  })

  it('should apply a hex color from settings', () => {
    render(
      <Typography
        {...block}
        settings={{ __typename: 'TypographyBlockSettings', color: '#EBB109' }}
      />
    )

    expect(screen.getByTestId('JourneysTypography')).toHaveStyle({
      color: '#EBB109'
    })
  })

  it('should fall back to the palette color when settings has no color', () => {
    render(<Typography {...block} color={TypographyColor.error} />)

    expect(screen.getByTestId('JourneysTypography')).toHaveStyle({
      color: theme.palette.error.main
    })
  })

  it('should use the disabled text color when content is empty', () => {
    render(
      <Typography
        {...block}
        content=""
        placeholderText="Add your text here..."
        settings={{ __typename: 'TypographyBlockSettings', color: '#EBB109' }}
      />
    )

    expect(screen.getByTestId('JourneysTypography')).toHaveStyle({
      color: theme.palette.text.disabled
    })
  })

  it('should render placholder text if content is empty', () => {
    const emptyContentMock = {
      ...block,
      content: '',
      placeholderText: 'Add your text here...'
    }

    render(<Typography {...emptyContentMock} />)

    expect(
      screen.getByRole('heading', { name: 'Add your text here...', level: 3 })
    ).toHaveTextContent('Add your text here...')
  })

  it('should render editable content text', () => {
    const editableContent = <>hello</>
    const emptyContentMock = {
      ...block,
      content: '',
      placeholderText: 'Add your text here...',
      editableContent
    }

    render(<Typography {...emptyContentMock} />)

    expect(
      screen.getByRole('heading', { name: 'hello', level: 3 })
    ).toHaveTextContent('hello')
  })

  it('resolves content using journey customization fields in default render mode', () => {
    const journey = {
      journeyCustomizationFields: [
        {
          __typename: 'JourneyCustomizationField',
          id: '1',
          journeyId: 'journeyId',
          key: 'name',
          value: 'Alice',
          defaultValue: 'Anonymous'
        }
      ]
    } as unknown as Journey

    const blockWithTemplate = { ...block, content: '{{ name }}' }

    render(
      <JourneyProvider value={{ journey, renderMode: 'default' }}>
        <Typography {...blockWithTemplate} />
      </JourneyProvider>
    )

    expect(
      screen.getByRole('heading', { name: 'Alice', level: 3 })
    ).toBeInTheDocument()
  })

  it('does not resolve content in admin render mode for template journeys', () => {
    const journey = {
      template: true,
      journeyCustomizationFields: [
        {
          __typename: 'JourneyCustomizationField',
          id: '1',
          journeyId: 'journeyId',
          key: 'name',
          value: 'Alice',
          defaultValue: 'Anonymous'
        }
      ]
    } as unknown as Journey

    const blockWithTemplate = { ...block, content: '{{ name }}' }

    render(
      <JourneyProvider value={{ journey, renderMode: 'admin' }}>
        <Typography {...blockWithTemplate} />
      </JourneyProvider>
    )

    expect(
      screen.getByRole('heading', { name: '{{ name }}', level: 3 })
    ).toBeInTheDocument()
  })

  it('replaces custom fields within mixed strings and leaves other text intact', () => {
    const journey = {
      journeyCustomizationFields: [
        {
          __typename: 'JourneyCustomizationField',
          id: '1',
          journeyId: 'journeyId',
          key: 'name',
          value: 'Alice',
          defaultValue: 'Anonymous'
        }
      ]
    } as unknown as Journey

    const blockWithTemplate = { ...block, content: 'Hello {{ name }}!' }

    render(
      <JourneyProvider value={{ journey, renderMode: 'default' }}>
        <Typography {...blockWithTemplate} />
      </JourneyProvider>
    )

    expect(
      screen.getByRole('heading', { name: 'Hello Alice!', level: 3 })
    ).toBeInTheDocument()
  })

  it('uses defaultValue when value is null', () => {
    const journey = {
      journeyCustomizationFields: [
        {
          __typename: 'JourneyCustomizationField',
          id: '2',
          journeyId: 'journeyId',
          key: 'title',
          value: null,
          defaultValue: 'Child of God'
        }
      ]
    } as unknown as Journey

    const blockWithTemplate = { ...block, content: '{{ title }}' }

    render(
      <JourneyProvider value={{ journey, renderMode: 'default' }}>
        <Typography {...blockWithTemplate} />
      </JourneyProvider>
    )

    expect(
      screen.getByRole('heading', { name: 'Child of God', level: 3 })
    ).toBeInTheDocument()
  })
})
