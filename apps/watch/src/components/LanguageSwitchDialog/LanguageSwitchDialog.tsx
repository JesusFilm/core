import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { ThemeProvider } from '@mui/material/styles'
import { useRouter } from 'next/router'
import { ReactElement, memo, useEffect } from 'react'
import useSWR from 'swr'

import { websiteLight } from '@core/shared/ui/themes/website/theme'

import { useWatch } from '../../libs/watchContext'

import { AudioTrackSelect } from './AudioTrackSelect'
import { SubtitlesSelect } from './SubtitlesSelect'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface LanguageSwitchDialogProps {
  open: boolean
  handleClose: () => void
}

export const LanguageSwitchDialog = memo(function LanguageSwitchDialog({
  open,
  handleClose
}: LanguageSwitchDialogProps): ReactElement {
  const { data } = useSWR<string[]>(
    () => (open ? '/api/languages' : null),
    fetcher
  )
  const router = useRouter()
  const { dispatch } = useWatch()

  useEffect(() => {
    if (data) {
      dispatch({
        type: 'SetAllLanguages',
        allLanguages: data.map((language) => {
          const [languageIdSlugNativeName, ...names] = language
          const [id, slug, nativeName] = languageIdSlugNativeName.split(':')
          const name: {
            primary: boolean
            value: string
          }[] = []
          if (nativeName != undefined) {
            name.push({
              primary: true,
              value: nativeName
            })
          }
          names.forEach((returnedName) => {
            const [, nameValue] = returnedName.split(':')
            name.push({
              primary: false,
              value: nameValue
            })
          })
          return {
            id,
            slug,
            name
          }
        })
      })
    }
  }, [data])

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
