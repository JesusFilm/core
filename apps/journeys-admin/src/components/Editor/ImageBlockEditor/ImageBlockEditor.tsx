import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import { ReactElement, useState } from 'react'
import { object, string } from 'yup'
import { useFormik } from 'formik'
import { noop } from 'lodash'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { ImageBlockHeader } from '../ImageBlockHeader'
import { ImageLibrary } from '../ImageLibrary'

interface ImageBlockEditorProps {
  selectedBlock: ImageBlock | null
  onChange: (block: ImageBlock) => Promise<void>
  onDelete?: () => Promise<void>
  loading?: boolean
}

export function ImageBlockEditor({
  selectedBlock,
  onChange,
  onDelete,
  loading
}: ImageBlockEditorProps): ReactElement {
  const [open, setOpen] = useState(false)

  const srcSchema = object().shape({
    src: string().url('Please enter a valid url').required('Required')
  })

  const handleImageDelete = async (): Promise<void> => {
    if (onDelete != null) {
      await onDelete()
      formik.resetForm({ values: { src: '' } })
    }
  }

  const formik = useFormik({
    initialValues: {
      src: selectedBlock?.src ?? ''
    },
    validationSchema: srcSchema,
    onSubmit: noop
  })

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          width: 285,
          height: 78,
          borderRadius: 2
        }}
      >
        <CardActionArea
          data-testid="card click area"
          onClick={() => setOpen(true)}
          sx={{
            height: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            display: 'flex'
          }}
        >
          <ImageBlockHeader selectedBlock={null} showAdd />
        </CardActionArea>
      </Card>
      <ImageLibrary
        open={open}
        onClose={() => setOpen(false)}
        onChange={onChange}
        onDelete={handleImageDelete}
        selectedBlock={selectedBlock}
        loading={loading}
      />
    </>
  )
}
