# Scope Lock — COA-43 Resources Update

## Locked Scope
- AND-logic filtering across Age, Category, and Skill.
- Keyword search across resource title and description.
- Dynamic skill options derived from available resources in the active section.
- Support for `youtube_link`, `image_png`, `image_jpeg`, `gif`, `pdf`, and `external_link`.
- Five visible sections: Coaching Resources, Player Resources, Manager Resources, Guides, and Forms.
- Manager, Guides, and Forms remain alphabetical and filter-free.
- Graceful rendering for incomplete metadata.
- Accessible search, filter buttons, aria-pressed state, and live result counts.

## Out of Scope
- Persistent filter state between page loads.
- Backend/database storage.
- URL query-param syncing.
- Fuzzy search or typo correction.
- New third-party dependencies.

## Notes
- Data remains human-editable JSON in `src/data/`.
- Forms content is static and display-only.
