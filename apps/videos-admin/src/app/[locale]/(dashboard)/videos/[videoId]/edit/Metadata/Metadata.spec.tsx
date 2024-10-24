import { MockedProvider } from "@apollo/client/testing"
import { render } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { Metadata } from "./Metadata"

describe('Metadata', () => {
  it('should render loading fallback', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <Metadata loading={true} video={{}} />
        </MockedProvider>
      </NextIntlClientProvider>
    )
  })

  it('should render with data', () => {

  })
})