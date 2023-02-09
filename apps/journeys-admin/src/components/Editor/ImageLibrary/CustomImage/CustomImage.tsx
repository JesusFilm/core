import { ReactElement } from 'react'
import Stack from '@mui/material/Box'
import { gql, useQuery } from '@apollo/client'
import { CloudflareUploadUrl } from '../../../../../__generated__/CloudflareUploadUrl'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../__generated__/GetJourney'
import { CustomUrl } from './CustomUrl'

export const CLOUDFLARE_UPLOAD_URL = gql`
  query CloudflareUploadUrl {
    createCloudflareImage {
      uploadUrl
      id
    }
  }
`

interface CustomImageProps {
  selectedBlock: ImageBlock | null
  onChange: (src: string) => void
}

export function CustomImage({
  selectedBlock,
  onChange
}: CustomImageProps): ReactElement {
  const { data } = useQuery<CloudflareUploadUrl>(CLOUDFLARE_UPLOAD_URL)

  return (
    <Stack sx={{ bgcolor: 'background.paper' }}>
      <CustomUrl
        selectedBlock={selectedBlock}
        onChange={onChange}
        cloudflareUploadUrl={data?.createCloudflareImage?.uploadUrl}
      />
    </Stack>
  )
}
