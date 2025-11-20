import {
  ArrowDownToLine,
  Clock3,
  Download,
  Globe2,
  Loader2,
  XIcon
} from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import {
  ComponentProps,
  FormEvent,
  ReactElement,
  useEffect,
  useMemo,
  useState
} from 'react'
import useDownloader from 'react-use-downloader'

import { cn } from '@core/shared/uimodern/utils'
import { ExtendedButton as Button } from '@core/shared/uimodern/components'
import { Checkbox } from '@core/shared/uimodern/components/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@core/shared/uimodern/components/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@core/shared/uimodern/components/select'

import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import { VideoVariantDownloadQuality } from '../../../__generated__/globalTypes'
import { useVideo } from '../../libs/videoContext'

import { TermsOfUseDialog } from './TermsOfUseDialog'

interface DialogDownloadProps
  extends Pick<ComponentProps<typeof Dialog>, 'open' | 'onClose'> {}

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

const qualityEnumToOrder: Record<VideoVariantDownloadQuality, number> = {
  [VideoVariantDownloadQuality.highest]: 0,
  [VideoVariantDownloadQuality.high]: 1,
  [VideoVariantDownloadQuality.low]: 2
}

export function DialogDownload({
  open,
  onClose
}: DialogDownloadProps): ReactElement {
  const { title, images, imageAlt, variant } = useVideo()
  const { percentage, download, cancel, isInProgress } = useDownloader()
  const [openTerms, setOpenTerms] = useState<boolean>(false)
  const [hasAgreed, setHasAgreed] = useState(false)
  const [selectedFile, setSelectedFile] = useState('')
  const { t } = useTranslation('apps-watch')
  const downloads = variant?.downloads ?? []
  const language = variant?.language ?? {
    __typename: 'Language',
    id: '529',
    name: [{ __typename: 'LanguageName', value: 'English' }]
  }
  const time = secondsToTimeFormat(variant?.duration ?? 0)

  useEffect(() => {
    if (percentage === 100) {
      onClose?.()
    }
  }, [percentage, onClose])


  function getQualityLabel(quality: keyof typeof qualityEnumToOrder): string {
    switch (quality) {
      case VideoVariantDownloadQuality.highest:
        return t('Highest')
      case VideoVariantDownloadQuality.high:
        return t('High')
      case VideoVariantDownloadQuality.low:
        return t('Low')
    }
  }

  function getDownloadUrl(file: string): string {
    const url = new URL(file)
    url.searchParams.set('download', `${title[0].value}.mp4`)
    return url.toString()
  }

  type Download = (typeof downloads)[number] & {
    quality: keyof typeof qualityEnumToOrder
  }

  const filteredDownloads = useMemo(
    () =>
      (downloads.filter(({ quality }) =>
        Object.keys(qualityEnumToOrder).includes(quality)
      ) as Download[]).sort(
        (a, b) => qualityEnumToOrder[a.quality] - qualityEnumToOrder[b.quality]
      ),
    [downloads]
  )

  useEffect(() => {
    if (!open) return

    setSelectedFile(filteredDownloads[0]?.url ?? '')
    setHasAgreed(false)
  }, [filteredDownloads, open])

  const noDownloads = filteredDownloads.length === 0
  const isMuxLink = selectedFile?.startsWith('https://stream.mux.com/')
  const canDownload = selectedFile !== '' && hasAgreed && !isInProgress

  const handleClose = () => {
    cancel()
    onClose?.()
  }

  const handleDownload = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedFile || isMuxLink) return

    void download(selectedFile, `${title[0].value}.mp4`)
  }

  const displayTitle = title[title.length - 1]?.value ?? ''

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogPortal>
        <DialogOverlay className="blured-bg bg-stone-900/5" />
        <DialogContent
          data-testid="DialogDownload"
          className="bg-background text-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 w-full max-w-xl translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-2xl border border-white/10 p-0 shadow-2xl"
        >
          <DialogDescription className="sr-only">
            {t('Select a file size')}
          </DialogDescription>
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <DialogTitle className="text-xl font-semibold">
              {t('Download Video')}
            </DialogTitle>
            <DialogClose
              data-testid="dialog-close-button"
              className="inline-flex size-9 items-center justify-center rounded-full bg-white/5 text-white transition hover:bg-white/10"
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">{t('close')}</span>
            </DialogClose>
          </div>

          <div className="space-y-6 px-6 pb-6 pt-4 sm:px-8 sm:pb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {images[0]?.mobileCinematicHigh != null && (
                <div className="relative hidden overflow-hidden rounded-xl sm:block">
                  <Image
                    src={images[0].mobileCinematicHigh}
                    alt={imageAlt[0].value}
                    width={260}
                    height={146}
                    className="h-auto w-full max-w-[260px] object-cover"
                    priority
                  />
                  <div className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold uppercase text-white">
                    <Clock3 className="h-4 w-4" />
                    {time}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-semibold tracking-wider text-red-100/70 uppercase">
                  {t('Download Video')}
                </p>
                <p className="text-lg font-bold leading-tight sm:text-xl">
                  {displayTitle}
                </p>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-sm text-stone-200">
                  <Globe2 className="h-4 w-4" />
                  <span className="font-medium">{language.name[0].value}</span>
                </div>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleDownload}>
              <div className="space-y-2">
                <label
                  className="block text-xs font-semibold tracking-wider text-stone-400 uppercase"
                  htmlFor="download-quality"
                >
                  {t('Select a file size')}
                </label>
                <Select
                  value={selectedFile}
                  onValueChange={(value) => setSelectedFile(value)}
                  disabled={noDownloads}
                >
                  <SelectTrigger
                    id="download-quality"
                    className="h-12 rounded-lg border-white/10 bg-white/5 text-base text-white placeholder:text-stone-400"
                    aria-label={t('Select a file size')}
                  >
                    <SelectValue placeholder={t('No Downloads Available')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-white/10 bg-stone-900 text-white">
                    {filteredDownloads.map((downloadItem) => (
                      <SelectItem
                        key={downloadItem.quality}
                        value={downloadItem.url}
                        className="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold hover:bg-white/10 focus:bg-white/10"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-white">
                            {getQualityLabel(downloadItem.quality)}
                          </span>
                          <span className="text-sm text-stone-300">
                            {formatBytes(downloadItem.size)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {noDownloads && (
                  <p className="text-sm font-semibold text-red-400">
                    {t('No Downloads Available')}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 text-sm text-stone-100">
                  <Checkbox
                    id="download-terms"
                    checked={hasAgreed}
                    onCheckedChange={(checked) => setHasAgreed(Boolean(checked))}
                    disabled={isInProgress}
                    className="border-white/50 data-[state=checked]:bg-white"
                    aria-label={t('I agree to the')}
                  />
                  <label
                    htmlFor="download-terms"
                    className="flex flex-wrap items-center gap-2 text-sm font-medium text-white"
                  >
                    <span>{t('I agree to the')}</span>
                    <button
                      type="button"
                      onClick={() => setOpenTerms(true)}
                      className="text-primary-foreground underline-offset-4 transition hover:text-[#cb333b] hover:underline"
                    >
                      {t('Terms of Use')}
                    </button>
                  </label>
                </div>

                {isMuxLink ? (
                  <a
                    href={getDownloadUrl(selectedFile)}
                    onClick={(event) => {
                      if (!canDownload) {
                        event.preventDefault()
                        return
                      }

                      handleClose()
                    }}
                    className={cn(
                      'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold uppercase tracking-wider transition',
                      canDownload
                        ? 'bg-white text-gray-900 hover:bg-[#cb333b] hover:text-white'
                        : 'cursor-not-allowed bg-white/10 text-white/50'
                    )}
                    aria-disabled={!canDownload}
                  >
                    <Download className="h-4 w-4" />
                    {t('Download')}
                  </a>
                ) : (
                  <Button
                    type="submit"
                    disabled={!canDownload}
                    className={cn(
                      'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold uppercase tracking-wider transition',
                      'bg-white text-gray-900 hover:bg-[#cb333b] hover:text-white disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/50'
                    )}
                  >
                    {isInProgress ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('Download')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <ArrowDownToLine className="h-4 w-4" />
                        {t('Download')}
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </div>

          <TermsOfUseDialog
            open={openTerms}
            onClose={() => {
              setHasAgreed(false)
              setOpenTerms(false)
            }}
            onSubmit={() => {
              setHasAgreed(true)
              setOpenTerms(false)
            }}
          />
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
