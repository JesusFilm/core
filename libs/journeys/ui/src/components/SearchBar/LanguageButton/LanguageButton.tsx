import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
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
  }
}))

interface LanguageButtonProps {
  onClick: () => void
  selectedLanguages?: string[]
}

export function LanguageButton({
  onClick,
  selectedLanguages = []
}: LanguageButtonProps): ReactElement {
  const { t } = useTranslation('apps-watch')

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
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        border: 'none',
        backgroundColor: 'background.default',
        color: 'text.secondary'
      }}
    >
      <Divider
        orientation="vertical"
        flexItem
        sx={{
          height: 35,
          alignSelf: 'center',
          marginRight: 6
        }}
        variant="middle"
      />
      {selectedLanguages?.length > 0 ? (
        <>
          {selectedLanguages.map((selectedLanguage: string, index: number) => (
            <Button key={index} content={selectedLanguage.split(', ')[0]} />
          ))}
        </>
      ) : (
        <Button content={t('Language')} />
      )}
    </Box>
  )
}
