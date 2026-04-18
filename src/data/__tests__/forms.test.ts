import { describe, expect, it } from 'vitest';
import forms from '../forms.json';

describe('forms resources', () => {
  it('contains exactly the four uploaded forms in alphabetical order', () => {
    expect(forms).toHaveLength(4);
    expect(forms.map((form) => form.title)).toEqual([
      'Child Safety Concern Form',
      'Coach Kit Sign Off Sheet',
      'Refund Form',
      'Reimbursement Form',
    ]);
  });
});
