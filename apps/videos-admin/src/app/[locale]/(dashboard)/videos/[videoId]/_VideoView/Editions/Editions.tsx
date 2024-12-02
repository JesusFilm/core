import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'
import { ReactElement, useState } from 'react'

import { GetAdminVideo_AdminVideo_VideoEditions as VideoEditions } from '../../../../../../../libs/useAdminVideo'
import { Section } from '../Section'

interface EditionsProps {
  editions?: VideoEditions
}

export function Editions({ editions }: EditionsProps): ReactElement {
  const t = useTranslations()
  const [selectedEdition, setSelectedEdition] = useState<string | null>(
    editions?.[0]?.name ?? null
  )

  function handleChange(value: string): void {
    setSelectedEdition(value)
  }
  return (
    <>
      {editions == null ? (
        <Typography>{t('No editions to show')}</Typography>
      ) : (
        <Section title={t('Editions')}>
          <Stack sx={{ gap: 2 }}>
            <FormControl variant="standard">
              <InputLabel>{t('Edition')}</InputLabel>
              <Select
                id="name"
                name="name"
                label={t('Edition')}
                value={selectedEdition ?? editions?.[0]?.name}
                onChange={(e) => handleChange(e.target.value)}
              >
                {editions?.map((edition) => {
                  return (
                    <MenuItem value={edition.name}>{edition.name}</MenuItem>
                  )
                })}
              </Select>
            </FormControl>
            <Divider />
            <InputLabel>{t('Subtitles')}</InputLabel>
            <Stack
              gap={1}
              sx={{ overflowY: 'scroll', height: 'calc(100vh - 565px)' }}
            >
              {selectedEdition != null &&
                editions
                  .find((edition) => edition.name === selectedEdition)
                  ?.videoSubtitles.map((subtitle) => (
                    <Card sx={{ minHeight: 140 }}>
                      <Typography>{subtitle.id}</Typography>
                      <Typography>{subtitle.language.name[0].value}</Typography>
                      <Typography>{subtitle.language.slug}</Typography>
                      <Typography>{subtitle.srtSrc}</Typography>
                      <Typography>{subtitle.vttSrc}</Typography>
                    </Card>
                  ))}
            </Stack>
          </Stack>
        </Section>
      )}
    </>
  )
}
