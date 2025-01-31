import { gql } from '@apollo/client'

export const QR_CODE_FIELDS = gql`
  fragment QrCodeFields on QrCode {
    id
    toJourneyId
    shortLink {
      domain {
        hostname
      }
      pathname
      to
    }
  }
`
