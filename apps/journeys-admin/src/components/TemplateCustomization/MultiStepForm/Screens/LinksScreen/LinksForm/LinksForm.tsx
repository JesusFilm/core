import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { Form, useFormikContext } from 'formik'
import { ReactElement } from 'react'
import { useTranslation } from 'next-i18next'

import { JourneyLink } from '../../../../utils/getJourneyLinks/getJourneyLinks'

interface LinksFormProps {
  links: JourneyLink[]
}

export function LinksForm({ links }: LinksFormProps): ReactElement {
  const { t } = useTranslation()
  const { values, errors, touched, handleChange, handleBlur } =
    useFormikContext<Record<string, string>>()

  function handleOpenLink(
    value?: string,
    linkType?: 'url' | 'email' | 'chatButtons'
  ): void {
    if (value == null || value.trim() === '') return
    const trimmed = value.trim()
    if (linkType === 'email') {
      const mailto = trimmed.startsWith('mailto:')
        ? trimmed
        : `mailto:${trimmed}`
      window.open(mailto, '_blank', 'noopener,noreferrer')
      return
    }
    const hasProtocol = /^(https?:)?\/\//i.test(trimmed)
    const targetUrl = hasProtocol ? trimmed : `https://${trimmed}`
    window.open(targetUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <Form style={{ width: '100%' }}>
      <Stack sx={{ width: '100%', maxWidth: 700 }}>
        {links.map((link) => {
          const fieldName = link.id
          const hasError =
            Boolean(touched?.[fieldName]) && Boolean(errors?.[fieldName])
          return (
            <Stack key={fieldName} sx={{ width: '100%' }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="body1" color="text.primary">
                  {link.label}
                </Typography>
                <IconButton
                  aria-label={t('Open link in new tab')}
                  onClick={() =>
                    handleOpenLink(values?.[fieldName], link.linkType)
                  }
                  edge="end"
                  color="error"
                >
                  <OpenInNewIcon />
                </IconButton>
              </Stack>
              <TextField
                id={fieldName}
                name={fieldName}
                fullWidth
                type={link.linkType === 'email' ? 'email' : 'text'}
                value={values?.[fieldName] ?? ''}
                onChange={handleChange}
                onBlur={handleBlur}
                error={hasError}
                aria-label={`${t('Edit')} ${link.label}`}
                helperText={hasError ? (errors?.[fieldName] as string) : ' '}
              />
            </Stack>
          )
        })}
      </Stack>
    </Form>
  )
}
