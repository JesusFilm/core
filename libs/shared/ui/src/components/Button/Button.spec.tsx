import { render } from "@testing-library/react";
import { Button, ButtonProps } from ".";
import {
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  IconColor,
  IconName,
  IconSize,
} from "../../../__generated__/globalTypes";

const block: ButtonProps = {
  __typename: "ButtonBlock",
  id: "button",
  parentBlockId: "question",
  label: "This is a button",
  variant: ButtonVariant.contained,
  color: ButtonColor.primary,
  size: ButtonSize.small,
  startIcon: null,
  endIcon: null,
  action: null,
};

describe("Button", () => {
  it("should render the button successfully", () => {
    const { getByText, getByTestId } = render(<Button {...block} />);
    expect(getByText("This is a button")).toBeTruthy();
    expect(getByTestId("ButtonComponent")).toBeTruthy();
  });

  it("should render the correct icon", () => {
    const { getByTestId } = render(
      <Button
        {...block}
        startIcon={{
          __typename: "Icon",
          name: IconName.CheckCircle,
          color: IconColor.primary,
          size: IconSize.l,
        }}
      />
    );
    expect(getByTestId("CheckCircleIcon")).toBeTruthy();
  });
});
