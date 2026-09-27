# FoodSafe365 — Sprint 14: UX / Navigation Reset

## Purpose
Separate the three concepts that were becoming mixed in the supervisor experience:

1. **HACCP Controls** — the 7 HACCP principles and framework used underneath the product.
2. **Food Safety Checklist** — FSSAI-aligned operational controls for the restaurant.
3. **Daily / Focused Checks** — the actual operational workflow that records measurements and responses.

## New supervisor navigation

Home →
- Daily Checks
- Actions Centre
- Food Safety Checklist
- Temperature Controls
- HACCP Controls
- Records

The duplicate Home actions card was removed. “HACCP Plan” is renamed to “HACCP Controls”.

## HACCP Controls

The page now contains only:
- a simple explanation of HACCP
- the 7 principles
- the FoodSafe365 operational flow: Understand → Check → Correct → Verify → Record
- links to the separate Food Safety Checklist, Temperature Controls and Records pages

The FSSAI checklist and five temperature cards are intentionally **not** placed on this page.

## Food Safety Checklist

New route: `/checklist`

Contains the FSSAI-aligned operational groups:
- Premises & facilities
- Receiving & storage
- Food preparation
- Temperature controls
- People, pests & waste
- Records & review

These are explicitly described as operational controls and not automatically HACCP CCPs.

## Temperature Controls

New route: `/temperature-controls`

Five priority controls:
1. Storage
2. Cooking
3. Cooling
4. Thawing
5. Reheating

Each has a separate detail page under `/temperature-controls/[control]`.

## Focused checks

Selecting **Check Storage Now** (or another temperature control) opens `/checks?focus=<control>`.

The focused mode now shows **only the selected control** rather than the entire daily checklist. It is presented as a focused check and therefore uses **1 of 1**, not “1 of 3”.

The same existing server evaluation, corrective-action, verification and record flow is retained.

## Product principle

The supervisor should never have to decide whether a control is “FSSAI” or “HACCP”.

- FSSAI/reference requirements are maintained as source-backed control metadata.
- HACCP provides the framework underneath.
- The supervisor sees the operational task: **Check → Measure → Correct → Verify → Record**.

## Validation note

This package was assembled from the verified Sprint 13 fixed package. A fresh `npm install` / `npm run build` could not be completed in the build environment because dependency installation timed out. Please run the normal local verification commands on the Mac:

```bash
npm install
npm run typecheck
npm run build
npm run dev
```
