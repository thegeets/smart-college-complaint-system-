/**
 * College Branding & Official Contact Configuration
 * 
 * Central configuration file for institution identity, logo mark, and official contact channels.
 * Official campus support desk operational schedule: Sunday through Friday (Nepal standard academic week).
 */

export const COLLEGE_CONFIG = {
  // Institutional Name & Identity (Consistent throughout the entire application)
  name: 'Soch College of IT, Pokhara',
  shortName: 'Soch College of IT',
  tagline: 'Complaint Management System',
  portalTitle: 'Complaint Management System',
  deskTitle: 'Complaint Management System',
  cellName: 'Student Support Cell',
  deskSubtitle: 'Complaint Management System',

  // Academic Program: Soch College of IT exclusively offers BSc CSIT
  program: 'BSc CSIT',

  // Logo Configuration (Official college logo)
  logo: {
    imageUrl: '/college-logo.png',
    altText: 'Soch College of IT, Pokhara - Official Logo',
    accessibleName: 'Soch College of IT Official Logo',
    useOriginalLogoMark: false,
    isTemporaryMark: false,
    temporaryMarkLabel: 'Official College Logo',
    replacementGuide: 'Official college logo asset stored in /public/college-logo.png and /src/assets/college-logo.png',
  },

  // Contact Channels & Unified Desk Hours
  contact: {
    email: 'info@sochcollege.edu.np',
    phone: '061-574096',
    campusAddress: 'Ranipauwa, Pokhara, Nepal',
    // Confirmed operational schedule: Sunday through Friday (standard Nepal college operating week)
    operatingDays: 'Sunday–Friday',
    operatingDaysNe: 'आइतबारदेखि शुक्रबार',
    officeHours: 'Sunday–Friday: 6:00 AM – 4:00 PM',
    officeHoursNe: 'आइतबारदेखि शुक्रबार: बिहान ६:०० देखि अपराह्न ४:०० बजेसम्म',
    // Unified institutional SLA commitment
    targetSlaPhrase: 'Target response within 24–48 hours',
    targetSlaPhraseNe: 'लक्षित सम्बोधन २४–४८ घण्टा भित्र',
  },

  isConfiguredWithOfficialDetails: true,
};

export default COLLEGE_CONFIG;
