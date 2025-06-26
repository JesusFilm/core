# NES-415: Spike - Build "Generate AI Description" Feature for Journey Templates

## 1. Overview

This document outlines the product and technical requirements for the `NES-415`
spike. The goal of this spike is to build the foundational workflow for our
AI-powered journey personalization feature. This involves creating a tool for
internal template authors to generate, review, and save an AI-friendly Markdown
description of a journey template. This ahead-of-time, human-in-the-loop process
is critical for ensuring the reliability and quality of the input that will
power the end-user personalization experience.

## 2. Problem Statement

To enable an AI to intelligently personalize a journey template, it requires a
clear, structured, and comprehensive understanding of that template's content,
themes, and structure. Our internal journey data format (a complex JSON object)
is not suitable for direct use in an AI prompt as it is token-heavy and lacks
semantic context.

We need a process to convert our journey templates into a high-quality,
AI-readable format. This process must be efficient for our template creators and
produce a reliable, consistent output that can be used by downstream AI
services.

## 3. Requirements

### Functional Requirements

1.  **UI Control:**

    - A "Generate AI Description" button shall be added to the journey editor
      interface.
    - This button's visibility shall be restricted to users with
      template-authoring permissions.

2.  **AI Generation Workflow:**

    - On clicking the button, an API call is made to a backend service.
    - This service takes the full JSON representation of the current journey as
      input.
    - It uses a specifically engineered prompt to instruct an LLM (Large
      Language Model) to generate a Markdown description of the journey.
    - The generated Markdown must be returned to the frontend.

3.  **Review and Approval Workflow:**

    - The returned Markdown from the AI shall be displayed to the template
      author in a modal dialog containing a text editor.
    - The author must be able to review and edit the generated Markdown directly
      within this modal.
    - A "Save" button shall be present in the modal.

4.  **Data Storage:**
    - Upon clicking "Save," the approved (and potentially edited) Markdown
      content shall be persisted.
    - This content will be saved to a new field on the Journey record, named
      `description` or a similar appropriate name.

### Non-Functional Requirements

1.  **Performance:** The AI generation process should be reasonably fast,
    providing feedback to the user within a few seconds. A loading indicator
    should be displayed while the AI is processing.
2.  **Reliability:** The AI prompt must be engineered to produce a consistent
    and useful structure in its output across different types of journeys.
3.  **Security:** The feature must adhere to existing permission models. Only
    authorized users should be able to see the button and trigger the workflow.

## 4. Design & UX Specifications

- **Button:** The "Generate AI Description" button should be placed in a logical
  location within the journey editor's settings or action bar, where other
  template-level actions reside.
- **Modal:** The review modal should be large enough to comfortably display and
  edit a significant amount of Markdown text. It should clearly label the
  content as "AI-Generated Description" and provide instructions for the user to
  "review, edit, and approve."
- **Editor:** The text area within the modal should support basic text editing.
  Full Markdown preview is not required for this spike, but the field should be
  a multi-line text area.

## 5. Technical Considerations

### Implementation Architecture

The proposed implementation will leverage our existing Next.js and GraphQL
architecture:

1.  **AI Interaction in Next.js**:

    - The `journeys-admin` Next.js application will be responsible for handling
      the interaction with the LLM.
    - A new API route (e.g., `/api/generate-ai-description`) will be created
      within the `journeys-admin` project.
    - This API route will utilize the **Vercel AI SDK** to manage the
      communication with the LLM service. Using the SDK is recommended to handle
      streaming responses, providing a better user experience.
    - The frontend component will call this internal API route to fetch the
      generated Markdown. The request to this route will include the full
      journey object in its payload to prevent the API route from needing to
      fetch it again.

2.  **Data Persistence via GraphQL API**:

    - Once the user reviews and approves the Markdown, the `journeys-admin`
      frontend will execute a **GraphQL mutation** to persist the data.
    - This mutation will be sent to our **federated GraphQL API gateway**. The
      gateway will route the request to the appropriate service (`api-journeys`)
      that owns the Journey data model.
    - This follows our standard pattern of a unified GraphQL schema.
    - The `api-journeys` service will require a modification to its data model
      and GraphQL schema to add the new `description` field to the `Journey`
      type and to expose a new mutation for updating it.

### Error Handling

The implementation should gracefully handle potential failure modes in the AI
interaction:

1.  **API Call Fails:** If the call to the Next.js API route
    (`/api/generate-ai-description`) fails due to a network error or a
    server-side issue, the frontend should display a clear and user-friendly
    error message (e.g., "Failed to generate description. Please try again.").
2.  **AI Returns an Error or Gibberish:** If the LLM service returns an error or
    malformed/unusable content, the Next.js API route should catch this and
    respond to the frontend with a specific error status. The frontend should,
    again, show a user-friendly message, perhaps suggesting they try again or
    that the journey is too complex.
3.  **Content Moderation:** The Vercel AI SDK has built-in helpers for some
    content moderation. We should ensure any response that is flagged as
    inappropriate is handled gracefully and not displayed to the user. A generic
    error message should be shown in this case.

### Prompt Engineering

- The core of this spike is the system prompt. It needs to be carefully
  engineered to guide the LLM.
- The prompt should instruct the AI to act as an expert content analyst.
- It must request a specific output format, including:
  - A high-level summary of the journey's purpose and theme.
  - A step-by-step breakdown of the journey flow.
  - Clear identification of placeholder values that are intended for
    personalization (e.g., `[Church Name]`, `[Event Date]`).
- We should experiment with providing a "one-shot" or "few-shot" example in the
  prompt to improve the reliability of the output format.

### Testing Strategy

- The workflow must be tested with at least three distinct journey templates to
  validate the quality and consistency of the generated Markdown. The test
  templates should include:
  1.  A simple welcome journey.
  2.  A journey with multiple steps and different block types (video, text,
      form).
  3.  A journey with more complex themes or branching logic, if applicable.
- The primary success metric for this spike is the quality of the generated
  Markdown. It must be deemed useful and sufficient for the next stage of the
  project (`NES-416`).

## 6. Success Metrics

This spike will be considered successful when:

1.  A template author can successfully generate, review, and save a Markdown
    description for a journey template.
2.  The engineering team agrees that the quality of the AI-generated Markdown is
    a reliable and sufficient input for the subsequent task of identifying
    personalization variables.
3.  The entire workflow is functional and has been demonstrated on at least
    three different templates.
