import { useSuspenseQuery } from '@apollo/client'
import { graphql } from 'gql.tada'
import { useParams, useRouter } from 'next/navigation'
import { Section } from '../../../../../components/Section'
import AddIcon from '@mui/icons-material/Add'
import List  from '@mui/material/List'
import DeleteIcon from '@mui/icons-material/Delete'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'

const GET_ADMIN_VIDEO_VARIANTS = graphql(`
  query GetAdminVideoVariants($id: ID!, $languageId: ID) {
    adminVideo(id: $id) {
      variants {
        id
        videoId
        slug
        videoEdition {
          id
          name
        }
        hls
        language {
          id
          name(languageId: $languageId) {
            value
            primary
          }
          slug
        }
        downloads {
          id
          quality
          size
          height
          width
          url
        }
      }
    }
    videoEditions {
      id
      name
    }
  }
`)

export default function AudioLayout({
  children
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const router = useRouter()
  const videoId = params?.videoId as string

  const { data } = useSuspenseQuery(GET_ADMIN_VIDEO_VARIANTS, {
    variables: { id: videoId }
  })
  const variants = data.adminVideo.variants

  return (
    <>
    <Section
          boxProps={{
            sx: { p: 2, height: 'calc(100vh - 400px)' }
          }}
          // if you change the title, change the element selected in the getVariantSectionDimensions function above
          title="Audio Languages"
          variant="outlined"
          action={{
            label: 'Add Audio Language',
            startIcon: <AddIcon />,
            onClick: () => router.push(`/videos/${videoId}/audio/add`)
          }}
        >
          <List
            // itemData={variants}
            // itemCount={variants.length}
            // itemSize={ITEM_SIZE}
            // itemKey={(index, data) => data[index].id}
            // overscanCount={10}
            style={{
              marginTop: 8
            }}
          >
            {variants.map((variant) => (
              <ListItem
              onClick={() => router.push(`/videos/${videoId}/audio/${variant.id}`)}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.default',
                borderRadius: 1,
                p: 1,
                '&:hover': {
                  cursor: 'pointer',
                  backgroundColor: 'action.hover'
                },
                transition: 'background-color 0.3s ease',
                // ...style,
                // css below the spread styles will override react-window styles, use with caution
                height: 66,
                width: 'calc(100% - 20px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <ListItemText primary={primaryText} secondary={variant.language.id} />
              {onDelete && (
                <IconButton
                  size="small"
                  onClick={() => router.push(`/videos/${videoId}/audio/${variant.id}/delete`)}
                  aria-label="delete variant"
                  sx={{
                    color: 'error.main',
                    ml: 1,
                    '&:hover': {
                      backgroundColor: 'error.light',
                      color: 'error.contrastText'
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </ListItem>
            ))}
          </List>
      </Section>
      </>
      )}
  )
}
