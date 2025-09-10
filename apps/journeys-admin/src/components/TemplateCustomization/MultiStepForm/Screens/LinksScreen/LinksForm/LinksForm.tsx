import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, useFormikContext } from 'formik'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import LinkExternal from '@core/shared/ui/icons/LinkExternal'

import { JourneyLink } from '../../../../utils/getJourneyLinks/getJourneyLinks'

interface LinksFormProps {
  links: JourneyLink[]
}

export function LinksForm({ links }: LinksFormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { values, errors, touched, handleBlur, setFieldValue, handleChange } =
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

  function handleLinkChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target
    const url = /^\w+:\/\//.test(value) ? value : `https://${value}`
    setFieldValue(name, url)
  }

  return (
    <Form id="linksForm" style={{ width: '100%' }}>
      <Stack sx={{ width: '100%' }}>
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
                <Typography variant="h6" color="text.primary">
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
                  <LinkExternal />
                </IconButton>
              </Stack>
              <TextField
                id={fieldName}
                name={fieldName}
                fullWidth
                type={link.linkType === 'email' ? 'email' : 'text'}
                value={values?.[fieldName] ?? ''}
                onChange={
                  link.linkType === 'email' || link.linkType === 'chatButtons'
                    ? handleChange
                    : handleLinkChange
                }
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
