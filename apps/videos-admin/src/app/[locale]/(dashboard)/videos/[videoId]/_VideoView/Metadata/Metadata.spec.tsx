import { MockedProvider } from "@apollo/client/testing"
import { render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { mockVideo } from '../data.mock'

import { Metadata } from "./Metadata"

describe('Metadata', () => {
  it('should render loading fallback', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <Metadata loading video={{}} />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should render with data', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <Metadata loading={false} video={mockVideo} />
        </MockedProvider>
      </NextIntlClientProvider>
    )

  expect(screen.getByText('Information')).toBeInTheDocument()
  expect(screen.getByText('Image')).toBeInTheDocument()
  expect(screen.getByText('Snippet')).toBeInTheDocument()
  expect(screen.getByText('Description')).toBeInTheDocument()
  expect(screen.getByText('Study Questions')).toBeInTheDocument()
  })
})