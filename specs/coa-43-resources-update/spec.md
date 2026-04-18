# COA-43: Resources Page Spec

## Quick Summary
- **Content-agnostic**: YouTube, PNG/JPEG, GIF, PDF, external links
- **AND-logic filters**: Age, Category, Skill (independently)
- **Keyword search**: Cross title & description
- **6 sections**: Coaching Resources, Player Resources, Manager, Guides, Forms
- **Incomplete metadata OK**: Resources work with title+type only

## Resource Entity Schema
```json
{
  "id": "uuid",
  "title": "required string",
  "type": "youtube_link | image_png | image_jpeg | gif | pdf | external_link",
  "url": "for links only",
  "fileRef": "pointer to asset storage",
  "description": "optional",
  "section": "coaching_resources | player_resources | manager | guides | forms",
  "tags": {
    "age": ["U8", "U10", "U12", ...],
    "category": ["Defence", "Drills", ...],
    "skill": ["Ball Handling", "Footwork", ...]
  },
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}
```

## Filter Rules
- **Coaching Resources**: Age, Category (Defence, Drills, Offence, Plays, Tools), Skill
- **Player Resources**: Age, Category (Solo, Group, Offence, Defence, Drill), Skill
- **Manager/Guides/Forms**: No filters, alphabetical ordering only

## Filtering Algorithm
```
results = all_resources

if (ageFilters.length > 0)
  results = results.filter(r => r.tags.age has any selected age)
if (categoryFilters.length > 0)
  results = results.filter(r => r.tags.category has any selected category)
if (skillFilters.length > 0)
  results = results.filter(r => r.tags.skill has any selected skill)
  
if (keyword.length > 0)
  results = results.filter(r => title or description contains keyword)

sort by alphabetical or createdAt per section
```

## Handover Principle
- Data MUST be human-readable (JSON, YAML, CSV)
- Instructions copy-paste-able
- NO custom code to add resources
- Content addable iteratively post-launch
