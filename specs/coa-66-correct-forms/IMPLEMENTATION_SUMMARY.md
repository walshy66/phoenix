# Implementation Summary — COA-66 Correct Forms

## What was implemented

### Forms data cleanup
- Replaced the 6 incorrect entries in `src/data/forms.json` with the 4 uploaded forms from the `upload/` folder.
- Kept the section alphabetically ordered by title:
  - Child Safety Concern Form
  - Coach Kit Sign Off Sheet
  - Refund Form
  - Reimbursement Form

### Asset handling
- Copied the uploaded files into `public/resources/club-policies/` so the Resources page can serve them directly:
  - `FORM_Child_Safety_Concern_Form_20260418.docx`
  - `FORM_CoachKit_SignOffSheet.pdf`
  - `FORM_Refund_03-2026.docx`
  - `FORM_Reimbursement_03-2026.docx`

### Schema / validation support
- Updated `src/lib/resources/types.ts` to support the new `document` resource type.
- Updated `scripts/validate-resources.js` so the new document resources validate correctly.

### Regression coverage
- Added `src/data/__tests__/forms.test.ts` to verify:
  - the forms list contains exactly 4 items
  - the titles are in alphabetical order

## Validation
- ✅ `npx vitest run src/data/__tests__/forms.test.ts`
- ✅ `npm run validate-resources`
- ✅ `npm run build`
- ⚠️ `npm test` still reports unrelated pre-existing failures in:
  - `src/components/__tests__/resource-merge.test.ts`
  - `src/lib/events/parser.test.ts`

## Result
The `/resources` Forms tab now shows only the 4 correct uploaded forms, in alphabetical order, with direct links to the uploaded documents.
