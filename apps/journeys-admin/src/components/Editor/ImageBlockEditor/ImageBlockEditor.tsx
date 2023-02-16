import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import { ReactElement, useState } from 'react'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { ImageBlockHeader } from '../ImageBlockHeader'
import { ImageLibrary } from '../ImageLibrary'

interface ImageBlockEditorProps {
  selectedBlock: ImageBlock | null
  onChange: (block: ImageBlock) => Promise<void>
  onDelete?: () => Promise<void>
  loading?: boolean
  noSource?: boolean
}

export function ImageBlockEditor({
  selectedBlock,
  onChange,
  onDelete,
  loading,
  noSource = false
}: ImageBlockEditorProps): ReactElement {
  const [open, setOpen] = useState(noSource)

  const handleImageDelete = async (): Promise<void> => {
    if (onDelete != null) {
      await onDelete()
    }
  }

  return (
    <>
      {!noSource && (
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
      )}
      <ImageLibrary
        open={open}
        onClose={() => setOpen(false)}
        onChange={onChange}
        onDelete={handleImageDelete}
        selectedBlock={selectedBlock}
        loading={loading}
        noSource={noSource}
      />
    </>
  )
}
