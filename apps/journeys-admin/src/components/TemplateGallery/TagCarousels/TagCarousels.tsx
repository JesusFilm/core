import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useMemo } from 'react'

import { useTagsQuery } from '../../../libs/useTagsQuery'

export function TagCarousels(): ReactElement {
  const { parentTags, childTags } = useTagsQuery()

  const featureTagId = useMemo(() => {
    return parentTags.find((tag) => tag.name[0].value === 'Felt Needs')?.id
  }, [parentTags])

  const featureTags = useMemo(() => {
    return featureTagId != null
      ? childTags.filter((tag) => tag.parentId === featureTagId)
      : []
  }, [childTags, featureTagId])

  const collectionTagId = useMemo(() => {
    return parentTags.find((tag) => tag.name[0].value === 'Collections')?.id
  }, [parentTags])

  const collectionTags = useMemo(() => {
    return collectionTagId != null
      ? childTags.filter((tag) => tag.parentId === collectionTagId)
      : []
  }, [childTags, collectionTagId])

  console.log('tags', parentTags)

  return (
    <Stack gap={7} sx={{ mb: { xs: 10, md: 16 } }}>
      <Stack
        direction="row"
        gap={4}
        sx={{
          overflowX: 'scroll',
          // Hide scrollbar on Chrome, Safari
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          // Hide scrollbar on Firefox
          scrollbarWidth: 'none'
        }}
      >
        {featureTags.map((tag) => (
          <Paper
            key={`${tag.name[0].value}-button`}
            elevation={0}
            sx={{
              backgroundColor: 'grey',
              px: 8,
              py: 7,
              color: 'white',
              borderRadius: 2
            }}
          >
            <Typography variant="h3">{tag.name[0].value}</Typography>
          </Paper>
        ))}
      </Stack>
      <Stack direction="row" gap={10}>
        {collectionTags.map((tag) => (
          <Stack
            direction="row"
            key={`${tag.name[0].value}-button`}
            gap={3}
            alignItems="center"
          >
            <Box
              sx={{
                backgroundColor: 'grey',
                height: '64px',
                width: '64px',
                color: 'white',
                borderRadius: 8
              }}
            />
            <Stack>
              <Typography variant="subtitle2">{tag.name[0].value}</Typography>
              <Typography variant="caption">{tag.name[0].value}</Typography>
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}
