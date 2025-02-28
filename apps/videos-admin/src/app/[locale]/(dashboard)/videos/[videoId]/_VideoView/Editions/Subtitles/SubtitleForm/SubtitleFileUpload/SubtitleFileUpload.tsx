import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { useField } from 'formik'

import File5 from '@core/shared/ui/icons/File5'

import { File } from '../../../../../../../../../../components/File'
import { GetAdminVideo_AdminVideo_VideoEditions } from '../../../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { ArrayElement } from '../../../../../../../../../../types/array-types'
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

type Subtitle = ArrayElement<
  ArrayElement<GetAdminVideo_AdminVideo_VideoEditions>['videoSubtitles']
>

export function SubtitleFileUpload({ subtitle }: { subtitle?: Subtitle }) {
  const [field, meta, helpers] = useField<File | null>('file')

  const handleDrop = async (file: File) => {
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

  return (
    <Stack gap={2}>
      <FileUpload
        onDrop={handleDrop}
        accept={{
          'text/vtt': ['.vtt'],
          'application/x-subrip': ['.srt']
        }}
        loading={false}
        noClick={false}
      />
      {field.value ? (
        <File file={field.value} actions={{ onDelete: handleDelete }} />
      ) : subtitle?.value ? (
        <LinkFile
          name={subtitle.value.split('/').pop() ?? ''}
          link={subtitle.value}
        />
      ) : null}
    </Stack>
  )
}
