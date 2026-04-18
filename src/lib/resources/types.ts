export type ResourceSection = 'coaching_resources' | 'player_resources' | 'manager' | 'guides' | 'forms';

export type ResourceType =
  | 'youtube_link'
  | 'image_png'
  | 'image_jpeg'
  | 'gif'
  | 'pdf'
  | 'document'
  | 'external_link';

export type ResourceAge = 'U8' | 'U10' | 'U12' | 'U14' | 'U16+';

export type CoachingCategory = 'Defence' | 'Drills' | 'Offence' | 'Plays' | 'Tools';
export type PlayerCategory = 'Solo' | 'Group' | 'Offence' | 'Defence' | 'Drill';
export type ResourceCategory = CoachingCategory | PlayerCategory | string;

export interface ResourceTags {
  age?: string[];
  category?: string[];
  skill?: string[];
}

export interface Resource {
  id: string;
  title: string;
  description?: string;
  section: ResourceSection;
  type: ResourceType;
  url?: string;
  fileRef?: string;
  tags?: ResourceTags;
  createdAt: string;
  updatedAt: string;
  sourceDomain?: string;
}

export interface ActiveFilters {
  age: string[];
  category: string[];
  skill: string[];
}

export interface FilterEvent {
  event_type: 'filter_applied' | 'filter_removed';
  page: ResourceSection;
  filter_category: 'category' | 'age' | 'skill';
  filter_value: string;
  timestamp: string;
  session_id?: string;
}

export interface BrokenLinkEvent {
  event_type: 'broken_link_detected';
  page: ResourceSection;
  resource_id: string;
  resource_url: string;
  http_status?: number;
  error_type?: string;
  timestamp: string;
  session_id?: string;
}
