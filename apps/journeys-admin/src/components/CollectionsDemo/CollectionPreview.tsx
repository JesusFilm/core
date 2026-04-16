import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import type { Collection, MockTemplate } from './mockData'
import { MOCK_TEMPLATES } from './mockData'

function getTemplateById(id: string): MockTemplate | undefined {
  return MOCK_TEMPLATES.find((t) => t.id === id)
}

interface CollectionPreviewProps {
  collection: Collection
}

export function CollectionPreview({
  collection
}: CollectionPreviewProps): ReactElement {
  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {/* Header */}
        <Box sx={{ px: 4, pt: 4, pb: 1 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, mb: 1.5, lineHeight: 1.2 }}
          >
            {collection.title || 'Untitled Collection'}
          </Typography>

          {collection.description !== '' && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 1, lineHeight: 1.6 }}
            >
              {collection.description}
            </Typography>
          )}

          {collection.pageDescription !== '' && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1.5, lineHeight: 1.6 }}
            >
              {collection.pageDescription}
            </Typography>
          )}

          {collection.creatorName !== '' && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
            >
              <Avatar
                src={collection.creatorImageUrl || undefined}
                sx={{ width: 32, height: 32 }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {collection.creatorName}
              </Typography>
            </Stack>
          )}
        </Box>

        {/* Template cards — horizontal scroll */}
        {collection.templateIds.length > 0 && (
          <Box
            sx={{
              px: 4,
              my: 4,
              overflowX: 'auto',
              '&::-webkit-scrollbar': { height: 6 },
              '&::-webkit-scrollbar-thumb': {
                borderRadius: 3,
                backgroundColor: 'rgba(0,0,0,0.15)'
              }
            }}
          >
            <Stack direction="row" spacing={2} sx={{ width: 'max-content' }}>
              {collection.templateIds.map((id) => {
                const tmpl = getTemplateById(id)
                if (tmpl == null) return null
                return (
                  <Card
                    key={id}
                    variant="outlined"
                    sx={{
                      width: 220,
                      flexShrink: 0,
                      borderRadius: 2,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Image */}
                    <Box
                      sx={{
                        position: 'relative',
                        height: 260,
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        component="img"
                        src={tmpl.imageUrl}
                        alt={tmpl.title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </Box>

                    {/* Info */}
                    <Box sx={{ p: 1.5, flex: 1 }}>
                      <Typography
                        variant="overline"
                        color="text.secondary"
                        sx={{ fontSize: 10, lineHeight: 1.2 }}
                      >
                        {tmpl.languageCode}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, mt: 0.25, mb: 0.5 }}
                      >
                        {tmpl.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.4
                        }}
                      >
                        {tmpl.description}
                      </Typography>
                    </Box>

                    {/* Actions */}
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ px: 1.5, pb: 1.5 }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          flex: 1,
                          textTransform: 'none',
                          borderRadius: 5,
                          fontWeight: 600
                        }}
                      >
                        Use
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          minWidth: 36,
                          px: 0,
                          borderRadius: 5,
                          backgroundColor: 'text.primary',
                          '&:hover': {
                            backgroundColor: 'text.secondary'
                          }
                        }}
                      >
                        <PlayArrowIcon sx={{ fontSize: 18 }} />
                      </Button>
                    </Stack>
                  </Card>
                )
              })}
            </Stack>
          </Box>
        )}

        {collection.templateIds.length === 0 && (
          <Box sx={{ px: 4, my: 4 }}>
            <Box
              sx={{
                py: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 2
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No templates in this collection yet.
              </Typography>
            </Box>
          </Box>
        )}

        {/* PDF/Video embed placeholder */}
        {collection.pdfVideoUrl !== '' && (
          <Box sx={{ px: 4, pb: 4 }}>
            <Box
              sx={{
                backgroundColor: 'grey.100',
                borderRadius: 2,
                p: 3,
                height: 340,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ wordBreak: 'break-all', textAlign: 'center' }}
              >
                {collection.pdfVideoUrl}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}
