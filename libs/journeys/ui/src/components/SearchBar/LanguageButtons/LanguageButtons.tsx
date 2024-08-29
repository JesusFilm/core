import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, ReactNode } from 'react'

import ChevronDown from '@core/shared/ui/icons/ChevronDown'
import Globe1Icon from '@core/shared/ui/icons/Globe1'

const StyledButton = styled(Button)(({ theme }) => ({
  width: 168,
  borderRadius: 32,
  gap: 0,
  padding: '8px 20px 8px 20px',
  border: `2px solid ${theme.palette.text.primary}${
    theme.palette.mode === 'dark' ? 'D4' : '1A'
  }`,
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.default,
  '&:hover': {
    backgroundColor: theme.palette.background.default,
    opacity: 0.9
  },
  [theme.breakpoints.down('lg')]: {
    padding: 4
  }
}))

interface LanguageButtonsProps {
  onClick: () => void
  selectedLanguages?: string[]
}

export function LanguageButtons({
  onClick,
  selectedLanguages = []
}: LanguageButtonsProps): ReactElement {
  const theme = useTheme()
  const { t } = useTranslation('apps-watch')

  const displayedLanguages = selectedLanguages.slice(0, 2)

  function Button({
    content,
    index
  }: {
    content: string
    index?: number
  }): ReactNode {
    return (
      <StyledButton
        key={index}
        size="small"
        onClick={onClick}
        startIcon={<Globe1Icon />}
        endIcon={<ChevronDown />}
      >
        {content}
      </StyledButton>
    )
  }

  return (
    <Box
      data-testid="LanguageSelect"
      sx={{
        gap: 2,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        border: 'none',
        backgroundColor: 'background.default',
        color: 'text.secondary',
        [theme.breakpoints.down('lg')]: {
          padding: 2,
          justifyContent: 'flex-end',
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8
        }
      }}
    >
      <Divider
        orientation="vertical"
        flexItem
        sx={{
          height: 35,
          alignSelf: 'center',
          marginRight: 6,
          [theme.breakpoints.down('lg')]: { display: 'none' }
        }}
        variant="middle"
      />
      {selectedLanguages?.length > 0 ? (
        <>
          {displayedLanguages.map((selectedLanguage: string, index: number) => (
            <Button key={index} content={selectedLanguage.split(', ')[0]} />
          ))}
          {selectedLanguages.length > 2 && (
            <Typography
              variant="h6"
              sx={{ color: 'text.primary', textAlign: 'center' }}
            >
              +{selectedLanguages.length - 2}
            </Typography>
          )}
        </>
      ) : (
        <Button content={t('Language')} />
      )}
    </Box>
  )
}
