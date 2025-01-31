import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { QRCodeCanvas } from 'qrcode.react'
import { ReactElement, useEffect, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { Dialog } from '@core/shared/ui/Dialog'

import {
  GetJourneyQrCodes,
  GetJourneyQrCodesVariables,
  GetJourneyQrCodes_qrCodes as QrCode
} from '../../../../../../../__generated__/GetJourneyQrCodes'
import {
  QrCodeCreate,
  QrCodeCreateVariables
} from '../../../../../../../__generated__/QrCodeCreate'
import {
  QrCodeUpdate,
  QrCodeUpdateVariables
} from '../../../../../../../__generated__/QrCodeUpdate'

import { CodeDestination } from './CodeDestination'
import { DownloadQrCode } from './DownloadQrCode'
import { ScanCount } from './ScanCount'

export const GET_JOURNEY_QR_CODES = gql`
  query GetJourneyQrCodes($where: QrCodesFilter!) {
    qrCodes(where: $where) {
      id
      shortLink {
        domain {
          hostname
        }
        pathname
        to
      }
    }
  }
`

export const QR_CODE_CREATE = gql`
  mutation QrCodeCreate($input: QrCodeCreateInput!) {
    qrCodeCreate(input: $input) {
      id
      shortLink {
        domain {
          hostname
        }
        pathname
        to
      }
    }
  }
`

export const QR_CODE_UPDATE = gql`
  mutation QrCodeUpdate($id: ID!, $input: QrCodeUpdateInput!) {
    qrCodeUpdate(id: $id, input: $input) {
      id
      shortLink {
        domain {
          hostname
        }
        pathname
        to
      }
    }
  }
`

interface QrCodeDialogProps {
  open: boolean
  onClose: () => void
}

export function QrCodeDialog({
  open,
  onClose
}: QrCodeDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { enqueueSnackbar } = useSnackbar()
  const [qrCodeCreate, { loading: createLoading }] = useMutation<
    QrCodeCreate,
    QrCodeCreateVariables
  >(QR_CODE_CREATE)
  const [qrCodeUpdate, { loading: updateLoading }] = useMutation<
    QrCodeUpdate,
    QrCodeUpdateVariables
  >(QR_CODE_UPDATE)
  const [qrCode, setQrCode] = useState<QrCode | undefined>(undefined)
  const [shortLink, setShortLink] = useState<string | undefined>(undefined)
  const [to, setTo] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  const { loading: getLoading } = useQuery<
    GetJourneyQrCodes,
    GetJourneyQrCodesVariables
  >(GET_JOURNEY_QR_CODES, {
    variables: {
      where: {
        journeyId: journey?.id
      }
    },
    onCompleted: (data) => {
      setQrCode(data?.qrCodes[0])
      setTo(getTo(data?.qrCodes[0]))
      setShortLink(getShortLink(data?.qrCodes[0]))
    }
  })

  useEffect(() => {
    if (getLoading || createLoading || updateLoading) {
      setLoading(true)
    } else {
      setLoading(false)
    }
  }, [getLoading, createLoading, updateLoading])

  async function handleGenerateQrCode(): Promise<void> {
    if (journey?.id == null || journey?.team?.id == null) return
    await qrCodeCreate({
      variables: {
        input: {
          journeyId: journey?.id,
          teamId: journey?.team.id
        }
      },
      onCompleted: (data) => {
        setQrCode(data.qrCodeCreate)
        setTo(getTo(data.qrCodeCreate))
        setShortLink(getShortLink(data.qrCodeCreate))
      },
      onError: () => {
        enqueueSnackbar(t('Failed to create QR Code'), {
          variant: 'error',
          preventDuplicate: true
        })
      }
    })
  }

  async function handleUpdateTo(url: string): Promise<void> {
    if (qrCode == null) return
    await qrCodeUpdate({
      variables: {
        id: qrCode.id,
        input: {
          to: url
        }
      },
      onCompleted: (data) => {
        setTo(getTo(data.qrCodeUpdate))
      },
      onError: () => {
        enqueueSnackbar(t('Failed to update QR Code'), {
          variant: 'error',
          preventDuplicate: true
        })
        throw new Error('Failed to update QR Code')
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

  function getTo(qrCode?: QrCode): string | undefined {
    if (qrCode == null) return undefined
    const to = new URL(qrCode.shortLink.to)
    return `${to.origin}${to.pathname}`
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
        spacing={7}
        sx={{
          overflowX: 'hidden'
        }}
      >
        <Stack
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 4, sm: 7 },
            alignItems: 'center'
          }}
        >
          {shortLink != null ? (
            <Stack
              sx={{
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 1
              }}
            >
              <QRCodeCanvas
                id="qr-code-download"
                title="QR Code"
                size={122}
                level="L"
                value={shortLink}
              />
            </Stack>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleGenerateQrCode}
              disabled={loading}
              sx={{
                minHeight: 134,
                minWidth: 134,
                borderRadius: 2
              }}
            >
              {!loading ? t('Generate') : t('Generating...')}
            </Button>
          )}
          <Stack
            spacing={3}
            sx={{
              alignItems: { xs: 'center', sm: 'start' }
            }}
          >
            <ScanCount qrCodeId={qrCode?.id} />
            <DownloadQrCode shortLink={shortLink} loading={loading} />
            <Typography
              variant="body2"
              color="secondary.main"
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              {t(
                'Here is your unique QR code that will direct people to your journey when scanned.'
              )}
            </Typography>
          </Stack>
        </Stack>
        <Divider />
        <CodeDestination
          journeyId={journey?.id}
          qrCodeId={qrCode?.id}
          to={to}
          handleUpdateTo={handleUpdateTo}
        />
      </Stack>
    </Dialog>
  )
}
