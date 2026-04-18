import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'src', 'data');
const PUBLIC_DIR = path.join(ROOT, 'public');
const SECTION_VALUES = new Set(['coaching_resources', 'player_resources', 'manager', 'guides', 'forms']);
const TYPE_VALUES = new Set(['youtube_link', 'image_png', 'image_jpeg', 'gif', 'pdf', 'document', 'external_link']);
const AGE_VALUES = new Set(['U8', 'U10', 'U12', 'U14', 'U16+']);

function filePathForAsset(assetPath) {
  if (!assetPath) return null;
  const normalized = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  return path.join(PUBLIC_DIR, normalized);
}

function validateResource(resource, fileName, index) {
  const errors = [];
  const prefix = `${fileName} [${index}]`;

  for (const field of ['id', 'title', 'section', 'type', 'createdAt', 'updatedAt']) {
    if (!resource[field]) errors.push(`${prefix}: missing required field '${field}'`);
  }

  if (resource.section && !SECTION_VALUES.has(resource.section)) {
    errors.push(`${prefix}: invalid section '${resource.section}'`);
  }

  if (resource.type && !TYPE_VALUES.has(resource.type)) {
    errors.push(`${prefix}: invalid type '${resource.type}'`);
  }

  if (resource.tags) {
    if (resource.tags.age && !Array.isArray(resource.tags.age)) {
      errors.push(`${prefix}: tags.age must be an array`);
    }
    if (resource.tags.category && !Array.isArray(resource.tags.category)) {
      errors.push(`${prefix}: tags.category must be an array`);
    }
    if (resource.tags.skill && !Array.isArray(resource.tags.skill)) {
      errors.push(`${prefix}: tags.skill must be an array`);
    }

    for (const [tagName, values] of Object.entries(resource.tags)) {
      if (!Array.isArray(values)) continue;
      for (const value of values) {
        if (typeof value !== 'string' || !value.trim()) {
          errors.push(`${prefix}: tags.${tagName} must contain only non-empty strings`);
        }
      }
    }

    if (resource.tags.age) {
      for (const age of resource.tags.age) {
        if (!AGE_VALUES.has(age)) {
          errors.push(`${prefix}: invalid age tag '${age}'`);
        }
      }
    }
  }

  const hasUrl = typeof resource.url === 'string' && resource.url.length > 0;
  const hasFileRef = typeof resource.fileRef === 'string' && resource.fileRef.length > 0;

  if (resource.type === 'youtube_link' || resource.type === 'external_link') {
    if (!hasUrl) errors.push(`${prefix}: type '${resource.type}' requires url`);
  }

  if ((resource.type === 'image_png' || resource.type === 'image_jpeg' || resource.type === 'gif' || resource.type === 'pdf') && !hasUrl && !hasFileRef) {
    errors.push(`${prefix}: type '${resource.type}' requires url or fileRef`);
  }

  for (const timestampField of ['createdAt', 'updatedAt']) {
    if (resource[timestampField] && Number.isNaN(Date.parse(resource[timestampField]))) {
      errors.push(`${prefix}: invalid ISO timestamp in ${timestampField}`);
    }
  }

  if (hasUrl && resource.url.startsWith('/') && resource.type !== 'youtube_link' && resource.type !== 'external_link') {
    const resolved = filePathForAsset(resource.url);
    if (resolved && !fs.existsSync(resolved)) {
      errors.push(`${prefix}: asset url not found at ${resource.url}`);
    }
  }

  if (hasFileRef) {
    const resolved = filePathForAsset(resource.fileRef);
    if (resolved && !fs.existsSync(resolved)) {
      errors.push(`${prefix}: fileRef not found at ${resource.fileRef}`);
    }
  }

  return errors;
}

function validateFile(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return 1;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(parsed)) {
      console.error(`Error loading ${fileName}: root JSON value must be an array`);
      return 1;
    }

    const ids = new Set();
    let errorCount = 0;
    for (const [index, resource] of parsed.entries()) {
      if (ids.has(resource.id)) {
        console.error(`${fileName} [${index}]: duplicate id '${resource.id}'`);
        errorCount += 1;
      }
      if (resource.id) ids.add(resource.id);
      const errors = validateResource(resource, fileName, index);
      for (const error of errors) console.error(error);
      errorCount += errors.length;
    }

    if (errorCount === 0) {
      console.log(`✓ ${fileName}: ${parsed.length} resources validated`);
      return 0;
    }

    console.error(`✗ ${fileName}: ${errorCount} validation issue(s)`);
    return 1;
  } catch (error) {
    console.error(`Error loading ${fileName}: ${error instanceof Error ? error.message : String(error)}`);
    return 1;
  }
}

const files = ['coaching-resources.json', 'player-resources.json', 'manager-resources.json', 'guides.json', 'forms.json'];
let failures = 0;
for (const file of files) {
  failures += validateFile(file);
}

if (failures === 0) {
  console.log('All resources valid.');
  process.exit(0);
}

process.exit(1);
