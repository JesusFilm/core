import { ReactElement, ReactNode } from 'react'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import QuestionAnswerOutlined from '@mui/icons-material/QuestionAnswerOutlined'
import WebOutlined from '@mui/icons-material/WebOutlined'
import MenuBookRounded from '@mui/icons-material/MenuBookRounded'

interface GoalDescriptionProps {
  label: string
  description: string
  icon: ReactNode
}

export function ActionInformation(): ReactElement {
  const GoalDescription = ({
    label,
    description,
    icon
  }: GoalDescriptionProps): ReactElement => (
    <Stack direction="row" gap={2.5} sx={{ pb: 2 }}>
      {icon}
      <Stack direction="column">
        <Typography variant="subtitle2" gutterBottom sx={{ pt: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="caption" color="secondary.light" gutterBottom>
          {description}
        </Typography>
      </Stack>
    </Stack>
  )

  return (
    <Stack gap={2} sx={{ p: 6 }} data-testid="ActionInformation">
      <Typography variant="subtitle2" color="secondary.dark">
        What are Goals?
      </Typography>
      <Typography variant="body1" color="secondary.light">
        Depending on the link you provide for the actions, the target of your
        Journey will be determined automatically from the following list:
      </Typography>
      <Divider sx={{ my: 2 }} />
      <GoalDescription
        label="Start a Conversation"
        description="If the goal is to go any chat platform"
        icon={<QuestionAnswerOutlined />}
      />
      <GoalDescription
        label="Visit a Website"
        description="This could be your church or ministry website, or whatever you want to redirect the viewer to."
        icon={<WebOutlined />}
      />
      <GoalDescription
        label="Link to Bible"
        description="If the target of the journey is to download the Bible"
        icon={<MenuBookRounded />}
      />
    </Stack>
  )
}
