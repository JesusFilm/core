import { ReactElement, useState } from 'react'
import {
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  ButtonGroup,
  makeStyles
} from '@material-ui/core'
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import { RadioOptionType, RadioQuestionType } from '../../types'

const useStyles = makeStyles(() => ({
  highlightIcon: {
    color: '#54A055'
  },
  buttonLabels: {
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.4,
    textTransform: 'none',
    justifyContent: 'flex-start'
  },
  light: {
    background: '#ffffff'
  },
  dark: {
    background: '#3b3b3b',
    color: '#ffffff'
  }
}))

export const RadioQuestion = ({
  label,
  description,
  children,
  variant = 'light'
}: RadioQuestionType): ReactElement => {
  const classes = useStyles()
  const [selectedOption, setSelectedOption] = useState<
  RadioOptionType | undefined
  >()

  const handleButtonSelect = (selected: RadioOptionType) => {
    setSelectedOption(selected)
    console.log('option', selected)
  }

  return (
    <Container maxWidth="sm">
      {variant && (
        <Card className={variant === 'light' ? classes.light : classes.dark}>
          <CardContent>
            <Typography variant="h1" gutterBottom>
              {label}
            </Typography>
            <Typography variant="subtitle1">{description}</Typography>
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
                    <Button
                      variant="contained"
                      key={option.id}
                      className={classes.buttonLabels}
                      onClick={() => handleButtonSelect(option)}
                      disabled={
                        selectedOption?.id !== option.id && !!selectedOption?.id
                      }
                      startIcon={
                        selectedOption?.id === option.id
                          ? (
                          <CheckCircleIcon className={classes.highlightIcon} />
                            )
                          : (
                          <RadioButtonUncheckedIcon />
                            )
                      }
                    >
                      {option.label}
                    </Button>
                  )
              )}
            </ButtonGroup>
          </CardContent>
        </Card>
      )}
    </Container>
  )
}
