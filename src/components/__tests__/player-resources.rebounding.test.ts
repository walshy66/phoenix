import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const readJson = (path: string) => JSON.parse(readFileSync(resolve(process.cwd(), path), 'utf-8'));

describe('player resources rebounding card', () => {
  test('adds the Facebook reel with all age groups and rebounding chip filter', () => {
    const resources = readJson('src/data/player-resources.json');
    const resource = resources.find((item: { id: string }) => item.id === 'player-016');

    expect(resource).toBeTruthy();
    expect(resource.title).toBe('Rebounding Example');
    expect(resource.url).toBe('https://www.facebook.com/reel/2437039610059944');
    expect(resource.tags.age).toEqual(['U8', 'U10', 'U12', 'U14', 'U16+']);
    expect(resource.tags.skill).toEqual(['Rebounding']);
  });
});
