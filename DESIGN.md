---
name: tidemail
description: A warm, lightweight temporary-mail interface built with Animal-Island-UI.
colors:
  island-teal: "#19c8b9"
  paper: "#f8f8f0"
  warm-surface: "#f0e8d8"
  card-cream: "#f7f3df"
  input-cream: "#fffdf7"
  bark: "#794f27"
  muted-bark: "#9f927d"
  soft-border: "#e8e2d6"
typography:
  display:
    fontFamily: "Nunito, Noto Sans SC, -apple-system, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: "clamp(26px, 4vw, 36px)"
    fontWeight: 800
    lineHeight: 1.15
  section:
    fontFamily: "Nunito, Noto Sans SC, -apple-system, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: "18px"
    fontWeight: 800
  body:
    fontFamily: "Nunito, Noto Sans SC, -apple-system, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5715
  label:
    fontFamily: "Nunito, Noto Sans SC, -apple-system, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: "12px"
    fontWeight: 600
  title:
    fontFamily: "Nunito, Noto Sans SC, -apple-system, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: "20px"
    fontWeight: 800
rounded:
  logo: "8px"
  sm: "16px"
  md: "18px"
  card: "20px"
  lg: "24px"
  pill: "50px"
spacing:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.bark}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "45px"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.bark}"
    rounded: "{rounded.sm}"
    height: "32px"
  input:
    backgroundColor: "{colors.input-cream}"
    textColor: "{colors.bark}"
    rounded: "{rounded.pill}"
    height: "40px"
  card:
    backgroundColor: "{colors.card-cream}"
    textColor: "{colors.bark}"
    rounded: "{rounded.card}"
    padding: "16px 24px"
---

# Design System: tidemail

## Overview

**Creative North Star: "The Warm Island Post Office"**

tidemail pairs a private, temporary mailbox with the calm visual language of Animal-Island-UI. Warm paper surfaces, bark-brown text, rounded controls, and a restrained island-teal accent make the inbox feel approachable while keeping message actions easy to scan.

The interface favors familiar patterns over decoration: create an address, read and manage messages, then open secondary tasks in compact dialogs. The component library supplies the recurring shapes and states; project CSS handles page layout and responsive behavior.

**Key Characteristics:**

- Warm, low-glare paper and cream surfaces.
- Brown text with island teal for links, focus, and selected accents.
- Rounded controls and compact, readable inbox rows.
- A header selector offers system, light, and dark appearance; system is the default.

## Colors

The palette uses one clear teal accent against warm paper, cream, and brown neutrals.

### Primary

- **Island Teal** (`#19c8b9`): Links, focus rings, status icons, and selected accents.

### Neutral

- **Paper** (`#f8f8f0`): Main page and primary button surface.
- **Warm Surface** (`#f0e8d8`): Secondary panels, hover fills, and code examples.
- **Card Cream** (`#f7f3df`): Default Animal-Island-UI cards.
- **Input Cream** (`#fffdf7`): Input interiors.
- **Bark** (`#794f27`): Main text and primary button labels.
- **Muted Bark** (`#9f927d`): Supporting text and metadata.
- **Soft Border** (`#e8e2d6`): Dividers and quiet outlines.

**The Warm Contrast Rule.** Keep long-form text on warm, light surfaces; use teal as an accent, not as a large text field or page background.

### Dark theme

The dark palette is applied through Animal-Island-UI CSS variables when the root has `data-theme="dark"`:

- Page: `#191714`; secondary surfaces: `#28231d`.
- Main text: `#f2eadc`; secondary text: `#c4b9a7`.
- Primary teal: `#68d8ca`; light border: `#40382f`.
- Keep the same hierarchy and spacing as light mode; avoid pure-black panels.

The preference selector has three choices: **System default**, **Light**, and **Dark**. System default follows `prefers-color-scheme`; explicit choices persist in local storage.

## Typography

**Display Font:** Nunito (with Noto Sans SC and platform sans-serif fallbacks)
**Body Font:** Nunito and Noto Sans SC
**Label/Mono Font:** The body stack; code samples use a monospace fallback.

**Character:** Nunito gives short headings and controls a friendly, rounded voice. Noto Sans SC keeps Chinese text readable and consistent with Latin content.

### Hierarchy

- **Display** (800, 26–36px responsive range, line-height 1.15): The page name and primary product heading.
- **Section** (800, 18px): Wordmark and inbox title.
- **Title** (800, 20px): Site unlock and mailbox card headings.
- **Body** (500, 14px, line-height 1.5715): Instructions, message metadata, and documentation.
- **Label** (600, 12px): Compact controls, status, and supporting metadata.

**The Familiar Type Rule.** Keep interface text in the bundled Nunito/Noto Sans SC stack; reserve monospace for code examples only.

## Layout

The desktop shell uses a centered 1280px maximum width. The home page pairs a 280–340px mailbox panel with a flexible inbox and a 20px gap. At 820px the mailbox and inbox stack, the header switches to its mobile menu, and modal form rows become single-column. At 560px page gutters reduce to 14px and list actions wrap. Use an 8/12/16/24px spacing rhythm.

## Elevation & Depth

Cards rely on warm surface changes and quiet borders instead of large shadows. Animal-Island-UI supplies a small ambient shadow for ordinary controls and a short tactile offset shadow for primary and danger-primary actions; keep elevation limited to those interactive controls.

**The Tactile Action Rule.** Reserve visible depth for controls with a direct action; keep content cards flat and calm.

## Shapes

Cards use softly rounded 20px corners; compact buttons use a 16px radius, while full-size buttons and inputs use pill silhouettes. Partner marks in the footer use 8px image corners. Use at least 12px corners for interactive surfaces. Keep borders thin and warm; let the rounded modal variant carry the island character.

**The Rounded Control Rule.** Buttons and inputs stay pill-shaped; cards and message surfaces use generous rounded corners without decorative cutouts.

## Components

### Buttons

- **Shape:** Pill-shaped (50px) for full-size and primary actions; compact controls use a 16px radius.
- **Primary:** Warm paper, bark text, and a small offset shadow; use for creating, submitting, or confirming.
- **Secondary / Ghost:** Paper or transparent surface with bark text and a soft warm hover fill.
- **Hover / Focus:** Use the library’s gentle lift and teal focus ring; disabled actions reduce emphasis and stop responding.

### Cards / Containers

- **Corner Style:** Soft 20px corners.
- **Background:** Cream for content cards; warm surface for secondary panels.
- **Shadow Strategy:** Flat by default; see Elevation & Depth.
- **Internal Padding:** The library default is 16px 24px; compact inbox regions may use 12–18px.

### Inputs / Fields

- **Style:** Cream interior, brown text, pill-shaped wrapper, and a light tactile shadow.
- **Focus:** Visible teal focus outline.
- **Error / Disabled:** Keep library error and disabled states; do not express errors only through color.

### Navigation and preferences

- **Style:** A theme-aware header with text links, English/Simplified Chinese language selection, and a compact theme selector. On narrow screens, expose links and preference selectors through the menu button.

### Inbox Row

- **Style:** A full-width secondary button with sender and subject hierarchy, muted date and preview, and a two-line preview clamp. Keep checkbox and message-opening actions distinct.

## Do's and Don'ts

### Do:

- **Do** use Animal-Island-UI controls, cards, and the bundled design tokens for recurring UI.
- **Do** keep focus visible and preserve labels for icon-only actions.
- **Do** keep mail HTML inside its sandboxed detail frame.

### Don't:

- **Don't** use pure-black surfaces or a second icon set.
- **Don't** add large decorative shadows to cards or non-action content.
- **Don't** remove security checks or mailbox actions as part of a visual cleanup.
