import { ReactElement } from 'react'
import ImageIcon from '@mui/icons-material/Image'
import Image from 'next/image'
import Box from '@mui/material/Box'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'

interface ImageBlockThumbnailProps {
  selectedBlock: ImageBlock | null
}

export function ImageBlockThumbnail({
  selectedBlock
}: ImageBlockThumbnailProps): ReactElement {
  return (
    <div
      style={{
        overflow: 'hidden',
        borderRadius: 8,
        height: 55,
        width: 55,
        backgroundColor: '#EFEFEF',
        minWidth: 55
      }}
    >
      {selectedBlock?.src != null && (
        <Image
          src={selectedBlock.src}
          alt={selectedBlock.alt}
          width={55}
          height={55}
          object-fit="cover"
        />
      )}
      {selectedBlock?.src == null && (
        <Box
          borderRadius={2}
          sx={{
            width: 55,
            height: 55,
            bgcolor: '#EFEFEF',
            verticalAlign: 'center'
          }}
          justifyContent="center"
          data-testid="imageBlockThumbnailPlaceholder"
        >
          <ImageIcon sx={{ marginTop: 4, marginLeft: 4 }} />
        </Box>
      )}
    </div>
  )
}
