import { gql, useLazyQuery } from '@apollo/client'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { ThemeProvider } from '@mui/material/styles'
import { useRouter } from 'next/router'
import { ReactElement, memo, useEffect } from 'react'

import { websiteLight } from '@core/shared/ui/themes/website/theme'

import { GetAllLanguages } from '../../../__generated__/GetAllLanguages'
import { useWatch } from '../../libs/watchContext'

import { AudioTrackSelect } from './AudioTrackSelect'
import { SubtitlesSelect } from './SubtitlesSelect'

export const GET_ALL_LANGUAGES = gql`
  query GetAllLanguages {
    languages {
      id
      bcp47
      slug
      name {
        primary
        value
      }
    }
  }
`

interface LanguageSwitchDialogProps {
  open: boolean
  handleClose: () => void
}

export const LanguageSwitchDialog = memo(function LanguageSwitchDialog({
  open,
  handleClose
}: LanguageSwitchDialogProps): ReactElement {
  const router = useRouter()
  const {
    state: { allLanguages },
    dispatch
  } = useWatch()

  const [getAllLanguages, { loading: languagesLoading }] =
    useLazyQuery<GetAllLanguages>(GET_ALL_LANGUAGES, {
      onCompleted: (data) => {
        if (data?.languages && !allLanguages) {
          dispatch({
            type: 'SetAllLanguages',
            allLanguages: data.languages
          })
        }
      }
    })

  // Fetch languages when dialog opens if needed
  useEffect(() => {
    if (open && !allLanguages && !languagesLoading) {
      void getAllLanguages()
    }
  }, [open, allLanguages, languagesLoading, getAllLanguages])

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
