import { ReactElement } from 'react'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import CardMedia from '@mui/material/CardMedia'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import IconButton from '@mui/material/IconButton'
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded'
import { Template } from '../TemplateList'

export interface TemplateCardProps {
  template: Template // todo update prop type
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
      <CardMedia
        component="img"
        image={template.socialShareImage}
        height="129px"
        alt={template.title}
        sx={{
          width: '129px'
        }}
      />

      <CardActionArea>
        <CardContent>
          <Stack direction="row" spacing={6}>
            <Stack direction="column" spacing={1}>
              <Typography variant="subtitle1">{template.title}</Typography>
              <Typography variant="caption">{`${template.date} - ${template.description}`}</Typography>
              <Typography variant="body2">
                <TranslateRoundedIcon fontSize="small" />
                {template.language}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>

      <CardActions sx={{ alignSelf: 'flex-end' }}>
        <IconButton>
          <MoreVertRoundedIcon />
        </IconButton>
      </CardActions>
    </Card>
  )
}
