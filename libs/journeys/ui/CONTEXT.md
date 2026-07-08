# Journeys UI (shared kernel)

The shared vocabulary of journey rendering and editing: the block tree model, the components that render it, playback navigation state, action handling, editor selection/undo state, and the template-gallery and search surfaces. Consumed by the Journeys Viewer, Journeys Admin, and Resources contexts; owns no entities — Journey/Block/Action are the Journeys context's — but it *is* the owner of the client-side terms below.

## Language

### Block model & rendering

**Tree Block**:
A block in its nested, renderable form — the block plus its `children`, recursively. The Transformer builds Tree Blocks from the flat block list the API returns; everything downstream (rendering, playback, editing) speaks Tree Blocks.
_Avoid_: node, nested block

**Transformer**:
The function that turns the flat block list (keyed by parent id and order) into the tree of Step Blocks. Its output contains only top-level Steps; orphaned or unordered blocks (`parentOrder: null`) are never rendered.

**Block Renderer**:
The single dispatch point that renders any Tree Block by its typename, applying the caller's Wrappers. There is one renderer for all surfaces; the surfaces differ only in the Wrappers they inject.

**Wrapper**:
A per-block-type injection point on the Block Renderer that lets a consuming surface decorate rendering without forking it — the viewer wraps videos for event capture, the admin wraps everything for selection and drag-and-drop. The mechanism by which one component set serves both playback and editing.
_Avoid_: HOC, decorator

**Step / Card**:
A **Step** is the navigable page unit of playback — what block history tracks and navigation moves between. A **Card** is the single content-holding child inside a Step. Users see "cards"; the model navigates Steps. Say which you mean.
_Avoid_: page, screen, slide (a Slide is an editor panel — see traps)

**Action Block**:
A block that can carry an Action (button, radio option, sign-up, video). Only Action Blocks participate in goal/target analysis.

### Playback (viewer-side)

**Block History**:
The stack of visited Steps that *is* the playback position: navigating forward pushes a Step, back pops one. The **Active Block** is the top of the stack. Lives only on the device.
_Avoid_: navigation history, route history (no router involved)

**Next Active Block**:
The forward-navigation act: push a named Step, or the Active Block's designated next Step, onto Block History.

**Action Handling**:
The single switch that executes a block's Action on the audience device — navigate to a Step, open a link (internal journey hosts get client routing), email, phone/SMS, or chat handoff. All click-side behavior funnels through it.

**Event Mutations**:
The Journey Analytics events this lib originates during playback — step view/next/previous, button click, question submissions, chat open, and the video lifecycle set — mirrored to Plausible via the plausible helpers' key encoding.

### Journey context & render modes

**Variant (render mode)**:
The mode a journey is being shown in, carried by the Journey Provider: `default` (audience playback), `admin` (inside the editor), `embed`, or `customize`. Component behavior forks on it. Sharply distinct from the media context's **Variant** (a language rendition) and from block style variants — on this surface, qualify the word.
_Avoid_: bare "variant" in cross-context discussion; say "render mode"

**Website Mode**:
A journey-level boolean rendering the journey as a multi-page website rather than a linear funnel. Orthogonal to the render mode Variant.

**Journey Customization**:
The template feature where placeholder fields in text are resolved per-adopter (with AI-assisted translation of their descriptions). A `customize` render mode exists for editing them.

### Editor state (admin-side)

**Editor Provider**:
The admin's selection-and-focus state over the journey being edited: the selected Step and Block, the Active Content area (Canvas / Social / Goals), the Active Slide, the open details drawer, hovered step, and Analytics Mode's data.

**Slide**:
An editor panel position — Journey Flow, Content, or Drawer — that the editor UI slides between. Purely an editing-surface term; never a Step, Card, or presentation slide.

**Command**:
One undoable editing operation, holding its execute/undo/redo parameter sets. The Command Provider keeps the command stack and index; consecutive commands with the same id coalesce into one undo unit.
_Avoid_: mutation (a Command wraps its mutations), action (collides with block Actions)

**Selected Step Id (pre-existence selection)**:
Selecting a Step by id before it exists in the editor's steps array — used so a just-created Step is selected the moment the create lands. Not merely "the id of the selected Step".

### Gallery & search (resources-side)

**Template Gallery components**:
The rendering of the Journeys context's Template Gallery (gallery page, sections, cards, template view) shared by Resources and the admin. The vocabulary (Template, Template Gallery Page) is upstream; this lib owns only the components.

**Search Providers**:
The Algolia InstantSearch wiring (search provider, search bar state, video hit typing) shared by the gallery and watch surfaces.

### Terminology traps

**Three tenants in one lib**:
Editor state and Commands are admin-only; Block History, Action Handling, and Event Mutations are viewer-only; the Template Gallery and Algolia pieces are resources-only. Shipping together does not make them one vocabulary — say which surface a term belongs to.

**Multiselect naming drift**:
The multiple-choice question block's typename is `MultiselectBlock`, but its single-choice sibling is `RadioQuestionBlock` and the component is `MultiselectQuestion`. The "Question" suffix is not reliable; go by typename.

**Content (overloaded)**:
`ActiveContent` is an editor area (Canvas/Social/Goals); "content" elsewhere means journey block content or gallery carousels. Qualify it.
