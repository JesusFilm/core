import { useState } from 'react'

import { File } from '../../../../../../../../../components/File'
import { FileUpload } from '../../../Metadata/VideoImage/FileUpload'

export function SubtitleUpload() {
  const [file, setFile] = useState<File | null>(null)
  const handleDrop = async (file: File) => {
    console.log(file)
    setFile(file)
  }

  const handleDelete = () => {
    setFile(null)
  }

  return (
    <>
      <FileUpload
        onDrop={handleDrop}
        accept={{ 'text/vtt': [] }}
        onUploadComplete={() => {}}
        loading={false}
        noClick={false}
      />
      {file && <File file={file} actions={{ onDelete: handleDelete }} />}
    </>
  )
}
