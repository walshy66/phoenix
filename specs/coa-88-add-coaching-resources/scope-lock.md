# Scope Lock — coa-88-add-coaching-resources

Locked scope for MVP:
- Add a "Basketball Positions & Responsibilities" resource card to both the player and coaching resources panels on `/resources`
- Open a modal carousel showing 6 static position responsibility images
- Support auto-advance every 8 seconds, prev/next buttons, arrow keys, Escape, backdrop close, Tab focus trap, and focus return
- Provide image-load fallback messaging and reduced-motion handling
- Add/commit the static image assets under `public/images/positions/` from the uploaded `roles_*.jpeg` files

Out of scope for MVP:
- Analytics logging
- Swipe gesture support
- Server-driven image loading or CMS integration
- Reworking the broader resource filter architecture
