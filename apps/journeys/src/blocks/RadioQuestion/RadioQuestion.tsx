import { useState } from 'react';
import {
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  ButtonGroup,
  makeStyles,
  ThemeProvider,
} from '@material-ui/core';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import customTheme from './RadioQuestion.theme';
import { RadioOptionType, RadioQuestionType } from '../../types';

const useStyles = makeStyles(() => ({
  highlightIcon: {
    color: customTheme.lightTheme.palette.success.main,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1.14,
  },
  description: {
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 1.4,
  },
  buttonLabels: {
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.4,
    textTransform: 'none',
    justifyContent: 'flex-start',
  },
}));

type RadioQuestionProps = {
  block: RadioQuestionType;
};

export const RadioQuestion = ({ block }: RadioQuestionProps) => {
  const classes = useStyles();
  const [selectedOption, setSelectedOption] = useState<
    RadioOptionType | undefined
  >();

  const handleButtonSelect = (selected: RadioOptionType) => {
    setSelectedOption(selected);
    console.log('option', selected);
  };

  return (
    <Container maxWidth="sm">
      <Card>
        <CardContent>
          <Typography
            variant="subtitle1"
            className={classes.title}
            gutterBottom
          >
            {block.label}
          </Typography>
          <Typography variant="subtitle2" className={classes.description}>
            {block.description}
          </Typography>
        </CardContent>
        <CardContent>
          <ButtonGroup
            orientation="vertical"
            variant="contained"
            fullWidth={true}
          >
            {block.children?.map(
              (option) =>
                option.__typename === 'RadioOption' && (
                  <Button
                    variant="contained"
                    key={option.id}
                    className={classes.buttonLabels}
                    onClick={() => handleButtonSelect(option)}
                    disabled={
                      selectedOption?.id !== option.id && !!selectedOption
                    }
                    startIcon={
                      selectedOption?.id === option.id ? (
                        <CheckCircleIcon className={classes.highlightIcon} />
                      ) : (
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
    </Container>
  );
};
