Pitch: AI-Powered Journey Personalization
Author: Tataihono Nikora
Date Drafted: June 6, 2024

1. Problem
   Our goal to grow Next Steps creators from 2,500 to 25,000 is blocked by our current journey creation process. It is too manual and time-consuming for users to adapt existing templates to their specific needs. This friction prevents us from scaling effectively and hinders users from creating relevant, personalized content for their audiences.

As highlighted in our strategy discussions, users like Lucinda want to scale effective prayer journeys for campus ministries nationwide. This requires a tool that can effortlessly adapt a core template for different languages, contexts, and visual identities. Our current editor does not support this at scale. 2. Appetite
We'll dedicate one 4-week discovery cycle with a small team (e.g., one engineer, one designer).

The goal of this cycle is not to ship a production-ready feature, but to answer the key unknowns and build a functional proof-of-concept. This will validate the technical approach and user experience before we commit to a full production delivery cycle. 3. Success Metrics
We will consider the discovery cycle successful if we achieve the following outcomes:

Functional Prototype: We have a working prototype that can reliably identify and replace key variables (like name, date, location) in at least three distinct journey templates.
UX Recommendation: We have tested at least two different UI approaches for gathering user input (e.g., a chat interface vs. a dynamic form) and can provide a clear recommendation for the production build.
Production Plan: The team has produced a high-level technical plan for the production build cycle, including a more confident timeline and identified dependencies. 4. Solution
The core of the solution is an AI-assistant that intelligently guides a user through personalizing a journey template.

Here's the proposed user flow:

Template Selection: A user chooses a base template from our library.
AI Analysis: The AI assistant inspects the selected journey's content and structure. It identifies all the elements that require personalization, such as:
Organizational branding (e.g., [Church Name], [Ministry Name], logos).
Event details (e.g., [Event Date], [Location]).
Contact information (e.g., [Phone Number], [Email Address]).
Contextual imagery (e.g., photos of a specific city or campus).
Interactive Prompting: The assistant initiates a conversation with the user, asking specific questions to gather the required information. For example:
"What is the name of your church or organization?"
"Please provide a logo for your organization."
"What are the key details for your upcoming event (name, date, time, location)?"
Automated Customization: As the user provides answers, the AI applies these changes throughout the entire journey, rewriting text, replacing placeholder images, and updating all relevant fields.
Review and Refine: The user is presented with the customized journey in the editor, where they can make final tweaks before publishing.

This approach transforms journey creation from a manual editing task into a simple, guided conversation, drastically reducing the time and effort required.
Example Scenario
To make this more concrete, here's how we imagine it working:

Scenario: Maria, a campus leader, wants to create a welcome journey. She picks the "Campus Welcome" template. The AI immediately asks, "What's the name of your ministry and what university are you at?" She replies, "StudentLife at the University of Auckland." The AI then asks for a picture of a local landmark. She uploads a photo of the university's clock tower. In seconds, the AI presents a fully customized journey with her ministry's name and the local photo integrated throughout. 5. Rabbit Holes / Unknowns
This discovery cycle is specifically intended to explore these unknowns:

Variable Identification: How reliably can the AI identify all the personalizable variables within a journey template? We need to avoid building a brittle system that only works on rigidly structured templates.
Image Sourcing: Where do we source replacement images from? Do we use stock photo APIs, or ask the user to upload them? This needs to be defined.
User Interaction Model: What is the best way to interact with the user? A chatbot? A simple form? A series of prompts? We need to prototype the user experience to find what is most effective.
Over-fitting: We need to be careful not to design a solution that only works for one or two specific templates. The system should be flexible enough to handle a variety of journey types. 6. No-Goes / Out of Bounds
To keep this discovery cycle focused, we will explicitly not do the following:

Build a full production feature. The output of this cycle is a prototype and a plan, not a shipped product.
Create journeys from scratch. The scope is limited to personalizing existing templates. The AI will not be generating new journey structures or complex branching logic.
Build a standalone "AI-first" product. This work is an enhancement to the existing Next Steps admin.
Solve for every possible customization. We will focus on the most common and high-value personalization elements first (text, images, basic details). 7. References
This pitch builds upon the initial discovery work and foundational concepts laid out by Ziwei Liu in the original pitch document. It was further refined based on the strategic discussion and decisions captured in the Betting Table (June 5, 2024). Key individuals and takeaways that shaped this pitch include:

A clear preference for integrating AI into the existing Next Steps 2.0 product, a direction articulated by Aaron Thomson when presented with the two pathways by Ziwei Liu.
The high value placed on AI-powered template customization, a concept proposed by Vlad Mitkovsky as a more immediate and valuable improvement, which was strongly supported by Sway Ciaramello.
The consensus was to focus on customizing existing templates, which brought together the ideas of prompt-based generation (supported by Aaron Thomson and Sway Ciaramello) with template modification (proposed by Vlad Mitkovsky).
The technical boundaries of the solution were defined by Tataihono Nikora's assessment that the AI excels at structured customization but is not yet capable of creating complex features with branching logic, ensuring the project's scope remains feasible.
