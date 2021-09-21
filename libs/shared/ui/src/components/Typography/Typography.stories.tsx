import { Story, Meta } from "@storybook/react";
import { Box } from "@mui/system";

import { Typography, TypographyProps } from "./Typography";
import {
  TypographyVariant,
  TypographyColor,
  TypographyAlign,
} from "./../../../__generated__/globalTypes";
import { journeysConfig } from "../../libs/storybook/decorators";
import { lightTheme } from "../../libs/theme/theme";

const TypographyDemo = {
  ...journeysConfig,
  component: Typography,
  title: "shared-ui/Typography",
};

interface TypographyStoryProps extends TypographyProps {
  variants: string[];
}

const VariantTemplate: Story<TypographyStoryProps> = (args) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
    }}
  >
    {args.variants.map((variant) => (
      <Typography
        {...args}
        variant={variant as TypographyVariant}
        content={`${variant} ${
          variant === "button" ? "this needs theming" : ""
        }`}
      />
    ))}
  </div>
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
    "button",
    "caption",
    "overline",
  ],
};

const ColorTemplate: Story<TypographyStoryProps> = (args) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
    }}
  >
    Temp Note: Text color will be preset based on the background color
    (inherited from theme) unless it is overriden. We currently support the
    following override variants - these are the default material-ui typography
    color variants:
    <Box
      sx={{
        bgcolor: `${lightTheme.palette.background.default}`,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        p: 2,
        mb: 1,
      }}
    >
      <Typography {...args} sx={{ m: 0 }} content={`Default background`} />
      {args.variants.map((variant) => (
        <Typography
          {...args}
          sx={{ m: 0 }}
          color={variant as TypographyColor}
          content={`${variant}`}
        />
      ))}
    </Box>
    <Box
      sx={{
        bgcolor: `${lightTheme.palette.primary.main}`,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        p: 2,
        mb: 1,
      }}
    >
      <Typography {...args} sx={{ m: 0 }} content={`Primary background`} />
      {args.variants.map((variant) => (
        <Typography
          {...args}
          sx={{ m: 0 }}
          color={variant as TypographyColor}
          content={`${variant}`}
        />
      ))}
    </Box>
    <Box
      sx={{
        bgcolor: `${lightTheme.palette.secondary.main}`,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        p: 2,
        mb: 1,
      }}
    >
      <Typography {...args} sx={{ m: 0 }} content={`Secondary background`} />
      {args.variants.map((variant) => (
        <Typography
          {...args}
          sx={{ m: 0 }}
          color={variant as TypographyColor}
          content={`${variant}`}
        />
      ))}
    </Box>
    <Box
      sx={{
        bgcolor: `${lightTheme.palette.surface.main}`,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        p: 2,
        mb: 1,
      }}
    >
      <Typography {...args} sx={{ m: 0 }} content={`Surface background`} />
      {args.variants.map((variant) => (
        <Typography
          {...args}
          sx={{ m: 0 }}
          color={variant as TypographyColor}
          content={`${variant}`}
        />
      ))}
    </Box>
    <Box
      sx={{
        bgcolor: `${lightTheme.palette.error.main}`,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        p: 2,
        mb: 1,
      }}
    >
      <Typography {...args} sx={{ m: 0 }} content={`Error background`} />
      {args.variants.map((variant) => (
        <Typography
          {...args}
          sx={{ m: 0 }}
          color={variant as TypographyColor}
          content={`${variant}`}
        />
      ))}
    </Box>
  </div>
);

export const Colors = ColorTemplate.bind({});
Colors.args = {
  variants: ["primary", "secondary", "error", "warning", "info", "success"],
};

const AlignmentTemplate: Story<TypographyStoryProps> = (args) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
    }}
  >
    {args.variants.map((variant) => (
      <Typography
        {...args}
        align={variant as TypographyAlign}
        content={`${variant}`}
      />
    ))}
  </div>
);

export const Alignment = AlignmentTemplate.bind({});
Alignment.args = {
  variants: ["left", "center", "right"],
};

export default TypographyDemo as Meta;
