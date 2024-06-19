import useMediaQuery from "@mui/material/useMediaQuery";
import { fireEvent, render, screen } from "@testing-library/react";

import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveFab,
  ActiveSlide,
  EditorProvider,
  EditorState,
} from "@core/journeys/ui/EditorProvider";

import { TestEditorState } from "../../../../../libs/TestEditorState";
import { ThemeProvider } from "../../../../ThemeProvider";

import { SocialPreview } from ".";

jest.mock("@mui/material/useMediaQuery", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockUseMediaQuery = useMediaQuery as jest.MockedFunction<
  typeof useMediaQuery
>;

describe("SocialPreview", () => {
  beforeEach(() => {
    mockUseMediaQuery.mockImplementation(() => true);
  });

  it("should render Message Post and Fab for viewports larger than mobile", () => {
    render(
      <ThemeProvider>
        <SocialPreview />
      </ThemeProvider>
    );

    expect(screen.getByText("Social App View")).toBeInTheDocument();
    expect(screen.getByText("Messaging App View")).toBeInTheDocument();
  });

  it("should only render Message and Post for mobile viewport", () => {
    mockUseMediaQuery.mockImplementation(() => false);

    render(
      <ThemeProvider>
        <SocialPreview />
      </ThemeProvider>
    );

    expect(screen.getByText("Social App View")).toBeInTheDocument();
    expect(screen.getByText("Messaging App View")).toBeInTheDocument();
  });

  it("should dispatch active slide action on click", () => {
    const state: EditorState = {
      activeFab: ActiveFab.Add,
      activeSlide: ActiveSlide.JourneyFlow,
      activeContent: ActiveContent.Social,
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.AddBlock,
    };

    render(
      <EditorProvider initialState={state}>
        <ThemeProvider>
          <TestEditorState />
          <SocialPreview />
        </ThemeProvider>
      </EditorProvider>
    );

    expect(screen.getByText("activeSlide: 0")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("SocialPreview"));
    expect(screen.getByText("activeSlide: 1")).toBeInTheDocument();
  });
});
