import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import { GetTags } from '../../../__generated__/GetTags'
import { TemplateSections } from '../TemplateSections'

export const GET_TAGS = gql`
  query GetTags {
    tags {
      id
      name {
        value
        primary
      }
    }
  }
`

export function TemplateGallery(): ReactElement {
  const { data } = useQuery<GetTags>(GET_TAGS)
  const router = useRouter()

  console.log('tags', data?.tags)
  console.log('query param', router.query.tags)

  return (
    <Box>
      <Typography variant="h3">
        This is a placeholder for the new template gallery
      </Typography>
      <Typography variant="h3">
        Your email is currently under a launch darkly flag
      </Typography>
      <TemplateSections />
    </Box>
  )
}
