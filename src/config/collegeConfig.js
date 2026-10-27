/**
 * College Branding & Official Contact Configuration
 * 
 * Central configuration file for institution identity, logo mark, and official contact channels.
 * To update branding or replace the placeholder logo, edit the fields below.
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

  // Logo Configuration (Replaceable placeholder mark)
  logo: {
    imageUrl: null,
    altText: 'Soch College of IT, Pokhara - Logo Placeholder (Replaceable)',
    accessibleName: 'Soch College of IT Logo Placeholder',
    useOriginalLogoMark: true,
    isTemporaryMark: true,
    temporaryMarkLabel: 'Replaceable Logo Placeholder',
    replacementGuide: 'To replace with the official college logo: place your logo image in /public or /src/assets and set imageUrl in src/config/collegeConfig.js',
  },

  // Contact Channels
  contact: {
    email: 'info@sochcollege.edu.np',
    phone: '061-574096',
    campusAddress: 'Ranipauwa, Pokhara, Nepal',
    officeHours: 'Desk: Monday–Friday, 6:00 AM – 4:00 PM',
    officeHoursNe: 'सहायता कक्ष: सोमबारदेखि शुक्रबार, बिहान ६ बजेदेखि अपराह्न ४ बजेसम्म',
  },

  isConfiguredWithOfficialDetails: true,
};

export default COLLEGE_CONFIG;
