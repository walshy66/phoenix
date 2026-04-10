export type ResourceType = 'pdf' | 'link' | 'video' | 'document';

export type ResourceAudience = 'coaching' | 'players' | 'managers';

export type CoachingCategory = 'Defence' | 'Offence' | 'Drills' | 'Fundamentals' | 'Game Plans' | 'Tools';

export type PlayerCategory = 'Nutrition' | 'Mental Skills' | 'Drills' | 'Rules' | 'Development';

export type AgeGroup = 'All Ages' | 'U8' | 'U10' | 'U12' | 'U14' | 'U16+';

export type ResourcePage = 'coaching_resources' | 'player_resources';

export interface Resource {
  id: string;
  title: string;
  description: string;
  audience: ResourceAudience;
  category: string;
  ageGroup: string;
  type: ResourceType;
  url: string;
  imageUrl?: string;
  dateAdded: string;
}

export interface FilterEvent {
  event_type: 'filter_applied' | 'filter_removed';
  page: ResourcePage;
  filter_category: 'category' | 'ageGroup';
  filter_value: string;
  timestamp: string;
  session_id?: string;
}

export interface BrokenLinkEvent {
  event_type: 'broken_link_detected';
  page: ResourcePage;
  resource_id: string;
  resource_url: string;
  http_status?: number;
  error_type?: string;
  timestamp: string;
  session_id?: string;
}
