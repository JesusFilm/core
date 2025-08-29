import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { ThemeProvider } from '@mui/material/styles'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, memo, useEffect } from 'react'
import useSWR from 'swr'

import { websiteLight } from '@core/shared/ui/themes/website/theme'

import { useWatch } from '../../libs/watchContext'

import { AudioTrackSelect } from './AudioTrackSelect'
import { SubtitlesSelect } from './SubtitlesSelect'
import { getLanguageIdFromLocale } from '../../libs/getLanguageIdFromLocale'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface LanguageSwitchDialogProps {
  open: boolean
  handleClose: () => void
}

export const LanguageSwitchDialog = memo(function LanguageSwitchDialog({
  open,
  handleClose
}: LanguageSwitchDialogProps): ReactElement {
  const { i18n } = useTranslation()
  const { data } = useSWR<string[]>('/api/languages', fetcher)
  const router = useRouter()
  const { dispatch } = useWatch()
  useEffect(() => {
    if (!data || !i18n.language) return

    const currentLanguageId = getLanguageIdFromLocale(i18n.language)
    dispatch({
      type: 'SetAllLanguages',
      allLanguages: data.map((language) => {
        const [languageIdSlugNative, ...names] = language
        const [id, slug, native] = languageIdSlugNative.split(':')
        const name: {
          id: string
          primary: boolean
          value: string
        }[] = names.map((returnedName) => {
          const [id, nameValue] = returnedName.split(':')
          return {
            id,
            primary: false,
            value: nameValue
          }
        })
        const currentName =
          currentLanguageId != '529'
            ? name.find((name) => name.id === currentLanguageId)
            : undefined
        const englishName =
          id != '529'
            ? name.find((name) => name.id == '529')
            : {
                id,
                primary: true,
                value: native
              }
        const nativeName =
          id != '529' && native
            ? {
                id,
                primary: true,
                value: native
              }
            : undefined

        return {
          id,
          slug,
          name: [nativeName, currentName, englishName].filter(
            (name) => name != null
          )
        }
      })
    })
  }, [data, i18n])

  // Set router in context when component mounts
  useEffect(() => {
    dispatch({
      type: 'SetRouter',
      router
    })
  }, [router, dispatch])

  return (
    <ThemeProvider theme={websiteLight}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        aria-label="Language Settings"
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton
            onClick={handleClose}
            size="small"
            aria-label="Close dialog"
            sx={{ m: 2 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ pt: 0, pb: 6, px: 0 }}>
          <Stack gap={8}>
            <AudioTrackSelect />
            <SubtitlesSelect />
          </Stack>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  )
})
