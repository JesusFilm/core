import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { useField } from 'formik'

import File5 from '@core/shared/ui/icons/File5'

import { File } from '../../../../../../../../../../components/File'
import { GetAdminVideo_AdminVideo_VideoEdition_VideoSubtitle as Subtitle } from '../../../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { FileUpload } from '../../../../Metadata/VideoImage/FileUpload'

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
  const [field, meta, helpers] = useField<File | null>('file')

  const handleDrop = async (file: File) => {
    console.log('handleDrop', file)
    await helpers.setValue(file)
  }

  const handleDelete = async () => {
    const currentValue = field.value
    const initialValue = meta.initialValue ?? null
    const isInitialValue =
      currentValue?.name === initialValue?.name &&
      currentValue?.size === initialValue?.size &&
      currentValue?.type === initialValue?.type

    await helpers.setValue(isInitialValue ? null : initialValue)
  }

  // Custom file validator function for subtitle files
  // SRT files do not have an official MIME type, so we need to check the extension
  const validateSubtitleFile = (file: File) => {
    // Get the file extension
    const extension = file.name.split('.').pop()?.toLowerCase()
    // Check if the file is a VTT or SRT file based on extension
    if (extension !== 'vtt' && extension !== 'srt') {
      return {
        code: 'file-invalid-type',
        message: 'File must be a VTT or SRT subtitle file'
      }
    }
    return null
  }

  return (
    <Stack gap={2}>
      <FileUpload
        onDrop={handleDrop}
        validator={validateSubtitleFile}
        accept={{
          'text/vtt': ['.vtt'],
          'application/x-subrip': ['.srt']
        }}
        loading={false}
      />
      {field.value ? (
        <File
          file={field.value}
          type="text"
          actions={{ onDelete: handleDelete }}
        />
      ) : subtitle?.value ? (
        <LinkFile
          name={subtitle.value.split('/').pop() ?? ''}
          link={subtitle.value}
        />
      ) : null}
    </Stack>
  )
}
