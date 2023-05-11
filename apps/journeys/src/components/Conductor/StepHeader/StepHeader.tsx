import { ReactElement, useState, MouseEvent } from 'react'
import Menu from '@mui/material/Menu'
import MuiMenuItem from '@mui/material/MenuItem'
import { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName, ThemeMode } from '@core/shared/ui/themes'
import NextLink from 'next/link'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { useTranslation } from 'react-i18next'
import Link from '@mui/material/Link'

interface StepHeaderProps {
  block: TreeBlock
}

export default function StepHeader({ block }: StepHeaderProps): ReactElement {
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = (): void => {
    setAnchorEl(null)
  }

  const card =
    block.children.length > 0 && block.children[0].__typename === 'CardBlock'
      ? block.children[0]
      : undefined

  const cardTheme = {
    themeName: card?.themeName ?? journey?.themeName ?? ThemeName.base,
    themeMode: card?.themeMode ?? journey?.themeMode ?? ThemeMode.dark
  }

  return (
    <ThemeProvider {...cardTheme}>
      <Stack
        sx={{
          width: { xs: '100%', lg: 'unset' },
          px: { lg: 6 },
          mt: { xs: 1, lg: 0 },
          position: { xs: 'absolute', lg: 'relative' },
          zIndex: 1,
          top: 0,
          alignItems: 'flex-end'
        }}
      >
        <IconButton
          id="more-info"
          aria-controls="more-info"
          aria-haspopup="true"
          aria-expanded={open ? 'true' : 'false'}
          sx={{ mr: 4 }}
          onClick={handleClick}
        >
          <InfoOutlinedIcon sx={{ color: 'white' }} />
        </IconButton>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            dense: true,
            'aria-labelledby': 'more-info'
          }}
        >
          <NextLink
            href={`mailto:support@nextstep.is?subject=Report%20Journey:%20${
              journey?.title ?? journey?.seoTitle ?? ''
            }&body=I want to report journey (your.nextstep.is/journey/${
              journey?.slug ?? ''
            }) because ...`}
            passHref
          >
            <MuiMenuItem onClick={handleClose}>
              <Typography color="text.primary" variant="body2">
                Report this content
              </Typography>
            </MuiMenuItem>
          </NextLink>
          <Divider />
          <NextLink
            href="https://www.cru.org/us/en/about/terms-of-use.html"
            passHref
          >
            <Link
              variant="body2"
              underline="none"
              target="_blank"
              rel="noopener"
              sx={{ px: 0 }}
              onClick={handleClose}
            >
              <MuiMenuItem>{t('Terms & Conditions')}</MuiMenuItem>
            </Link>
          </NextLink>
          <NextLink
            href="https://www.cru.org/us/en/about/privacy.html"
            passHref
          >
            <Link
              variant="body2"
              underline="none"
              target="_blank"
              rel="noopener"
              sx={{ px: 0 }}
              onClick={handleClose}
            >
              <MuiMenuItem>{t('Privacy Policy')}</MuiMenuItem>
            </Link>
          </NextLink>
          <MuiMenuItem disabled>
            <Typography variant="caption">
              {t('NextSteps © {{year}}', { year: new Date().getFullYear() })}
            </Typography>
          </MuiMenuItem>
        </Menu>
      </Stack>
    </ThemeProvider>
  )
}
