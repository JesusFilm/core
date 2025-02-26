import { useField } from 'formik'

import { File } from '../../../../../../../../../../components/File'
import { FileUpload } from '../../../../Metadata/VideoImage/FileUpload'

export function SubtitleUpload() {
  const [field, meta, helpers] = useField('file')

  const handleDrop = async (file: File) => {
    await helpers.setValue(file)
  }

  return (
    <>
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
    </>
  )
}
