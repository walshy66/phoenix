export interface ImageSubCard {
  id: string
  title: string
  description: string | null
  imageSrc: string
  imageAlt: string
  linkUrl: string | null
  linkLabel: string | null
}

export interface SeasonInfoCard {
  id: 'training' | 'uniforms' | 'clearances' | 'registration'
  label: string
  icon: string
  description: string
  modalTitle: string
  subCards: ImageSubCard[]
}

export const SEASON_INFO_CARDS: SeasonInfoCard[] = [
  {
    id: 'training',
    label: 'Training',
    icon: '🏀',
    description: 'Venues, times, and age groups for club training sessions.',
    modalTitle: 'Training Information',
    subCards: [],
  },
  {
    id: 'uniforms',
    label: 'Uniforms',
    icon: '👕',
    description: 'How to order, borrow, or buy second-hand team uniforms.',
    modalTitle: 'Uniform Information',
    subCards: [
      {
        id: 'uniform-how-to',
        title: 'How To Order',
        description: null,
        imageSrc: '/uploads/uniform_how_to_order.png',
        imageAlt: 'How to order your Bendigo Phoenix uniform',
        linkUrl: null,
        linkLabel: null,
      },
      {
        id: 'uniform-numbers',
        title: 'Numbers',
        description: null,
        imageSrc: '/uploads/uniform_numbers.png',
        imageAlt: 'Uniform number selection guide and allocation notes',
        linkUrl: null,
        linkLabel: null,
      },
      {
        id: 'uniform-loan',
        title: 'Loan Program',
        description: null,
        imageSrc: '/uploads/uniform_loan_program.png',
        imageAlt: 'Uniform loan program information for eligible families',
        linkUrl: null,
        linkLabel: null,
      },
      {
        id: 'uniform-2nd-hand',
        title: '2nd Hand',
        description: null,
        imageSrc: '/uploads/uniform_2nd_hand.png',
        imageAlt: 'Second-hand uniform availability and buying process',
        linkUrl: 'https://www.facebook.com/share/p/18Nvdb7fjm/',
        linkLabel: 'Open second-hand uniform Facebook post in a new tab',
      },
    ],
  },
  {
    id: 'clearances',
    label: 'Clearances',
    icon: '📋',
    description: 'Complete your clearance before the season starts.',
    modalTitle: 'Clearances',
    subCards: [
      {
        id: 'clearance-portal',
        title: 'Submit a Clearance',
        description: null,
        imageSrc: '/uploads/registration_clearance.png',
        imageAlt: 'Basketball Victoria clearance submission information',
        linkUrl: 'https://form.jotform.com/222288044427860',
        linkLabel: 'Open clearance portal in a new tab',
      },
    ],
  },
  {
    id: 'registration',
    label: 'Registration',
    icon: '📝',
    description: 'Register your player for the upcoming season.',
    modalTitle: 'Registration Information',
    subCards: [
      {
        id: 'registration-how-to',
        title: 'How To Register',
        description: null,
        imageSrc: '/uploads/registration_how_to.png',
        imageAlt: 'Step-by-step registration instructions for the season',
        linkUrl: null,
        linkLabel: null,
      },
      {
        id: 'registration-fees',
        title: 'Season Fees',
        description: null,
        imageSrc: '/uploads/registration_winter26_fees.png',
        imageAlt: 'Winter 2026 season fee schedule and payment details',
        linkUrl: null,
        linkLabel: null,
      },
      {
        id: 'registration-fee-breakdown',
        title: 'Fee Breakdown',
        description: null,
        imageSrc: '/uploads/registration_winter_fee_breakdown.png',
        imageAlt: 'Detailed winter season fee breakdown for registration',
        linkUrl: null,
        linkLabel: null,
      },
    ],
  },
]
