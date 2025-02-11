import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import { useLocalStorage } from '@core/journeys/ui/useLocalStorage'
import Bell2 from '@core/shared/ui/icons/Bell2'
import X2 from '@core/shared/ui/icons/X2'

export function FeedbackBanner(): ReactElement {
  const { t } = useTranslation()

  const [show, setShow] = useState<boolean>(false)
  const [viewed, setViewed] = useLocalStorage('watch-feedback', false)

  useEffect(() => {
    if (!viewed) {
      const timer = setTimeout(() => setShow(true), 2000)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [viewed])

  const handleClose = (): void => {
    setShow(false)
    setViewed(true)
  }

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          zIndex: 10,
          display: { xs: 'none', md: 'block' }
        }}
      >
        <Collapse in={show}>
          <Box
            data-testid="FeedbackBanner"
            sx={{
              height: 132,
              width: '100vw',
              backgroundColor: '#262323',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center'
            }}
          >
            <Stack direction="row" gap={8}>
              <Box
                sx={{
                  height: 56,
                  width: 56,
                  display: 'grid',
                  placeItems: 'center',
                  border: ({ palette }) =>
                    `1px solid ${palette.secondary.dark}`,
                  borderRadius: 2
                }}
              >
                <Bell2 color="primary" />
              </Box>
              <Stack>
                <Typography
                  variant="subtitle1"
                  fontWeight={400}
                  color="text.primary"
                >
                  {t('We’re creating a new video library design.')}
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color="text.primary"
                >
                  {t('Want to follow our progress and share your feedback?')}
                </Typography>
              </Stack>
            </Stack>
            <Stack direction="row" gap={8}>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSftdElruXGJPRMb2o3UulrpR3b_CD8t60FtuAqDxGngjWuMpg/viewform"
                target="_blank"
              >
                <Button variant="contained" sx={{ height: 56, width: 160 }}>
                  {t('Reply')}
                </Button>
              </a>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleClose}
                sx={{ height: 56, minWidth: 56, p: 3 }}
              >
                <X2 />
              </Button>
            </Stack>
          </Box>
        </Collapse>
      </Box>

      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          zIndex: 10,
          display: { xs: 'block', md: 'none' }
        }}
      >
        <Collapse in={show}>
          <Box
            data-testid="FeedbackBanner"
            sx={{
              height: 132,
              width: '100vw',
              backgroundColor: '#262323',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              alignItems: 'center'
            }}
          >
            <Stack direction="row" gap={8}>
              <Box
                sx={{
                  height: 36,
                  width: 36,
                  display: 'grid',
                  placeItems: 'center',
                  border: ({ palette }) =>
                    `1px solid ${palette.secondary.dark}`,
                  borderRadius: 2
                }}
              >
                <Bell2 color="primary" fontSize="small" />
              </Box>
              {/* <Stack>
                <Typography variant="body1" fontWeight={400} color="white">
                  {t('We’re creating a new video library design.')}
                </Typography>
                <Typography variant="body2" fontWeight={700} color="white">
                  {t('Want to follow our progress and share your feedback?')}
                </Typography>
              </Stack> */}
            </Stack>
            <Stack direction="row" gap={8}>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSftdElruXGJPRMb2o3UulrpR3b_CD8t60FtuAqDxGngjWuMpg/viewform"
                target="_blank"
              >
                <Button
                  variant="contained"
                  size="small"
                  sx={{ height: 40, width: 120 }}
                >
                  {t('Reply')}
                </Button>
              </a>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleClose}
                sx={{ height: 56, minWidth: 56, p: 3 }}
              >
                <X2 />
              </Button>
            </Stack>
          </Box>
        </Collapse>
      </Box>
    </>
  )
}
