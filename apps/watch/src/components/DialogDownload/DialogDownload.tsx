import last from 'lodash/last'
import { Download as DownloadIcon, Globe2, Play, X } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useMemo, useState } from 'react'
import useDownloader from 'react-use-downloader'

import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'
import { Button } from '@core/shared/ui-modern/components/button'
import { Checkbox } from '@core/shared/ui-modern/components/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@core/shared/ui-modern/components/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@core/shared/ui-modern/components/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@core/shared/ui-modern/components/tooltip'

import { VideoVariantDownloadQuality } from '../../../__generated__/globalTypes'
import { useVideo } from '../../libs/videoContext'

import { TermsOfUseDialog } from './TermsOfUseDialog'

interface DialogDownloadProps {
  open?: boolean
  onClose?: () => void
  testId?: string
}

function formatBytes(bytes: number, decimals = 2): string {
  if ((bytes ?? 0) <= 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${
    sizes[i]
  }`
}

const qualityEnumToOrder = {
  [VideoVariantDownloadQuality.highest]: 0,
  [VideoVariantDownloadQuality.high]: 1,
  [VideoVariantDownloadQuality.low]: 2
}

export function DialogDownload({
  open = false,
  onClose,
  testId = 'DialogDownload'
}: DialogDownloadProps): ReactElement {
  const { title, images, imageAlt, variant } = useVideo()
  const { percentage, download, cancel, isInProgress } = useDownloader()
  const [openTerms, setOpenTerms] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const { t } = useTranslation('apps-watch')

  const downloads = variant?.downloads ?? []
  const language = variant?.language ?? {
    __typename: 'Language',
    id: '529',
    name: [{ __typename: 'LanguageName', value: 'English' }]
  }
  const time = secondsToTimeFormat(variant?.duration ?? 0)

  const filteredDownloads = useMemo(
    () =>
      downloads.filter(({ quality }) =>
        Object.keys(qualityEnumToOrder).includes(quality)
      ) as (typeof downloads)[number] &
        {
          quality: keyof typeof qualityEnumToOrder
        }[],
    [downloads]
  )

  const sortedDownloads = useMemo(
    () =>
      [...filteredDownloads].sort(
        (a, b) => qualityEnumToOrder[a.quality] - qualityEnumToOrder[b.quality]
      ),
    [filteredDownloads]
  )

  useEffect(() => {
    if (open) {
      const firstDownloadUrl = sortedDownloads[0]?.url ?? ''
      setSelectedFile(firstDownloadUrl)
      setAgreedToTerms(false)
    }
  }, [open, sortedDownloads])

  useEffect(() => {
    if (percentage === 100) {
      onClose?.()
    }
  }, [percentage, onClose])

  const getQualityLabel = (
    quality: keyof typeof qualityEnumToOrder
  ): string => {
    switch (quality) {
      case VideoVariantDownloadQuality.highest:
        return t('Highest')
      case VideoVariantDownloadQuality.high:
        return t('High')
      case VideoVariantDownloadQuality.low:
        return t('Low')
    }
  }

  const titleText = last(title)?.value ?? ''
  const fileName = `${titleText || 'video'}.mp4`
  const imageSrc = images[0]?.mobileCinematicHigh
  const imageAltText = imageAlt?.[0]?.value ?? titleText ?? t('Download Video')
  const duration = time.startsWith('00:') ? time.slice(3) : time

  const getDownloadUrl = (file: string): string => {
    const url = new URL(file)
    url.searchParams.set('download', fileName)
    return url.toString()
  }

  const handleClose = (): void => {
    cancel()
    setAgreedToTerms(false)
    setOpenTerms(false)
    onClose?.()
  }

  const handleDownload = (): void => {
    if (!selectedFile || !agreedToTerms) return

    const isMuxStream = selectedFile.startsWith('https://stream.mux.com/')

    if (isMuxStream) {
      window.location.assign(getDownloadUrl(selectedFile))
      handleClose()
      return
    }

    void download(selectedFile, fileName)
  }

  const canDownload = agreedToTerms && selectedFile !== ''
  const isMuxStream = selectedFile.startsWith('https://stream.mux.com/')

  const getDisabledTooltipMessage = (): string => {
    if (!agreedToTerms && selectedFile === '') {
      return t('Please agree to the Terms of Use and select a file size')
    }
    if (!agreedToTerms) {
      return t('Please agree to the Terms of Use')
    }
    if (selectedFile === '') {
      return t('Please select a file size')
    }
    return ''
  }

  const renderDownloadControl = (): ReactElement => {
    if (isMuxStream && canDownload) {
      return (
        <Button
          asChild
          className="inline-flex max-h-10 cursor-pointer items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-bold uppercase tracking-wider text-gray-900 transition-colors duration-200 hover:bg-[#cb333b] hover:text-white"
        >
          <a
            href={getDownloadUrl(selectedFile)}
            download={fileName}
            onClick={handleClose}
          >
            <DownloadIcon className="h-4 w-4" />
            {t('Download')}
          </a>
        </Button>
      )
    }

    const button = (
      <Button
        type="button"
        onClick={handleDownload}
        disabled={!canDownload}
        className="inline-flex max-h-10 cursor-pointer items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-bold uppercase tracking-wider text-gray-900 transition-colors duration-200 hover:bg-[#cb333b] hover:text-white disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/60"
      >
        {isInProgress ? (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        ) : (
          <DownloadIcon className="h-4 w-4" />
        )}
        {t('Download')}
      </Button>
    )

    if (!canDownload) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex cursor-not-allowed [&>button]:pointer-events-none">
              {button}
            </div>
          </TooltipTrigger>
          <TooltipContent
            className="z-[200] border-white/20 bg-stone-800 text-white"
            side="top"
          >
            {getDisabledTooltipMessage()}
          </TooltipContent>
        </Tooltip>
      )
    }

    return button
  }

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogPortal>
          <DialogOverlay className="blured-bg z-[100] bg-stone-900/40" />
          <DialogContent
            showCloseButton={false}
            data-testid={testId}
            className="fixed left-1/2 top-1/2 z-[101] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden border border-white/10 bg-gradient-to-b from-[#0f1117] to-[#0b0c10] text-white shadow-2xl outline-none [&>button]:focus-visible:outline-none"
          >
            <DialogClose
              data-testid="dialog-close-button"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">{t('Close')}</span>
            </DialogClose>
            <DialogTitle className="sr-only">{t('Download Video')}</DialogTitle>
            <DialogDescription className="sr-only">
              {t('Select a file size')}
            </DialogDescription>
            <div className="flex flex-col gap-6 p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                {imageSrc != null && (
                  <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 sm:w-72">
                    <Image
                      src={imageSrc}
                      alt={imageAltText}
                      width={320}
                      height={180}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold">
                      <Play className="h-3 w-3" />
                      <span>{duration}</span>
                    </div>
                  </div>
                )}
                <div className="flex-1 space-y-3 text-left">
                  <p className="text-sm font-semibold uppercase tracking-widest text-red-100/70">
                    {t('Download Video')}
                  </p>
                  <h3 className="text-2xl font-bold leading-tight sm:text-3xl">
                    {titleText}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-stone-200/80">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                      <Globe2 className="h-4 w-4" />
                      <span className="font-semibold text-white">
                        {language.name[0].value}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-stone-200">
                      {t('Select a file size')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold tracking-wide text-stone-200">
                  {t('Select a file size')}
                </label>
                <Select
                  value={selectedFile}
                  onValueChange={setSelectedFile}
                  disabled={sortedDownloads.length === 0 || isInProgress}
                >
                  <SelectTrigger
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/5 text-base font-semibold text-white shadow-inner backdrop-blur-md disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={t('Select a file size')}
                  >
                    <SelectValue
                      placeholder={
                        sortedDownloads.length === 0
                          ? t('No Downloads Available')
                          : t('Select a file size')
                      }
                    />
                  </SelectTrigger>
                  <SelectContent
                    className="!z-[102] border-white/10 bg-[#0f1117] text-white shadow-2xl"
                    position="popper"
                  >
                    {sortedDownloads.map((downloadOption) => (
                      <SelectItem
                        key={downloadOption.quality}
                        value={downloadOption.url}
                        className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
                      >
                        <span>{getQualityLabel(downloadOption.quality)}</span>
                        <span className="text-white/70">
                          ({formatBytes(downloadOption.size)})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {sortedDownloads.length === 0 && (
                  <p className="text-sm font-semibold text-[#f87171]">
                    {t('No Downloads Available')}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 text-sm text-stone-200">
                  <Checkbox
                    id="terms"
                    aria-label={t('I agree to the')}
                    checked={agreedToTerms}
                    disabled={sortedDownloads.length === 0}
                    onCheckedChange={(checked) =>
                      setAgreedToTerms(checked === true)
                    }
                    className="mt-1 border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-gray-900"
                  />
                  <div>
                    <div className="text-sm text-stone-200">
                      {t('I agree to the')}{' '}
                      <button
                        type="button"
                        onClick={() => setOpenTerms(true)}
                        className="font-semibold text-[#cb333b] underline underline-offset-4 hover:text-white"
                      >
                        {t('Terms of Use')}
                      </button>
                    </div>
                  </div>
                </div>
                {renderDownloadControl()}
              </div>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      <TermsOfUseDialog
        open={openTerms}
        onClose={() => {
          setAgreedToTerms(false)
          setOpenTerms(false)
        }}
        onSubmit={() => {
          setAgreedToTerms(true)
          setOpenTerms(false)
        }}
      />
    </TooltipProvider>
  )
}
