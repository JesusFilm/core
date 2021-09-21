import { Story, Meta } from "@storybook/react";
import { Box } from "@mui/system";

import { Typography, TypographyProps } from "../../components/Typography";
import { journeysConfig } from "../../libs/storybook/decorators";
import { lightTheme } from "../theme/theme";
import { PaletteOptions } from "@mui/material";

const TypographyDemo = {
  ...journeysConfig,
  component: Typography,
  title: "LightTheme",
};

interface TypographyStoryProps extends TypographyProps {
  variants: Array<keyof PaletteOptions>;
}

const ColorTemplate: Story<TypographyStoryProps> = (args) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
    }}
  >
    <p>Are we ignoring warning / info / success for now?</p>
    <p>
      Default text color for these backgrounds are black until I get
      confirmation on onPrimary, onSecondary, onSurface, onBackground is for
      text color.
    </p>
    <Box
      sx={{
        bgcolor: `${lightTheme.palette.background.default}`,
        border: `1px solid ${lightTheme.palette.text.secondary}`,
        mb: 2,
        p: 2,
      }}
    >
      <Typography
        {...args}
        sx={{ mb: 0 }}
        // color={lightTheme.palette[variant as Palette].contrastText}
        content={`Background`}
      />
    </Box>
    {args.variants.map((variant: keyof PaletteOptions) => (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <Box
          sx={{
            bgcolor: `${lightTheme.palette[variant].light}`,
            width: "100%",
            p: 2,
          }}
        >
          <Typography
            {...args}
            sx={{ mb: 0 }}
            // color={lightTheme.palette[variant as Palette].contrastText}
            content={`${variant} light`}
          />
        </Box>

        <Box
          sx={{
            bgcolor: `${lightTheme.palette[variant].main}`,
            width: "100%",
            p: 2,
          }}
        >
          <Typography
            {...args}
            sx={{ mb: 0 }}
            // color={lightTheme.palette[variant as Palette].contrastText}
            content={`${variant} main`}
          />
        </Box>

        <Box
          sx={{
            bgcolor: `${lightTheme.palette[variant].dark}`,
            width: "100%",
            p: 2,
          }}
        >
          <Typography
            {...args}
            sx={{ mb: 0 }}
            // color={lightTheme.palette[variant as Palette].contrastText}
            content={`${variant} dark`}
          />
        </Box>
      </div>
    ))}
  </div>
);

export const Colors = ColorTemplate.bind({});
Colors.args = {
  variants: [
    "primary",
    "secondary",
    "surface",
    "error",
    "warning",
    "info",
    "success",
  ],
};

export default TypographyDemo as Meta;
