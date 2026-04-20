# Feature Specification: Hero Carousel - Player Journal Removal

**Feature Branch**: `cameronwalsh/coa-68-hero-carousel-player-journal-removal`  
**Created**: 2026-04-20  
**Status**: READY_FOR_DEV  
**Source**: COA-68 (Linear)  
**Priority**: High  
**Input**: Linear issue description: "remove the player journal from the hero images"

## Summary

Remove the `player_journal` image from the hero carousel.

## Scope

- Update the hero carousel content so the `player_journal` image is no longer shown in the hero images.
- Keep the rest of the hero carousel behavior unchanged.
- Make sure the hero section still renders correctly on desktop and mobile.

## Acceptance Criteria

1. The `player_journal` image no longer appears in the hero carousel images.
2. The hero carousel still loads and displays other images/content normally.
3. No layout breakage is introduced on common viewport sizes.

## Notes

- This spec is intentionally minimal because no attachment was provided in Linear.
- Implementation details should be confirmed during planning if needed.