/**
 * Shared Demonstration Ticket Data
 * 
 * Reused consistently across the Hero Visual card and the Platform Showcase demonstration.
 * Technician, reference ID, category, priority, and SLA are completely synchronized.
 */

export const SAMPLE_TICKET = {
  reference: '#SCCS-2026-084',
  title: 'Lab 2: Workstation #14 Network Drop',
  titleNe: 'ल्याब २: कम्प्युटर १४ इन्टरनेट विच्छेद',
  category: 'Internet / Wi-Fi / Network',
  categoryLabelEn: 'Wi-Fi & Campus Network',
  categoryLabelNe: 'इन्टरनेट तथा क्याम्पस वाइफाइ',
  priority: 'High',
  priorityLabelEn: 'High Priority',
  priorityLabelNe: 'उच्च प्राथमिकता',
  location: 'Block B, Lab 2 (Row 3, PC-14)',
  locationNe: 'ब्लक बि, ल्याब २ (रो ३, पिसी-१४)',
  technicianName: 'Bikash Sharma – Senior Technician',
  technicianNameNe: 'विकास शर्मा – वरिष्ठ प्राविधिक',
  slaPhraseEn: 'Target response within 24–48 hours',
  slaPhraseNe: 'लक्षित सम्बोधन २४–४८ घण्टा भित्र',
  stages: [
    {
      stage: 1,
      statusClass: 'status-submitted',
      statusTextEn: 'Submitted',
      statusTextNe: 'दर्ता भयो',
      time: '10:15 AM',
      noteEn: 'Student ticket lodged on portal. Queued for desk triage.',
      noteNe: 'विद्यार्थी उजुरी प्रणालीमा दर्ता भयो। डेस्क समीक्षा पर्खिंदै।',
      techEn: 'Triage Desk (Queue Pending)',
      techNe: 'डेस्क समीक्षक (खटन बाँकी)',
    },
    {
      stage: 2,
      statusClass: 'status-review',
      statusTextEn: 'Under Review',
      statusTextNe: 'समीक्षा सम्पन्न',
      time: '10:45 AM',
      noteEn: 'Lab admin verified network drop symptoms and scheduled technician.',
      noteNe: 'ल्याब प्रशासकले नेटवर्क ड्रप लक्षण प्रमाणित गरे र प्राविधिक खटाए।',
      techEn: 'Bikash Sharma – Senior Technician',
      techNe: 'विकास शर्मा – वरिष्ठ प्राविधिक',
    },
    {
      stage: 3,
      statusClass: 'in-progress',
      statusTextEn: 'In Progress',
      statusTextNe: 'प्रगतिमा',
      time: '11:20 AM',
      noteEn: 'Technician inspecting Switch Port #04 and crimping new RJ-45 cable.',
      noteNe: 'प्राविधिक ल्याब २ मा उपस्थित भई स्विच पोर्ट र RJ-45 केबल परीक्षण गर्दै।',
      techEn: 'Bikash Sharma – Senior Technician',
      techNe: 'विकास शर्मा – वरिष्ठ प्राविधिक',
    },
    {
      stage: 4,
      statusClass: 'status-resolved',
      statusTextEn: 'Resolved',
      statusTextNe: 'समाधान भयो',
      time: '01:10 PM',
      noteEn: 'New Cat-6 patch cord installed. Verified 100 Mbps uplink on PC-14.',
      noteNe: 'नयाँ क्याट-६ प्याच कर्ड जडान सम्पन्न। १०० Mbps ब्यान्डविथ परीक्षण प्रमाणित।',
      techEn: 'Bikash Sharma – Senior Technician',
      techNe: 'विकास शर्मा – वरिष्ठ प्राविधिक',
    },
  ],
};

export default SAMPLE_TICKET;
