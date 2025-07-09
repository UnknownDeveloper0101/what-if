NEW UI BRIEF — “What If?” Branching Story App
✅ THEME
Background: Pure black (#000).

Cards: Rounded rectangle boxes, semi-glow neon border (#1f1f1f to #333), subtle inner shadow.

Font: Clean sans-serif (like Inter, Space Grotesk, or Poppins).

Text color: Pure white (#fff) or subtle gray for body text.

Highlight Color: Single neon accent (#00FF7F or #00FFC6).

✅ LAYOUT
Grid-based layout, similar to the image:

Each “node” or “story piece” is a card.

Each card has:

Header: Section title or branch point.

Body: Story text, cleanly padded.

Action Buttons: Next choices, styled as matching mini-cards or pill buttons inside the parent card.

✅ MAIN ELEMENTS
1️⃣ Root Story Card
What it is:

First card in the grid, larger than the rest.

Shows the user’s original What If story.

Simple header: “Your What If”

Body: User’s story text.

Timeline input: Smaller input field inside this card.

Style:

Big bold heading.

Subtle subtitle “Timeline: [value]”.

2️⃣ AI Response Card
What it is:

Direct child of the Root.

Shows the AI’s generated story continuation.

Same card style: dark, rounded, soft neon border.

Inside:

Heading: “AI Response”

Body: Story text with good line spacing.

Subtext: “What happens next?”

3️⃣ Options Section
What it is:

Below the AI Response in the same card OR in child cards underneath it in the grid.

Each option = clickable mini card.

Shape: Square or pill.

Hover: Soft glow, slight scale-up.

Active click: Subtle animation (like Framer’s tap effect).

Fifth option:

“End This Branch” → same style, just a different label.

Custom Option: One extra card with a text input and submit icon inside — same card look, but interactive.

4️⃣ Branching Layout
When a user clicks an option:

A new card appears in the grid beside or below the current card.

The new card repeats: AI Response → Next Options → More mini-cards.

No lines — just cards flowing naturally in the grid, connected visually by order.

5️⃣ Visual Cohesion
Element	Details
Spacing:	Use equal padding between cards.
Glow:	Soft border or box-shadow for subtle neon glow.
On Hover:	Neon border intensifies slightly.
Transitions:	Use smooth transitions for hover, click.
Responsiveness:	Cards wrap into columns on bigger screens, stack on small screens.

✅ INTERACTIONS
When a choice is clicked:

Add the new AI response as a new card in the grid.

Smooth fade-in animation for the new card.

Scroll into view if necessary.

If “End Branch” → final card says:

🎭 “THE END — This branch is closed. Start a new one?”

✅ EXTRA TOUCH
Use the same icons style as your screenshot (simple line or outline icons for clarity).

If possible, make the neon color pulse very subtly on hover for the option cards.

Add a small breadcrumb label in each card: “Root”, “Choice 1”, “Choice 2”, etc., to track path depth.

✅ COMPONENT BREAKDOWN
Component	Description
StoryCard	Base card for any story chunk — accepts props for title, text, footer actions.
OptionsGrid	Flex/grid container for the choices mini-cards.
OptionCard	Single clickable option card.
CustomOptionCard	Special card with input + submit button.
EndBranchCard	Special card to close the path.

✅ API Data Flow
Each card knows its branchPath.

When clicking an OptionCard:

Send current branchPath + choice to Gemini.

Return new AI Response.

Render it as a new StoryCard next to the parent.

✅ DOs & DON’Ts
✅ DO	❌ DON’T
Use the same dark minimalist vibe everywhere	Use inconsistent colors or gradients
Keep cards consistent height/width where possible	Don’t cram too much text — use good line height
Use smooth hover/tap effects	No sharp, harsh animations

✅ STACK HINTS
Use CSS Modules or styled-components for scoped styling.

Use Framer Motion for fade/scale transitions on card enter/hover.

Flexbox or CSS Grid for the main container.

📌 Example Flow
pgsql
Copy
Edit
+-------------------------------------------------------+
| [ Your What If Card ]                                 |
|  “What if I’d talked to her…”                         |
|  [ Timeline: a year later ]                           |
+-------------------------------------------------------+
             |
             V
+-------------------------------------------------------+
| [ AI Response Card ]                                  |
|  “She appears at the coffee shop…”                    |
|  “What happens next?”                                 |
+-------------------------------------------------------+
             |
             V
+----------------+   +----------------+   +----------------+
| [ Option 1 ]   |   | [ Option 2 ]   |   | [ Option 3 ]   |
+----------------+   +----------------+   +----------------+
             |
             V
+----------------------------+
| [ Custom Option Card ]     |
| [ input + submit button ]  |
+----------------------------+
✅ END
This is the exact vibe:

Black + neon.

Cards = containers for every piece.

Same minimalism as your uploaded example.

