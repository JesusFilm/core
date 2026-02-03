import { Button, Column, Row } from '@react-email/components'
import { ReactElement } from 'react'

export function JesusFilmVerificationFooter(): ReactElement {
  return (
    <Row>
      <Column align="center">
        <Button
          className="mb-[12px] rounded-lg border-2 border-solid border-[#26262D4D] px-5 py-3 text-center text-[16px] font-semibold text-[#26262D] no-underline"
          href="https://www.jesusfilm.org/watch/use-this-app-to-share-the-story-of-jesus.html/english.html"
          style={{
            font: '16px "Open Sans", sans-serif'
          }}
        >
          Learn More
        </Button>
      </Column>
    </Row>
  )
}
