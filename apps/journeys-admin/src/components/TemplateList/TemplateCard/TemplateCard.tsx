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
  return (
    <>
      {template != null && (
        <Card
          aria-label="template-card"
          variant="outlined"
          sx={{
            borderRadius: 0,
            borderColor: 'divider',
            borderBottom: 'none',
            display: 'flex',
            height: '129px',
            '&:last-of-type': {
              borderBottomLeftRadius: { xs: 0, sm: 12 },
              borderBottomRightRadius: { xs: 0, sm: 12 }
            },
            '&:first-of-type':
              admin != null
                ? {
                    borderTopLeftRadius: { xs: 0, sm: 12 },
                    borderTopRightRadius: { xs: 0, sm: 12 }
                  }
                : undefined
          }}
        >
          {template.primaryImageBlock?.src != null ? (
            <CardMedia
              component="img"
              image={template.primaryImageBlock.src}
              height="129px"
              alt={template.title}
              sx={{
                width: '129px'
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
                alignItems: 'center'
              }}
            >
              <InsertPhotoRoundedIcon />
            </CardMedia>
          )}

          <CardActionArea>
            <CardContent>
              <Stack direction="row" spacing={6}>
                <Stack direction="column" spacing={1}>
                  <Typography variant="subtitle1">{template.title}</Typography>

                  <Typography variant="caption" sx={{ pb: 4 }}>
                    {template != null &&
                      intlFormat(parseISO(template.createdAt), {
                        day: 'numeric',
                        month: 'long',
                        year: isThisYear(parseISO(template.createdAt))
                          ? undefined
                          : 'numeric'
                      })}
                    {` - ${template.description as string}`}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {admin === true && (
                      <>
                        <StatusChip status={template.status} />
                        <Box sx={{ pr: 6 }} />
                      </>
                    )}
                    <TranslateRoundedIcon sx={{ fontSize: '14px', mr: 1 }} />
                    {template?.language.name[0].value}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </CardActionArea>

          {admin === true && (
            <CardActions sx={{ alignSelf: 'flex-end' }}>
              <JourneyCardMenu
                id={template.id}
                status={template.status}
                slug={template.slug}
                published={template.publishedAt != null}
              />
            </CardActions>
          )}
        </Card>
      )}
    </>
  )
}
