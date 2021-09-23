import { ReactElement, ReactNode } from "react";
import { Story, Meta } from "@storybook/react";
import { ThemeProvider, useTheme } from "@mui/material";
import { Box } from "@mui/system";

import { Typography, TypographyProps } from "./Typography";
import {
  TypographyVariant,
  TypographyColor,
  TypographyAlign,
} from "./../../../__generated__/globalTypes";
import { sharedUiConfig } from "../../libs/storybook/decorators";
import { darkTheme } from "../../libs/theme/theme";

const TypographyDemo = {
  ...sharedUiConfig,
  component: Typography,
  title: "shared-ui/Typography",
};

interface TypographyStoryProps extends TypographyProps {
  variants: Array<string | null>;
  heading?: string;
}

// TODO: Replace with real card component
interface CardProps {
  children: ReactNode;
}

const Card = ({ children }: CardProps): ReactElement => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.surface.main,
        color: theme.palette.surface.contrastText,
        p: 3,
        borderRadius: 4,
        mb: 2,
      }}
    >
      {children}
    </Box>
  );
};

const ColorCards = ({
  variants,
  heading = "",
  ...props
}: TypographyStoryProps): ReactElement => {
  return (
    <Card>
      <Typography
        {...props}
        sx={{ m: 0 }}
        variant={TypographyVariant.h6}
        content={heading}
      />
      {variants.map((variant) => (
        <>
          <Typography
            {...props}
            sx={{ m: 0 }}
            variant={TypographyVariant.overline}
            content={variant ?? "Default"}
          />
          <Typography
            {...props}
            sx={{ m: 0 }}
            variant={TypographyVariant.h5}
            color={variant as TypographyColor}
            content="Heading"
          />
        </>
      ))}
    </Card>
  );
};

const VariantTemplate: Story<TypographyStoryProps> = (props) => (
  <Card>
    {props.variants.map((variant) => (
      <Typography
        {...props}
        variant={variant as TypographyVariant}
        content={variant ?? ""}
      />
    ))}
  </Card>
);

export const Variants = VariantTemplate.bind({});
Variants.args = {
  variants: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "subtitle1",
    "subtitle2",
    "body1",
    "body2",
    "caption",
    "overline",
  ],
};

const ColorTemplate: Story<TypographyStoryProps> = (props) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
    }}
  >
    <ColorCards {...props} variants={props.variants} heading={"Surface"} />
    <ThemeProvider theme={darkTheme}>
      <ColorCards
        {...props}
        variants={props.variants}
        heading={"Surface Alt"}
      />
    </ThemeProvider>
  </div>
);

export const Colors = ColorTemplate.bind({});
Colors.args = {
  variants: [null, "primary", "secondary", "error"],
};

const AlignmentTemplate: Story<TypographyStoryProps> = (props) => (
  <Card>
    {props.variants.map((variant) => (
      <Typography
        {...props}
        variant={TypographyVariant.h6}
        align={variant as TypographyAlign}
        content={variant ?? ""}
      />
    ))}
  </Card>
);

export const Alignment = AlignmentTemplate.bind({});
Alignment.args = {
  variants: ["left", "center", "right"],
};

export default TypographyDemo as Meta;
