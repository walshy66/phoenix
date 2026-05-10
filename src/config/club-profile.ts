export const clubProfile = {
  name: 'Bendigo Phoenix Basketball Club',
  legalName: 'Phoenix United Basketball Development Club Inc.',
  shortName: 'Bendigo Phoenix',
  teamPrefix: 'PHOENIX',
  tagline: 'Where Community Meets Competition',
  location: {
    city: 'Bendigo',
    region: 'Central Victoria',
    state: 'VIC',
  },
  contact: {
    generalEmail: 'hello@bendigophoenix.org.au',
    presidentEmail: 'president@bendigophoenix.org.au',
    treasurerEmail: 'treasurer@bendigophoenix.org.au',
    postalAddress: ['C/- Bendigo Stadium', 'Inglis Street', 'West Bendigo VIC 3550'],
  },
  socials: {
    facebook: {
      label: 'Facebook',
      url: 'https://facebook.com/phoenixunitedbasketball',
      handle: 'phoenixunitedbasketball',
    },
    instagram: {
      label: 'Instagram',
      url: 'https://instagram.com/bendigophoenix',
      handle: '@bendigophoenix',
    },
  },
  meta: {
    siteTitle: 'Bendigo Phoenix Basketball',
    defaultDescription: 'Bendigo Phoenix Basketball Club — Where Community Meets Competition',
    siteUrl: 'https://bendigophoenix.org.au',
  },
  venues: {
    home: {
      name: 'Bendigo Stadium',
      street: 'Inglis Street',
      suburb: 'West Bendigo',
      state: 'VIC',
      postcode: '3550',
    },
  },
} as const;

export function mailto(email: string, subject?: string) {
  const query = subject ? `?subject=${encodeURIComponent(subject).replace(/%20/g, '%20')}` : '';
  return `mailto:${email}${query}`;
}
