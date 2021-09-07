import { ReactElement, useState } from 'react'
import {
  Typography,
  Container,
  Card,
  CardContent,
  ButtonGroup,
  makeStyles,
  createStyles
} from '@material-ui/core'
import { RadioQuestionType } from '../../../types'
import { RadioOption } from '../RadioOption'
import { useAppDispatch } from '../../../libs/store/store'
import { navigate } from '../../Conductor/conductorSlice'

const useStyles = makeStyles(
  () =>
    createStyles({
      light: {
        background: '#ffffff'
      },
      dark: {
        background: '#3b3b3b',
        color: '#ffffff'
      }
    }),
  { name: 'MuiRadioQuestionComponent' }
)

export function RadioQuestion ({
  label,
  description,
  children,
  variant = 'light'
}: RadioQuestionType): ReactElement {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const [selectedId, setSelectedId] = useState<string>('')

  const handleClick = (id: string, action: string): void => {
    setSelectedId(id)
    dispatch(navigate(action))
  }

  return (
    <Container maxWidth="sm">
      <Card
        data-testid="RadioQuestionCard"
        className={variant === 'dark' ? classes.dark : classes.light}
      >
        <CardContent>
          <Typography variant="h1" gutterBottom>
            {label}
          </Typography>
          <Typography variant="h6">{description}</Typography>
        </CardContent>
        <CardContent>
          <ButtonGroup
            orientation="vertical"
            variant="contained"
            fullWidth={true}
          >
            {children?.map(
              (option) =>
                option.__typename === 'RadioOption' && (
                  <RadioOption
                    {...option}
                    key={option.id}
                    selected={selectedId !== ''}
                    disabled={selectedId !== '' && selectedId !== option.id}
                    handleClick={handleClick}
                  />
                )
            )}
          </ButtonGroup>
        </CardContent>
      </Card>
    </Container>
  )
}
