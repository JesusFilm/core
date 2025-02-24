import { Chip, Stack, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import { useTranslations } from 'next-intl'
import { ReactElement, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import Plus2 from '@core/shared/ui/icons/Plus2'

import { GetAdminVideo_AdminVideo_VideoEditions } from '../../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { ArrayElement } from '../../../../../../../../../types/array-types'
import { Section } from '../../../Section'
import { SubtitleForm } from '../../SubtitleForm'

interface EditionViewProps {
  edition: ArrayElement<GetAdminVideo_AdminVideo_VideoEditions>
}

function SubtitleCard({ subtitle }: { subtitle: any }): ReactElement {
  const t = useTranslations()
  return (
    <Box
      sx={{
        p: 1,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        minWidth: 200,
        bgcolor: 'background.paper',
        '&:hover': {
          borderColor: 'action.hover',
          cursor: 'pointer'
        }
      }}
    >
      <Stack direction="row" alignItems="center" gap={1}>
        <Typography variant="h6">{subtitle.language.name[0].value}</Typography>
        {subtitle.primary && (
          <Chip label={t('Primary')} color="success" variant="filled" />
        )}
      </Stack>
    </Box>
  )
}

export function EditionView({ edition }: EditionViewProps): ReactElement {
  const t = useTranslations()

  const [action, setAction] = useState<string | null>(null)

  const handleSubmit = (values: any) => {
    console.log(values)
  }

  return (
    <Box>
      <Section
        title={t('Subtitles')}
        action={{
          label: t('New Subtitle'),
          onClick: () => setAction('create'),
          startIcon: <Plus2 />
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {edition.videoSubtitles.map((subtitle) => (
            <SubtitleCard key={subtitle.id} subtitle={subtitle} />
          ))}
        </Box>
      </Section>
      <Dialog
        open={action === 'create'}
        onClose={() => setAction(null)}
        divider
        dialogTitle={{ title: t('Create Subtitle'), closeButton: true }}
      >
        <SubtitleForm
          variant="create"
          initialValues={{ language: '', primary: false }}
          onSubmit={handleSubmit}
        />
      </Dialog>
    </Box>
  )
}
