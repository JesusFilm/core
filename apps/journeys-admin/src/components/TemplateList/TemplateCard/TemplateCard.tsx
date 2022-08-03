import { ReactElement } from 'react'
import { parseISO, isThisYear, intlFormat } from 'date-fns'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import CardMedia from '@mui/material/CardMedia'
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded'
import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import IconButton from '@mui/material/IconButton'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Link from 'next/link'
import { GetPublicTemplates_journeys as Template } from '../../../../__generated__/GetPublicTemplates'
import { JourneyCardMenu } from '../../JourneyList/JourneyCard/JourneyCardMenu'
import { StatusChip } from '../../JourneyList/JourneyCard/StatusChip'

export interface TemplateCardProps {
  template?: Template
  admin?: boolean
}

export function TemplateCard({
  template,
  admin
}: TemplateCardProps): ReactElement {
  const nativeLanguage = template?.language.name[0].value ?? ''
  const localLanguage = template?.language.name[1]?.value
  const displayLanguage =
    nativeLanguage === localLanguage || localLanguage == null
      ? nativeLanguage
      : `${nativeLanguage} (${localLanguage})`

  return (
    <Card
      aria-label="template-card"
      variant="outlined"
      sx={{
        maxWidth: '100%',
        borderColor: 'divider',
        borderBottom: 'none',
        display: 'flex',
        height: '129px',
        '&:last-of-type': {
          borderBottomLeftRadius: { xs: 0, sm: 12 },
          borderBottomRightRadius: { xs: 0, sm: 12 }
        },
        '&:first-of-type':
          admin !== true
            ? {
                borderTopLeftRadius: { xs: 0, sm: 12 },
                borderTopRightRadius: { xs: 0, sm: 12 }
              }
            : undefined
      }}
    >
      {template?.primaryImageBlock?.src != null ? (
        <CardMedia
          component="img"
          image={template.primaryImageBlock.src}
          height="129px"
          alt={template.title}
          sx={{
            maxWidth: '129px',
            minWidth: '129px'
          }}
        />
      ) : (
        <CardMedia
          component="div"
          sx={{
            height: '129px',
            width: '129px',
            display: 'flex',
            position: 'relative',
            justifyContent: 'center',
            alignItems: 'center',
            maxWidth: '129px',
            minWidth: '129px',
            borderRight: '1px solid',
            borderColor: 'divider'
          }}
        >
          <InsertPhotoRoundedIcon />
        </CardMedia>
      )}

      <Link href={template != null ? `/templates/${template.id}` : ''} passHref>
        <CardActionArea>
          <CardContent>
            <Stack direction="column">
              {template != null ? (
                <>
                  <Typography variant="subtitle1" noWrap>
                    {template.title}
                  </Typography>
                  <Typography variant="caption" noWrap sx={{ pb: 4 }}>
                    {template != null &&
                      intlFormat(parseISO(template.createdAt), {
                        day: 'numeric',
                        month: 'long',
                        year: isThisYear(parseISO(template.createdAt))
                          ? undefined
                          : 'numeric'
                      })}
                    {` - ${template.description ?? ''}`}
                  </Typography>

                  <Stack direction="row">
                    {admin === true && (
                      <>
                        <StatusChip status={template.status} />
                        <Box sx={{ pr: 6 }} />
                      </>
                    )}

                    <Typography
                      variant="body2"
                      sx={{
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <TranslateRoundedIcon sx={{ fontSize: '14px', mr: 1 }} />
                      {displayLanguage}
                    </Typography>
                  </Stack>
                </>
              ) : (
                <>
                  <Skeleton variant="text" width={250} />
                  <Skeleton variant="text" width={500} sx={{ mb: 4 }} />
                  <Stack direction="row" spacing={6}>
                    {admin === true && <Skeleton variant="text" width={50} />}
                    <Skeleton variant="text" width={50} />
                  </Stack>
                </>
              )}
            </Stack>
          </CardContent>
        </CardActionArea>
      </Link>

      {admin === true && (
        <>
          {template != null ? (
            <CardActions sx={{ alignSelf: 'flex-end' }}>
              <JourneyCardMenu
                id={template.id}
                status={template.status}
                slug={template.slug}
                published={template.publishedAt != null}
                template={true}
              />
            </CardActions>
          ) : (
            <CardActions sx={{ alignSelf: 'flex-end' }}>
              <IconButton disabled>
                <MoreVertIcon />
              </IconButton>
            </CardActions>
          )}
        </>
      )}
    </Card>
  )
}
