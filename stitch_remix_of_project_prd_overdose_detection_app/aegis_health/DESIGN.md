# Design System Specification: Medical Precision & High-Trust Editorial

## 1. Overview & Creative North Star: "The Clinical Architect"
Most medical applications feel like spreadsheets or cold, sterile forms. This design system rejects that "template" aesthetic in favor of **The Clinical Architect**. Our North Star is a high-end, editorial approach to healthcare data—combining the authoritative weight of a premium medical journal with the fluid, breathing room of a modern wellness retreat.

We move beyond "standard UI" by utilizing **intentional asymmetry** and **tonal layering**. Instead of boxing data into rigid containers, we use white space as a structural element. Information is staged on "sheets" of varying depth, moving the user’s eye through a narrative of health rather than a checklist of stats.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
Our palette is anchored in trust and clarity. We use a sophisticated hierarchy of Deep Navy and Clinical Blue to establish a sense of unwavering professional competence.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Traditional borders create visual noise that distracts from critical medical data. Boundaries must be defined solely through:
- **Background Shifts:** Placing a `surface-container-lowest` card on a `surface-container-low` background.
- **Tonal Transitions:** Using subtle shifts between `surface` (#f9f9f9) and `surface-variant` (#e2e2e2).

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. 
- **Base Layer:** `surface` (#f9f9f9) for the global background.
- **Section Layer:** `surface-container-low` (#f3f3f3) for secondary content areas.
- **Action Layer:** `surface-container-lowest` (#ffffff) for primary interactive cards. This creates a "soft lift" that feels premium and clean.

### Glass & Gradient (Signature Textures)
To avoid a flat, "out-of-the-box" feel, use **Glassmorphism** for floating elements (e.g., sticky headers or FABs) using semi-transparent `surface` colors with a `backdrop-blur` of 12px-20px. 
- **Main CTAs:** Use a subtle linear gradient from `primary` (#000666) to `primary-container` (#1a237e) to give buttons a "gem-like" professional polish.

---

## 3. Typography: The Editorial Scale
We use a dual-font strategy to balance high-tech precision with human readability.

*   **Display & Headlines (Manrope):** Chosen for its geometric clarity and modern "editorial" feel. It signals authority.
    *   `display-lg` (3.5rem): Used for primary health scores or hero data points.
    *   `headline-md` (1.75rem): Used for section starts to create a clear mental "anchor."
*   **Body & Labels (Inter):** Chosen for its exceptional legibility at small sizes, crucial for medical readings.
    *   `body-md` (0.875rem): The standard for all patient data and descriptions.
    *   `label-sm` (0.6875rem): Used for timestamps and metadata, always in `on-surface-variant` (#454652).

---

## 4. Elevation & Depth: Tonal Layering
In a medical context, shadows should never feel "heavy" or "dirty." We achieve hierarchy through **Tonal Layering** rather than structural lines.

*   **The Layering Principle:** Depth is achieved by stacking. Place a `surface-container-lowest` (#ffffff) card on a `surface-container-low` (#f3f3f3) section. This creates a natural, soft lift without the need for high-contrast shadows.
*   **Ambient Shadows:** If an element must "float" (e.g., a critical alert modal), use an ultra-diffused shadow: `box-shadow: 0 12px 32px rgba(26, 28, 28, 0.06);`. The shadow color is a tinted version of `on-surface` (#1a1c1c), mimicking natural light.
*   **The Ghost Border Fallback:** If a border is required for accessibility, use the `outline-variant` (#c6c5d4) at **15% opacity**. Never use 100% opaque borders.

---

## 5. Components: Precision & Clarity

### High-Readability Cards
*   **Style:** No borders. Background: `surface-container-lowest` (#ffffff).
*   **Corner Radius:** Use `xl` (0.75rem) for main cards; `lg` (0.5rem) for inner nested elements.
*   **Padding:** Always use `spacing-6` (1.5rem) to ensure data "breathes."

### Buttons (The Clinical CTA)
*   **Primary:** Gradient from `primary` to `primary-container`. Text: `on-primary` (#ffffff). Radius: `full`.
*   **Secondary:** Ghost style. No background, `outline-variant` ghost border (20% opacity). Text: `secondary` (#0061a4).

### Status Indicators & Critical Alerts
*   **Critical Status:** Use `error` (#ba1a1a) for icons. Use `tertiary-container` (#670008) as a soft background for alert bars to ensure the red doesn't feel "violent" but rather "urgent."
*   **Data Viz:** Charts should utilize `secondary` (#0061a4) for positive trends and `tertiary-fixed-dim` (#ffb3ac) for areas requiring attention.

### Input Fields
*   **Style:** Minimalist. No bottom line or full box. Use a subtle background fill of `surface-container-high` (#e8e8e8) with a `sm` (0.125rem) radius.
*   **Focus:** Transition the background to `secondary-fixed` (#d1e4ff).

---

## 6. Do's and Don'ts

### Do:
*   **Do** use `spacing-8` (2rem) and `spacing-10` (2.5rem) between major data sections to prevent cognitive overload.
*   **Do** use `on-surface-variant` (#454652) for secondary text to create a clear visual hierarchy against primary headings.
*   **Do** utilize **Asymmetric Layouts** (e.g., a large headline on the left with small metadata tucked in the top right) to break the "app template" feel.

### Don't:
*   **Don't** use 1px solid dividers between list items. Use `spacing-4` (1rem) of white space or a subtle shift to `surface-container-low`.
*   **Don't** use pure black (#000000) for text. Always use `on-surface` (#1a1c1c) to maintain a soft, premium feel.
*   **Don't** use "Alert Red" for decorative elements. It is reserved strictly for `error` states and critical patient data.