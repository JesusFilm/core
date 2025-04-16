import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useField } from 'formik'

import { FileUpload } from '../../../../../../../../components/FileUpload'
import { LinkFile } from '../../../../../../../../components/LinkFile'

import { validateSubtitleFile } from './validateSubtitleFile'

export function SubtitleFileUpload({
  subtitle
}: {
  subtitle?: {
    vttSrc: string | null
    srtSrc: string | null
    vttAsset?: {
      id: string
      originalFilename: string | null
    } | null
    srtAsset?: {
      id: string
      originalFilename: string | null
    } | null
  }
}) {
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

  const validateFile = (file: File) => {
    return validateSubtitleFile(file)
  }

  return (
    <Stack gap={2}>
      <Typography variant="subtitle2">Subtitle Files</Typography>
      <Typography variant="body2" color="text.secondary">
        You can upload both VTT and SRT files for the same subtitle. Drop files
        together or one at a time.
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
        maxSize={10000000}
        loading={false}
      />

      {vttField.value && (
        <LinkFile
          name={vttField.value.name}
          link={URL.createObjectURL(vttField.value)}
          onDelete={handleDeleteVtt}
        />
      )}

      {srtField.value && (
        <LinkFile
          name={srtField.value.name}
          link={URL.createObjectURL(srtField.value)}
          onDelete={handleDeleteSrt}
        />
      )}

      {vttField.value == null && subtitle?.vttSrc && (
        <LinkFile
          name={
            subtitle.vttAsset?.originalFilename ??
            subtitle.vttSrc.split('/').pop() ??
            ''
          }
          link={subtitle.vttSrc}
        />
      )}

      {srtField.value == null && subtitle?.srtSrc && (
        <LinkFile
          name={
            subtitle.srtAsset?.originalFilename ??
            subtitle.srtSrc.split('/').pop() ??
            ''
          }
          link={subtitle.srtSrc}
        />
      )}
    </Stack>
  )
}
