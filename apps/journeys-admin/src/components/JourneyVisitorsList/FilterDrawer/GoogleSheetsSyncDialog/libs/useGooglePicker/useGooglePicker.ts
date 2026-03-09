import { useLazyQuery } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { useState } from 'react'

import { GET_GOOGLE_PICKER_TOKEN } from '../../graphql'

const PICKER_Z_INDEX = '99999'
const PICKER_RETRY_ATTEMPTS = 100
const PICKER_RETRY_DELAY_MS = 100

export interface UseGooglePickerParams {
  teamId: string | undefined
}

export interface UseGooglePickerReturn {
  pickerActive: boolean
  handleOpenDrivePicker: (
    mode: 'folder' | 'sheet',
    integrationId: string | undefined,
    setFieldValue: (field: string, value: unknown) => void
  ) => Promise<void>
}

export function useGooglePicker({
  teamId
}: UseGooglePickerParams): UseGooglePickerReturn {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const [getPickerToken] = useLazyQuery(GET_GOOGLE_PICKER_TOKEN)
  const [pickerActive, setPickerActive] = useState(false)

  async function ensurePickerLoaded(): Promise<void> {
    const win = window as any
    if (win.google?.picker != null) return
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.async = true
      script.onload = () => {
        const gapi = (window as any).gapi
        if (gapi?.load != null) {
          gapi.load('picker', { callback: resolve })
        } else {
          resolve()
        }
      }
      script.onerror = () => reject(new Error('Failed to load Google API'))
      document.body.appendChild(script)
    })
  }

  function elevatePickerZIndex(): void {
    const pickerElements = document.querySelectorAll<HTMLElement>(
      '.picker-dialog, .picker-dialog-bg, .picker.modal-dialog, [class*="picker"]'
    )
    if (pickerElements.length === 0) return
    pickerElements.forEach((element) => {
      element.style.zIndex = PICKER_Z_INDEX
    })
  }

  function elevatePickerZIndexWithRetries(
    attempts = PICKER_RETRY_ATTEMPTS,
    delayMs = PICKER_RETRY_DELAY_MS
  ): void {
    elevatePickerZIndex()
    if (attempts <= 1) return
    setTimeout(
      () => elevatePickerZIndexWithRetries(attempts - 1, delayMs),
      delayMs
    )
  }

  async function handleOpenDrivePicker(
    mode: 'folder' | 'sheet',
    integrationId: string | undefined,
    setFieldValue: (field: string, value: unknown) => void
  ): Promise<void> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
      if (apiKey == null || apiKey === '') {
        enqueueSnackbar(t('Missing Google API key'), { variant: 'error' })
        return
      }
      if (integrationId == null || integrationId === '') {
        enqueueSnackbar(t('Select an integration account first'), {
          variant: 'error'
        })
        return
      }

      let oauthToken: string | undefined | null
      if (teamId != null) {
        const { data: tokenData } = await getPickerToken({
          variables: { teamId, integrationId }
        })
        oauthToken = tokenData?.integrationGooglePickerToken
      }
      if (oauthToken == null || oauthToken === '') {
        enqueueSnackbar(t('Unable to authorize Google Picker'), {
          variant: 'error'
        })
        return
      }

      await ensurePickerLoaded()

      setPickerActive(true)

      const googleAny: any = (window as any).google
      const view =
        mode === 'sheet'
          ? new googleAny.picker.DocsView(googleAny.picker.ViewId.SPREADSHEETS)
          : new googleAny.picker.DocsView(
              googleAny.picker.ViewId.FOLDERS
            ).setSelectFolderEnabled(true)

      const picker = new googleAny.picker.PickerBuilder()
        .setOAuthToken(oauthToken)
        .setDeveloperKey(apiKey)
        .addView(view)
        .setCallback((pickerData: any) => {
          if (pickerData?.action === googleAny.picker.Action.PICKED) {
            const doc = pickerData.docs?.[0]
            if (doc != null) {
              const docName = doc?.name ?? doc?.title ?? doc?.id ?? null
              if (mode === 'sheet') {
                setFieldValue('existingSpreadsheetId', doc.id)
                setFieldValue('existingSpreadsheetName', docName ?? undefined)
              } else {
                setFieldValue('folderId', doc.id)
                setFieldValue('folderName', docName ?? undefined)
              }
            }
          }

          if (
            pickerData?.action === googleAny.picker.Action.PICKED ||
            pickerData?.action === googleAny.picker.Action.CANCEL
          ) {
            setPickerActive(false)
          }
        })
        .build()

      picker.setVisible(true)
      elevatePickerZIndexWithRetries()
    } catch {
      enqueueSnackbar(t('Failed to open Google Picker'), { variant: 'error' })
      setPickerActive(false)
    }
  }

  return { pickerActive, handleOpenDrivePicker }
}
