import Stack from '@mui/material/Stack'
import { useField } from 'formik'

import { File } from '../../../../../../../../../../components/File'
import { FileUpload } from '../../../../Metadata/VideoImage/FileUpload'

export function SubtitleFileUpload() {
  const [field, meta, helpers] = useField('file')

  const handleDrop = async (file: File) => {
    await helpers.setValue(file)
  }

  return (
    <Stack gap={2}>
      <FileUpload
        onDrop={handleDrop}
        accept={{ 'text/vtt': [] }}
        loading={false}
        noClick={false}
      />
      {field.value && (
        <File
          file={field.value}
          actions={{ onDelete: () => helpers.setValue(null) }}
        />
      )}
    </Stack>
  )
}
