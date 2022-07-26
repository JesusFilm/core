import { ReactElement } from 'react'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'

interface TemplateCardProps {
  template: Template
}

// This should be updated to use type journey
interface Template {
  id: string
  title: string
  date: string
  description: string
  socialShareImage: string
}

export function TemplateCard({ template }: TemplateCardProps): ReactElement {
  return (
    <Card
      aria-label="template-card"
      variant="outlined"
      sx={{
        borderRadius: 0,
        borderColor: 'divider',
        borderBottom: 'none',
        '&:last-of-type': {
          borderBottomLeftRadius: { xs: 0, sm: 12 },
          borderBottomRightRadius: { xs: 0, sm: 12 }
        },
        '&:first-of-type': {
          borderTopLeftRadius: { xs: 0, sm: 12 },
          borderTopRightRadius: { xs: 0, sm: 12 }
        },
        display: 'flex'
      }}
    >
      <CardActionArea>
        <CardContent>
          <Stack direction="row" spacing={6}>
            <Box
              component="img"
              src={template.socialShareImage}
              alt={template.title}
              sx={{
                height: '120px',
                width: '120px',
                objectFit: 'cover',
                borderRadius: 1
              }}
            />
            <Stack direction="column" spacing={1}>
              <Typography variant="subtitle1">{template.title}</Typography>
              <Typography variant="caption">{`${template.date}- ${template.description}`}</Typography>
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>

      <CardActions sx={{ alignSelf: 'flex-start' }}>
        <IconButton>
          <MoreVertRoundedIcon />
        </IconButton>
      </CardActions>
    </Card>
  )
}
