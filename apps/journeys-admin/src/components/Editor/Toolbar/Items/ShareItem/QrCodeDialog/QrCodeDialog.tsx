import { gql, useMutation, useQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { GetJourneyForSharing_journey as JourneyFromLazyQuery } from '../../../../../../../__generated__/GetJourneyForSharing'
import {
  GetJourneyQrCodes,
  GetJourneyQrCodesVariables
} from '../../../../../../../__generated__/GetJourneyQrCodes'
import { JourneyFields as JourneyFromContext } from '../../../../../../../__generated__/JourneyFields'
import {
  QrCodeCreate,
  QrCodeCreateVariables
} from '../../../../../../../__generated__/QrCodeCreate'
import { QrCodeFields as QrCode } from '../../../../../../../__generated__/QrCodeFields'

import { CodeActionButton } from './CodeActionButton'
import { CodeCanvas } from './CodeCanvas'
import { QR_CODE_FIELDS } from './qrCodeFields'
import { ScanCount } from './ScanCount'

export const GET_JOURNEY_QR_CODES = gql`
  ${QR_CODE_FIELDS}
  query GetJourneyQrCodes($where: QrCodesFilter!) {
    qrCodes(where: $where) {
      ...QrCodeFields
    }
  }
`

export const QR_CODE_CREATE = gql`
  ${QR_CODE_FIELDS}
  mutation QrCodeCreate($input: QrCodeCreateInput!) {
    qrCodeCreate(input: $input) {
      ...QrCodeFields
    }
  }
`

interface QrCodeDialogProps {
  open: boolean
  onClose: () => void

  journey?: JourneyFromContext | JourneyFromLazyQuery
}

export function QrCodeDialog({
  open,
  onClose,
  journey
}: QrCodeDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const [qrCodeCreate, { loading: createLoading }] = useMutation<
    QrCodeCreate,
    QrCodeCreateVariables
  >(QR_CODE_CREATE)

  const [loading, setLoading] = useState(true)

  const {
    data,
    loading: getLoading,
    refetch
  } = useQuery<GetJourneyQrCodes, GetJourneyQrCodesVariables>(
    GET_JOURNEY_QR_CODES,
    {
      variables: {
        where: {
          journeyId: journey?.id
        }
      },
      skip: journey?.id == null
    }
  )

  useEffect(() => {
    void refetch()
  }, [journey?.slug, refetch])

  const qrCode = data?.qrCodes[0]
  const shortLink = getShortLink(qrCode)

  useEffect(() => {
    if (getLoading || createLoading) {
      setLoading(true)
    } else {
      setLoading(false)
    }
  }, [getLoading, createLoading])

  async function handleGenerateQrCode(): Promise<void> {
    if (journey?.id == null || journey?.team?.id == null) return
    await qrCodeCreate({
      variables: {
        input: {
          journeyId: journey.id,
          teamId: journey.team.id
        }
      },
      update(cache, { data }) {
        if (data?.qrCodeCreate != null) {
          cache.modify({
            fields: {
              qrCodes(existingQrCodes = []) {
                const newQrCodeRef = cache.writeFragment({
                  data: data.qrCodeCreate,
                  fragment: gql`
                    fragment NewQrCode on QrCode {
                      id
                    }
                  `
                })
                return [...existingQrCodes, newQrCodeRef]
              }
            }
          })
        }
      },
      onError: () => {
        enqueueSnackbar(t('Failed to create QR Code'), {
          variant: 'error',
          preventDuplicate: true
        })
      }
    })
  }

  function getShortLink(qrCode?: QrCode): string | undefined {
    if (qrCode == null) return undefined

    const hostname = qrCode.shortLink.domain.hostname
    const pathname = qrCode.shortLink.pathname
    const isLocal = hostname === 'localhost'

    const protocol = isLocal ? 'http:' : 'https:'
    const port = isLocal ? ':4100' : ''

    return `${protocol}//${hostname}${port}/${pathname}`
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose()
      }}
      dialogTitle={{
        title: t('QR Code'),
        closeButton: true
      }}
    >
      <Stack
        sx={{
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 4, sm: 7 },
          alignItems: 'center'
        }}
      >
        <CodeCanvas shortLink={shortLink} loading={loading} />
        <Stack
          spacing={3}
          sx={{
            alignItems: { xs: 'center', sm: 'start' }
          }}
        >
          <ScanCount shortLinkId={qrCode?.shortLink.id} />
          <CodeActionButton
            shortLink={shortLink}
            loading={loading}
            handleGenerateQrCode={handleGenerateQrCode}
          />
          <Typography variant="body2" color="secondary.main">
            {t(
              'Here is the unique QR code for your Journey. You can change the Journey URL without needing to re-generate the QR code'
            )}
          </Typography>
        </Stack>
      </Stack>
    </Dialog>
  )
}
