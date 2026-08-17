import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

const page = readFileSync(resolve(process.cwd(), 'src/pages/resources/index.astro'), 'utf8');
const controller = readFileSync(resolve(process.cwd(), 'public/scripts/resources-page.js'), 'utf8');

describe('Club Policies resources tab', () => {
  test('renders after Forms and is handled by the client tab controller', () => {
    expect(page).toContain("label: 'Forms'");
    expect(page).toContain("label: 'Club Policies'");
    expect(page.indexOf("label: 'Club Policies'")).toBeGreaterThan(page.indexOf("label: 'Forms'"));
    expect(page).toContain('id="panel-policies"');
    expect(controller).toContain("'forms', 'policies'");
    expect(controller).toContain("return 'tab-policies';");
    expect(controller).toContain("return 'panel-policies';");
  });
});
