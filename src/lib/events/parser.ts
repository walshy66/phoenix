// Event parsing utility for events.md
// Simple frontmatter parser for markdown files with --- delimiters

import { Event } from './types';

// Parse events.md file content into array of Event objects
export function parseEvents(fileContent: string): Event[] {
  // Split by frontmatter delimiters (--- on its own line)
  // We want to split on --- that's on its own line, but keep the delimiter
  const blocks = fileContent.split(/(?:\r?\n)^---(?:\r?\n)/gm);

  // Filter out empty blocks and the first block if it's just front matter
  const eventBlocks = blocks
    .map(block => block.trim())
    .filter(block => block.length > 0 && block !== '---');

  const events: Event[] = [];

  for (const block of eventBlocks) {
    try {
      // Extract YAML frontmatter (everything between --- delimiters)
      // Each block should be a complete frontmatter block
      const frontmatterMatch = block.match(/^([\s\S]*?)(?:\n---|\s*$)/);
      if (!frontmatterMatch) continue;

      const yamlContent = frontmatterMatch[1].trim();
      if (!yamlContent) continue;

      // Simple YAML parsing for our specific format
      const event = parseYAML(yamlContent);

      // Validate required fields
      if (isValidEvent(event)) {
        events.push(event);
      }
    } catch (error) {
      // Log warning but continue parsing other events
      console.warn(`Warning: Skipping invalid event block:`, error);
      continue;
    }
  }

  return events;
}

// Simple YAML parser for our specific key-value format
function parseYAML(yaml: string): Partial<Event> {
  const event: Partial<Event> = {};

  yaml.split('\n').forEach(line => {
    const match = line.match(/^(\w+):\s*"?([^"]*)"?\s*$/);
    if (match) {
      const [, key, value] = match;
      // Convert string to appropriate type
      if (value === 'true' || value === 'false') {
        (event as any)[key] = value === 'true';
      } else if (!isNaN(Number(value)) && value !== '') {
        (event as any)[key] = Number(value);
      } else {
        (event as any)[key] = value;
      }
    }
  });

  return event as Event;
}

// Validate that event has all required fields with correct types
function isValidEvent(event: Partial<Event>): event is Event {
  const requiredFields: (keyof Event)[] = ['id', 'title', 'date', 'image', 'status'];

  for (const field of requiredFields) {
    if (!(field in event) || !event[field]) {
      console.warn(`Warning: Event missing required field "${field}"`, event);
      return false;
    }
  }

  // Validate date format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date)) {
    console.warn(`Warning: Event has invalid date format "${event.date}"`, event);
    return false;
  }

  // Validate status is either 'upcoming' or 'past'
  if (event.status !== 'upcoming' && event.status !== 'past') {
    console.warn(`Warning: Event has invalid status "${event.status}"`, event);
    return false;
  }

  return true;
}

// Alternative approach using Astro's built-in frontmatter parsing
// This would be used in Astro components directly:
// import { frontmatter } from 'astro:content';
// const events = await getCollection('events'); // if using content collection