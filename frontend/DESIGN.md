# Learning Tracker — lavender workspace

The latest user reference replaces the prior flat blue settings design. Preserve the full-width single-sidebar application and all existing APIs. No backend edits.

Use a soft lavender application canvas, left navigation with white pill selection, a compact brand mark, and a rounded white main workspace containing its own breadcrumb header. Geist typography remains compact and readable, with 25–28px headings. Side navigation contains the real write/browse/settings actions and account footer only.

Journal browsing is a date-wise timeline. Cards sit beside the date in a responsive grid, with lavender, cream, mint and peach grounds and a white note inset. Month buttons filter the already loaded records; search retains the existing API request. Classic, Inbox, and Visual formats remain browser-local preferences.

GSAP owns workspace entrance, mounted card arrival, and selected-format preview feedback. Keep the sequence under half a second, leave default content visible, clean up contexts on unmount, and respect OS reduced motion plus the existing browser-local motion preference. Use no perpetual animations.

Settings previews are labeled sample entries and share the real journal content component. Journal metadata, author, images, edit/delete and authentication retain existing behavior. Keep dark mode and mobile navigation functional.

## Destructive actions
Use the shared ConfirmationProvider instead of browser confirm prompts for journal and image deletion. Native dialog supplies modal focus isolation; focus starts on Keep it and returns to the triggering control. Escape, close and backdrop dismiss safely. Edit and Delete use visible icon buttons with at least 36px height, distinct backgrounds and dark-mode colors. Existing delete API calls run only after confirmation.

## Custom themes and persistence
Full Black and Full White presets override the workspace, sidebar and journal-card palettes. Custom mode exposes eleven color tokens, corner radius and typeface. applyAppearance is the shared application path for live settings and startup/OS changes. Active settings are saved under lt_appearance; named custom palettes under lt_theme_library. Both use browser localStorage only. No backend endpoint or account/device sync was added. Named-theme save, apply, remove, color live preview and reload persistence were verified.

## Simplified theme selection

The user removed manual customization. Settings now offers only Pastel, Pure White, AMOLED Black, Nord, Dracula and System presets, plus existing card layout and motion controls. No color pickers, typeface/radius controls or named-theme library UI. Nord/Dracula use adapted official palettes. Legacy custom preferences safely fall back to Pastel; existing saved library data is not deleted. Settings still persist in browser localStorage only.
