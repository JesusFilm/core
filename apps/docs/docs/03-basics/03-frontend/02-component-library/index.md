# Component Libraries

For each Jesus Film project, [Material UI](https://mui.com/material-ui/getting-started/overview/) is used to build the component library. `mui` is the latest web component library following the [Material Design 2](https://m2.material.io/components?platform=web) design system.

UX refer to Material Design to understand usage guidelines whilst developers should refer to [Material UI](https://mui.com/material-ui/getting-started/supported-components/) to understand how to build and style components.

## Understanding the Component Hierarchy

Each component is built from other components, as we move across the tree - the component styling and functionality becomes more specific.

Simplified Input example:

![Component Hierarchy](./component-hierarchy.png)

The HTML `input` can take on multiple [types and attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input). Each successive input component uses a subset of these attributes and adds their own to create components for a narrower use case.

> For example
>
> - `Mui-InputBase` adds end adornment, hides all `input=checkbox` attributes and includes minimal styling.
> - `Mui-TextField` add labels, validation and form control.
>   <br />

Compare and contrast properties on [HTML input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input), [Mui-InputBase](https://mui.com/material-ui/api/input-base/) and [Mui-TextField](https://mui.com/material-ui/api/text-field/#advanced-configuration) to see more.

### Mui components

Usually only the highest level `mui` components (eg `TextField`) are recommended for use. See full list [here](https://mui.com/material-ui/).

All Material UI components will be themed with the `mui` [default theme](https://mui.com/material-ui/customization/default-theme/).

Since we reuse these high level `mui` components to build many different components, these are known as **common** components.

### Our components

We need the Mui components to look and/or function differently to the default. We apply multiple different strategies for each use case.

For styling & function changes for **all** components, we override the `mui` default theme with different themes.
See more on project theming [here](../03-theming/index.md).

For all other use cases:

![Other components](./other-components.png)

#### This results in the following project structure:<br/>

**Applications**

- Contain application specific components
  - [journeys](https://storybook.core.jesusfilm.org/?path=/story/journeys-conductor--default)
  - [journeys-admin](https://storybook.core.jesusfilm.org/?path=/story/journeys-admin-editor--default)
  - [watch](https://storybook.core.jesusfilm.org/?path=/story/watch-pagewrapper--default)

**UI Libraries**

- [journey-ui](https://storybook.core.jesusfilm.org/?path=/story/journeys-ui-card--default): common components used in `journeys` & `journeys-admin`
- [shared-ui](https://storybook.core.jesusfilm.org/?path=/story/shared-ui-dialog--basic): common components used in all app projects

**Themes**

- [base](https://storybook.core.jesusfilm.org/?path=/story/default-theme): default theme for Next Steps. Includes project specific styles for journeys.
- [website](https://storybook.core.jesusfilm.org/?path=/story/website-theme): project theme for Jesus Film Project websites
- [admin](https://storybook.core.jesusfilm.org/?path=/story/admin-theme): project theme for admin projects.

This common implementation pattern is derived from the [Atomic Web Design](https://bradfrost.com/blog/post/atomic-web-design/) approach

## Component Types

In our monorepo we can categorize all the components we create into **common** and **regular** components, of which there are several types:

**Common components**<br/>
Any component intended for reuse in multiple different components. This includes:

- Some unique component made from multiple components like
  > For example [journeys-admin Button](https://storybook.core.jesusfilm.org/?path=/story/journeys-admin-editor-controlpanel-button--default) is made from Mui-Box, Mui-Typography and Mui-Stack amongst others.
- An extension of a component.
  > For example [journeys-ui TextField](https://storybook.core.jesusfilm.org/?path=/story/journeys-ui-textfield--states) uses the `filled` variant of [Mui-TextField](https://mui.com/material-ui/react-text-field/#form-props) and adapts it to work with formik - a form management library.
- An instance of a component

  > For example [Attribute](https://storybook.core.jesusfilm.org/?path=/story/journeys-admin-editor-controlpanel-attributes-attribute--default) is a version of [journeys-admin Button](https://storybook.core.jesusfilm.org/?path=/story/journeys-admin-editor-controlpanel-button--default) which sets the `selected` and `onClick` logic.

  ![Component Hierarchy](./component-types.png)

**Regular components**<br/>
Unique components only used in one other component / page. Similarly they are created by:

- Unique components made from multiple components
  > See [watch Header](https://storybook.core.jesusfilm.org/?path=/story/watch-header--default)
- Extending a component
  > See [ShareDialog](https://storybook.core.jesusfilm.org/?path=/story/watch-sharedialog--basic) (extended from shared-ui [Dialog](https://storybook.core.jesusfilm.org/?path=/story/shared-ui-dialog--info))
- An instance of a component

  > See [RadioOptionAttribute](https://storybook.core.jesusfilm.org/?path=/story/journeys-admin-editor-controlpanel-attributes-radiooption--filled) (instance of [Attribute](https://storybook.core.jesusfilm.org/?path=/story/journeys-admin-editor-controlpanel-attributes-attribute--default))

[Visual tests](../04-storybook/index.md#when-to-write-stories) differ based on component type.
<br/>

## FAQs

#### **Can I use whatever components I want as long as I make it look like the design?**

No! Each component is designed for a different use case and will have accessibility labels and [theming built in](https://bareynol.github.io/mui-theme-creator/#TextField).
Using arbitrary components just based on look can result in:

- Fundamental [landmark roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/roles/landmark_role) being misapplied or not applied
- Poor user experience for those needing screen-readers or other assistive technology
- Styling of components breaking when we change our theme
- Adding unnecessary styling complexity to each component, increasing the maintenance burden
- Future updates to components risk breaking behaviour (especially for less stable common component libraries you may create or work with)
  <br/><br/>

#### **What if I need both the default mui component and a jfp component with the same name, in the same file?**

Prepend **Mui** to the `mui` component and import like so:

```
import MuiTextField from '@mui/material/TextField'
import TextField from "../components/TextField'
```
