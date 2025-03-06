import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useField } from 'formik'
import { useTranslations } from 'next-intl'

import File5 from '@core/shared/ui/icons/File5'

import { File } from '../../../../../../../../../../components/File'
import { GetAdminVideo_AdminVideo_VideoEdition_VideoSubtitle as Subtitle } from '../../../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { FileUpload } from '../../../../Metadata/VideoImage/FileUpload'

import { validateSubtitleFile } from './validateSubtitleFile'

function LinkFile({ name, link }: { name: string; link: string }) {
  return (
    <Paper
      sx={{
        p: 1,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        width: '100%'
      }}
    >
      <Box
        sx={{
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'primary.main',
          borderRadius: 1,
          height: 40,
          width: 40
        }}
      >
        <File5 />
      </Box>
      <Link
        variant="subtitle2"
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ fontWeight: 800 }}
      >
        {name}
      </Link>
    </Paper>
  )
}

export function SubtitleFileUpload({ subtitle }: { subtitle?: Subtitle }) {
  const t = useTranslations()
  const [vttField, _vttMeta, vttHelpers] = useField<File | null>('vttFile')
  const [srtField, _srtMeta, srtHelpers] = useField<File | null>('srtFile')

  const handleDropMultiple = async (files: File[]) => {
    // Process each file and assign to the appropriate field
    for (const file of files) {
      const extension = file.name.split('.').pop()?.toLowerCase()

      if (extension === 'vtt') {
        await vttHelpers.setValue(file)
      } else if (extension === 'srt') {
        await srtHelpers.setValue(file)
      }
    }
  }

  const handleDeleteVtt = async () => {
    await vttHelpers.setValue(null)
  }

  const handleDeleteSrt = async () => {
    await srtHelpers.setValue(null)
  }

  // Use the imported validator function
  const validateFile = (file: File) => {
    return validateSubtitleFile(file, vttField, srtField)
  }

  return (
    <Stack gap={2}>
      <Typography variant="subtitle2">{t('Subtitle Files')}</Typography>
      <Typography variant="body2" color="text.secondary">
        {t(
          'You can upload both VTT and SRT files for the same subtitle. Drop files together or one at a time.'
        )}
      </Typography>

      <FileUpload
        onDropMultiple={handleDropMultiple}
        maxFiles={2}
        validator={validateFile}
        accept={{
          'text/vtt': ['.vtt'],
          'text/plain': ['.srt'],
          'application/x-subrip': ['.srt'],
          'text/srt': ['.srt']
        }}
        loading={false}
      />

      {vttField.value && (
        <File
          file={vttField.value}
          type="text"
          actions={{ onDelete: handleDeleteVtt }}
        />
      )}

      {srtField.value && (
        <File
          file={srtField.value}
          type="text"
          actions={{ onDelete: handleDeleteSrt }}
        />
      )}

      {vttField.value == null && subtitle?.vttSrc && (
        <LinkFile
          name={subtitle.vttSrc.split('/').pop() ?? ''}
          link={subtitle.vttSrc}
        />
      )}

      {srtField.value == null && subtitle?.srtSrc && (
        <LinkFile
          name={subtitle.srtSrc.split('/').pop() ?? ''}
          link={subtitle.srtSrc}
        />
      )}
    </Stack>
  )
}
