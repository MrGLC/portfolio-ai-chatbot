**CREATE DESIGN SYSTEM JSON**

UI TO ANALYZE: $ARGUMENS

**GOAL**
Your goal is to extract a generalized and reusable design system from the screenshot  provided in `$ARGUMENTS` **without including specific image content**, so that frontend developers or AI agents can reference the JSON as a style foundation for building consistent UIs.

**TASK**

1. Analyze the screenshots provided in `$ARGUMENTS` to infer:
    - Color palette
    - Typography rules
    - Spacing guidelines
    - Layoutstructure (grids,cards, containes, etc.)
    - UI components (buttons, inputs, tables,etc.)
    - Border radius, shadows, and other visual styling patterns.
2. Create a `design-system.json` file that clearly defines these rules and can be used to replicate the visual language in a consistent way.
3. Output the JOSN to the `prd` folder with the name: `design-system.json`

**Constraints** 
- Do **not** extract specific content from the screenshot (no text, logos, icons.)
- Focus purely on *design principles*, *structure*, and *styles*.