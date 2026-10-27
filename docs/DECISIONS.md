# Architecture Decision Records

- **ADR-001 (2026-10-21) SRS missing:** Workspace contained no SRS PDF. Proceeded on the commissioning prompt as interim baseline; SRS supersedes on arrival. *Deviation recorded, not silently assumed.*
- **ADR-002 Single Next.js app** with route groups `(public)/(auth)/(onboarding)/(marketplace)/(admin)`; split deployables later only if justified.
- **ADR-003 Authorisation ≠ authentication:** org-membership + `can_trade()` in RLS; no global `user.role`.
- **ADR-004 Money:** `numeric(19,4)` + ISO currency; floats forbidden for finance.
- **ADR-005 Honest data:** market/CMS content DB-backed; provider returns `unavailable` until a licensed source is configured. Demo data is never presented as live.
- **ADR-006 Brand tokens centralised** in `src/app/globals.css` (`--brand-blue #123B7A`, `--brand-red #DC2626`, white) — provisional per prompt, changeable in one place.
- **ADR-009 (2026-10-21) Official logo:** The owner-supplied transparent PNG (`public/brand/corgania-logo.png`, 1024×409) is the sole official logo, replacing the earlier JPGs (deleted). It renders large in every navbar (76px tall on desktop, 56–64px on mobile; header height raised to 96/80px). The icon mark (`corgania-mark.png`) was cropped from this same file for the hero and favicon (`src/app/icon.png`) — no redrawn or substitute artwork.
- **ADR-007 Payments:** schema records payment *state/documents* only. No gateway/escrow until an approved provider is contracted.
- **ADR-008 Stack versions:** Next.js 15.1 (patched upgrade to ≥15.5 noted for CVE-2025-66478), React 19, Tailwind v4 (CSS-first tokens), Supabase SSR package for cookie sessions.
