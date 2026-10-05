import { ReadableStream, TransformStream, WritableStream } from 'stream/web'

import { MockLink } from '@apollo/client/testing'
import {
  toBeChecked,
  toBeDisabled,
  toBeEmpty,
  toBeEmptyDOMElement,
  toBeEnabled,
  toBeInTheDOM,
  toBeInTheDocument,
  toBeInvalid,
  toBePartiallyChecked,
  toBePartiallyPressed,
  toBePressed,
  toBeRequired,
  toBeValid,
  toBeVisible,
  toContainElement,
  toContainHTML,
  toHaveAccessibleDescription,
  toHaveAccessibleErrorMessage,
  toHaveAccessibleName,
  toHaveAttribute,
  toHaveClass,
  toHaveDescription,
  toHaveDisplayValue,
  toHaveErrorMessage,
  toHaveFocus,
  toHaveFormValues,
  toHaveRole,
  toHaveSelection,
  toHaveStyle,
  toHaveTextContent,
  toHaveValue
} from '@testing-library/jest-dom/matchers'
import { configure } from '@testing-library/react'
import { expect } from 'vitest'

// Apollo Client 4 gives unspecified mocks a "realistic" random delay of
// 20-50ms. The suite was written against v3's immediate responses, so restore
// that default; individual mocks can still opt into a `delay`.
MockLink.defaultOptions = { delay: 0 }

expect.extend({
  toBeChecked,
  toBeDisabled,
  toBeEmpty,
  toBeEmptyDOMElement,
  toBeEnabled,
  toBeInTheDOM,
  toBeInTheDocument,
  toBeInvalid,
  toBePartiallyChecked,
  toBePartiallyPressed,
  toBePressed,
  toBeRequired,
  toBeValid,
  toBeVisible,
  toContainElement,
  toContainHTML,
  toHaveAccessibleDescription,
  toHaveAccessibleErrorMessage,
  toHaveAccessibleName,
  toHaveAttribute,
  toHaveClass,
  toHaveDescription,
  toHaveDisplayValue,
  toHaveErrorMessage,
  toHaveFocus,
  toHaveFormValues,
  toHaveRole,
  toHaveSelection,
  toHaveStyle,
  toHaveTextContent,
  toHaveValue
})

if (typeof globalThis.TransformStream === 'undefined') {
  Object.assign(globalThis, { ReadableStream, TransformStream, WritableStream })
}

configure({ asyncUtilTimeout: 2500 })

vi.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }) => <img src={src} alt={alt} />
}))
