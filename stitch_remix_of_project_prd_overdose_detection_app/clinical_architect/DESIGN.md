```markdown
# Design System Document: The Clinical Architect

## 1. Overview & Creative North Star
**Creative North Star: "The Absolute Monolith"**

This design system rejects the "friendly" clutter of contemporary SaaS. It is built on the philosophy of **The Absolute Monolith**: an aesthetic that is unapologetically authoritative, surgically precise, and hyper-legible. We move beyond standard "Medical-Tech" tropes by embracing extreme high contrast and an editorial layout style that favors intentional asymmetry over rigid, predictable grids. 

The goal is to evoke the feeling of a high-end architectural blueprint or a precision medical instrument. We achieve this by utilizing "Oversized Functionalism"—where the scale of the typography and the vastness of the negative space do the heavy lifting, rendering borders and decorative shadows obsolete.

---

## 2. Colors & Tonal Architecture
The palette is rooted in a "Deep Navy and Stark White" binary. This creates a high-tension visual environment that demands attention.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. 
Structure is defined through:
- **Background Shifts:** Use `surface_container_low` (#f2f4f6) against a `surface` (#f7f9fb) background to define zones.
- **Negative Space:** Use the Spacing Scale (specifically tokens `16` and `20`) to create "voids" that act as invisible dividers.

### Surface Hierarchy & Nesting
Treat the UI as a series of precision-cut slabs. 
- **Base:** `surface` (#f7f9fb).
- **Secondary Zone:** `surface_container` (#eceef0).
- **Interactive Layers:** For floating elements, use `surface_container_lowest` (#ffffff) to create a "pop" against the off-white background.

### Signature Textures & Accents
- **The "Pulse" Accent:** `secondary` (#0042c8) is used exclusively for active states and critical paths.
- **The "Alert" Strike:** `on_tertiary_container` (#f04440) is reserved for life-critical data or system errors.
- **Glassmorphism:** For overlays, use `surface_container_lowest` at 80% opacity with a `20px` backdrop blur to maintain the "clinical" feel while adding modern depth.

---

## 3. Typography
Typography is the primary structural element of this system. We use **Manrope** for its geometric, technical precision in headers and **Inter** for its neutral, highly readable qualities in data-heavy contexts.

- **Display & Headline (Manrope):** These must be bold and oversized. `display-lg` (3.5rem) should be used for primary data points or section starters, creating an editorial "header-heavy" look.
- **Body & Labels (Inter):** Keep these tight and functional. Use `body-md` (0.875rem) for most technical descriptions to maximize the contrast between the massive headers and the refined data.
- **The Authority Gap:** We purposefully create a large size gap between `headline-lg` and `body-md`. This hierarchy signals to the user exactly what is a "Status" and what is "Detail."

---

## 4. Elevation & Depth
In a system without borders, depth must be "felt" rather than seen.

- **The Layering Principle:** Achieve lift by stacking tokens. A card using `surface_container_lowest` (Pure White) placed on a `surface_container_low` (Pale Grey) section creates a natural, sharp edge without a single pixel of stroke.
- **Ambient Shadows:** Standard drop shadows are forbidden. If an element must float (e.g., a critical modal), use a shadow with a 40px blur at 4% opacity using `on_surface` (#191c1e) as the tint. It should look like a soft atmospheric occlusion, not a "web shadow."
- **The "Ghost Border" Fallback:** In rare accessibility cases where a boundary is required (e.g., input fields), use `outline_variant` (#c4c6cf) at **15% opacity**. It must be barely perceptible.

---

## 5. Components

### Buttons
- **Primary:** Background `primary` (#000000), text `on_primary` (#ffffff). Rounding: `DEFAULT` (4px). Massive, blocky, and authoritative.
- **Secondary:** Background `secondary_container` (#0056ff), text `on_secondary` (#ffffff). Used for the "active" medical state.
- **States:** On hover, primary buttons should not lighten; they should shift to `primary_container` (#001b3d) for a deeper, more recessed feel.

### Input Fields
- **Styling:** No borders. Use `surface_container_high` (#e6e8ea) as a solid block background. 
- **Focus:** When active, the background remains, but a 2px `secondary` (#0042c8) "underline" or side-bar appears.

### Cards & Lists
- **Prohibition:** Divider lines are strictly banned. 
- **Separation:** Use `spacing-8` (2.75rem) to separate list items. For complex data lists, alternate backgrounds between `surface` and `surface_container_lowest` to create a "zebra-stripe" effect without lines.

### Medical Data "Monoliths" (Custom Component)
Large blocks containing a single metric (e.g., Heart Rate). Use `display-lg` for the value and `label-md` for the unit, tucked into the top-right corner of the block for an architectural, "blueprint" feel.

---

## 6. Do's and Don'ts

### Do
- **Do** embrace "asymmetric breathing room." If a layout feels too balanced, increase the padding on one side to create a more custom, editorial feel.
- **Do** use `on_secondary_fixed_variant` (#003ab2) for subtle hover states on interactive blue elements.
- **Do** ensure that the most important medical data point is at least 3x the size of the surrounding text.

### Don'ts
- **Don't** use 1px borders. If you feel you need one, use a background color change instead.
- **Don't** use rounded corners larger than `lg` (8px). This system is "blocky" and structural; circles or soft pills (except for status chips) break the clinical authority.
- **Don't** use icons unless absolutely necessary. Rely on Manrope's bold typography to communicate meaning first.
- **Don't** use "Soft Grey" for text. Use `on_surface` (#191c1e) for maximum high-contrast accessibility against the white/navy backgrounds.```