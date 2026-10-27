// Mock Data for Smart College Complaint System - Soch College of IT, Pokhara
// IT-focused categories, realistic sample complaints, and student-centric data

export const CATEGORIES = [
  'Computer Lab / Hardware',
  'Internet / Wi-Fi / Network',
  'Software / Programming Tools',
  'Programming Classes / Assignments',
  'IT Project / Supervision',
  'Classroom Technology / Projector',
];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export const STATUS_LIST = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];

export const INITIAL_STUDENT = {
  id: 'SOCH-ST-2024-042',
  role: 'Student',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@sochcollege.edu.np',
  rollNumber: 'CSIT-2023-042',
  program: 'BSc CSIT',
  semester: '4th Semester (Year 2)',
  phone: '061-574096',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
};

export const INITIAL_ADMIN = {
  id: 'SOCH-ADM-001',
  role: 'Admin',
  name: 'College Administrator',
  title: 'IT Grievance Coordinator & Dean Desk',
  email: 'grievance.it@sochcollege.edu.np',
  department: 'IT Administration & Quality Cell',
  phone: '061-574096',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
};

export const IT_SUPPORT_TEAMS = [
  { id: 'team-1', name: 'IT Lab & Hardware Support', lead: 'Bikram Thapa' },
  { id: 'team-2', name: 'Network & Infrastructure Desk', lead: 'Suman Shrestha' },
  { id: 'team-3', name: 'Software & Systems Administration', lead: 'Anjali Sharma' },
  { id: 'team-4', name: 'Classroom AV & Projector Support', lead: 'Rabin Gurung' },
  { id: 'team-5', name: 'Academic Project Supervision Desk', lead: 'Department Coordinator' },
];

export const IT_STAFF_MEMBERS = [
  { id: 'staff-1', name: 'Bikram Thapa', role: 'Lab Hardware Technician', team: 'IT Lab & Hardware Support' },
  { id: 'staff-2', name: 'Suman Shrestha', role: 'Network Administrator', team: 'Network & Infrastructure Desk' },
  { id: 'staff-3', name: 'Anjali Sharma', role: 'Systems Analyst', team: 'Software & Systems Administration' },
  { id: 'staff-4', name: 'Rabin Gurung', role: 'AV Support Officer', team: 'Classroom AV & Projector Support' },
  { id: 'staff-5', name: 'Department Coordinator', role: 'IT Coordinator', team: 'Academic Project Supervision Desk' },
];

export const DEPARTMENTS = IT_SUPPORT_TEAMS;
export const STAFF_MEMBERS = IT_STAFF_MEMBERS;

// Legacy compatibility for any components referencing INITIAL_USERS
export const INITIAL_USERS = {
  student: INITIAL_STUDENT,
  admin: INITIAL_ADMIN,
};

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'anc-1',
    title: 'Computer Lab Maintenance & Python Environment Update',
    date: '2026-10-14',
    category: 'Computer Lab / Hardware',
    important: true,
    content: 'Workstations in computer labs are undergoing routine OS updates and IDE re-configurations this Friday between 3 PM and 6 PM.',
  },
  {
    id: 'anc-2',
    title: 'Campus Wi-Fi Fiber Router Firmware Upgrade',
    date: '2026-10-11',
    category: 'Internet / Wi-Fi / Network',
    important: false,
    content: 'Network access points across Academic Blocks A & B have been upgraded to 5GHz Wi-Fi 6 for faster package downloads during lab practicals.',
  },
  {
    id: 'anc-3',
    title: 'IT Project Milestone Submission & Supervisor Desk',
    date: '2026-10-08',
    category: 'IT Project / Supervision',
    important: false,
    content: 'Final-year students can request direct feedback on project documentation and code reviews through the grievance and supervision portal.',
  },
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    userId: 'SOCH-ST-2024-042',
    role: 'Student',
    title: 'Status Updated: CMP-2024-003',
    message: 'Your complaint regarding "Required programming software is unavailable on lab computers" has been marked Resolved.',
    time: '2 hours ago',
    unread: true,
    complaintId: 'CMP-2024-003',
  },
  {
    id: 'notif-2',
    userId: 'SOCH-ST-2024-042',
    role: 'Student',
    title: 'In Progress: CMP-2024-001',
    message: 'Your complaint "Computer in the programming lab is not starting" is currently being inspected by the lab technician.',
    time: '1 day ago',
    unread: true,
    complaintId: 'CMP-2024-001',
  },
  {
    id: 'notif-3',
    userId: 'SOCH-ST-2024-042',
    role: 'Student',
    title: 'Status Updated: CMP-2024-004',
    message: 'HDMI cable and projector configuration in Room 301 has been repaired and verified.',
    time: '2 days ago',
    unread: false,
    complaintId: 'CMP-2024-004',
  },
];

export const INITIAL_COMPLAINTS = [
  {
    id: 'CMP-2024-001',
    title: 'Computer in the programming lab is not starting',
    category: 'Computer Lab / Hardware',
    priority: 'High',
    status: 'In Progress',
    description: 'Workstation computer fails to power on during the morning Java programming practical. The power indicator light blinks amber, and the monitor receives no signal.',
    isAnonymous: false,
    studentName: 'Aarav Sharma',
    studentRoll: 'CSIT-2023-042',
    program: 'BSc CSIT',
    studentEmail: 'aarav.sharma@sochcollege.edu.np',
    assignedStaff: 'Lab Technical Support',
    submittedAt: '2026-10-14T09:15:00Z',
    updatedAt: '2026-10-14T11:30:00Z',
    resolvedAt: null,
    attachmentName: 'power_blinking.jpg',
    adminNotes: 'Assigned to Lab Hardware Support for PSU diagnostics.',
    resolutionNotes: 'Hardware team inspected the machine. Replacement SMPS power supply unit requested from spares inventory.',
    rating: null,
    feedback: null,
    timeline: [
      {
        status: 'Submitted',
        timestamp: '2026-10-14T09:15:00Z',
        actor: 'Aarav Sharma (Student)',
        note: 'Complaint registered via student portal.',
      },
      {
        status: 'Under Review',
        timestamp: '2026-10-14T10:00:00Z',
        actor: 'College Grievance Desk',
        note: 'Complaint reviewed and prioritized for lab hardware inspection.',
      },
      {
        status: 'In Progress',
        timestamp: '2026-10-14T11:30:00Z',
        actor: 'Lab Technical Support',
        note: 'Technician opened cabinet; power supply failure diagnosed. Replacement unit being installed.',
      },
    ],
  },
  {
    id: 'CMP-2024-002',
    title: 'Wi-Fi disconnects frequently during lab sessions',
    category: 'Internet / Wi-Fi / Network',
    priority: 'Medium',
    status: 'Under Review',
    description: 'The campus Wi-Fi network (Soch_Student_5G) in the 2nd floor computer laboratory repeatedly drops connection every 10 to 15 minutes. This interrupts npm/pip package installations and cloud repo pushes during our Web Technology lab.',
    isAnonymous: false,
    studentName: 'Aarav Sharma',
    studentRoll: 'CSIT-2023-042',
    program: 'BSc CSIT',
    studentEmail: 'aarav.sharma@sochcollege.edu.np',
    assignedStaff: 'Network Administration Desk',
    submittedAt: '2026-10-13T14:20:00Z',
    updatedAt: '2026-10-13T16:00:00Z',
    resolvedAt: null,
    attachmentName: null,
    adminNotes: 'Noted for router access point channel reconfiguration.',
    resolutionNotes: null,
    rating: null,
    feedback: null,
    timeline: [
      {
        status: 'Submitted',
        timestamp: '2026-10-13T14:20:00Z',
        actor: 'Aarav Sharma (Student)',
        note: 'Complaint filed with priority Medium.',
      },
      {
        status: 'Under Review',
        timestamp: '2026-10-13T16:00:00Z',
        actor: 'College Grievance Desk',
        note: 'Forwarded to campus network administrator for bandwidth and AP log audit.',
      },
    ],
  },
  {
    id: 'CMP-2024-003',
    title: 'Required programming software is unavailable on lab computers',
    category: 'Software / Programming Tools',
    priority: 'High',
    status: 'Resolved',
    description: 'VS Code, Python 3.12, and Docker Desktop were missing from workstations in Computer Lab 1, making it impossible to complete our scheduled Software Engineering assignment.',
    isAnonymous: false,
    studentName: 'Aarav Sharma',
    studentRoll: 'CSIT-2023-042',
    program: 'BSc CSIT',
    studentEmail: 'aarav.sharma@sochcollege.edu.np',
    assignedStaff: 'System Administrator',
    submittedAt: '2026-10-09T10:00:00Z',
    updatedAt: '2026-10-11T15:30:00Z',
    resolvedAt: '2026-10-11T15:30:00Z',
    attachmentName: 'software_missing_error.png',
    adminNotes: 'Network deployment package prepared for Lab 1 image.',
    resolutionNotes: 'Standardized developer bundle (VS Code with Python extensions, Docker Desktop, and Node.js LTS) deployed across all 24 computers in Lab 1.',
    rating: 5,
    feedback: 'All required editors and runtime tools are now available on every machine. Thank you!',
    timeline: [
      {
        status: 'Submitted',
        timestamp: '2026-10-09T10:00:00Z',
        actor: 'Aarav Sharma (Student)',
        note: 'Software requisition grievance registered.',
      },
      {
        status: 'Under Review',
        timestamp: '2026-10-09T11:30:00Z',
        actor: 'College Grievance Desk',
        note: 'BSc CSIT lab curriculum software requirements validated with instructor.',
      },
      {
        status: 'In Progress',
        timestamp: '2026-10-10T13:00:00Z',
        actor: 'System Administrator',
        note: 'Remote silent installer executed over local domain network.',
      },
      {
        status: 'Resolved',
        timestamp: '2026-10-11T15:30:00Z',
        actor: 'System Administrator',
        note: 'Software installation verified on all lab workstations.',
      },
    ],
  },
  {
    id: 'CMP-2024-004',
    title: 'Classroom projector is not working',
    category: 'Classroom Technology / Projector',
    priority: 'Medium',
    status: 'Resolved',
    description: 'The overhead digital projector in Classroom Room 301 loses HDMI signal when connected to student laptops, causing the display to cut out during technical presentations.',
    isAnonymous: true,
    studentName: 'Anonymous Student',
    studentRoll: 'CONFIDENTIAL',
    program: 'BSc CSIT',
    studentEmail: 'anonymous@sochcollege.edu.np',
    assignedStaff: 'AV & Classroom Support',
    submittedAt: '2026-10-07T11:00:00Z',
    updatedAt: '2026-10-08T14:45:00Z',
    resolvedAt: '2026-10-08T14:45:00Z',
    attachmentName: 'projector_no_signal.jpg',
    adminNotes: 'HDMI cable and wall faceplate inspected.',
    resolutionNotes: 'Replaced faulty 10m high-speed HDMI cable and tested projection with both Type-C and standard HDMI adapters.',
    rating: 5,
    feedback: 'The projection display is crisp and works without flickering now. Great resolution speed!',
    timeline: [
      {
        status: 'Submitted',
        timestamp: '2026-10-07T11:00:00Z',
        actor: 'Anonymous Student',
        note: 'Anonymous grievance filed for Classroom 301 projector.',
      },
      {
        status: 'Under Review',
        timestamp: '2026-10-07T12:15:00Z',
        actor: 'College Grievance Desk',
        note: 'Scheduled for after-hours AV maintenance.',
      },
      {
        status: 'In Progress',
        timestamp: '2026-10-08T10:00:00Z',
        actor: 'AV & Classroom Support',
        note: 'Cable testing revealed intermittent signal loss at podium terminal.',
      },
      {
        status: 'Resolved',
        timestamp: '2026-10-08T14:45:00Z',
        actor: 'AV & Classroom Support',
        note: 'New shielded HDMI line pulled and wall port re-terminated.',
      },
    ],
  },
  {
    id: 'CMP-2024-005',
    title: 'Request for feedback on an IT project submission',
    category: 'IT Project / Supervision',
    priority: 'Medium',
    status: 'Submitted',
    description: 'Our 4th-semester group project milestone (Database Management System) was submitted two weeks ago through the online portal, but supervisor remarks and review scores have not been provided yet.',
    isAnonymous: false,
    studentName: 'Aarav Sharma',
    studentRoll: 'CSIT-2023-042',
    program: 'BSc CSIT',
    studentEmail: 'aarav.sharma@sochcollege.edu.np',
    assignedStaff: null,
    submittedAt: '2026-10-15T08:30:00Z',
    updatedAt: '2026-10-15T08:30:00Z',
    resolvedAt: null,
    attachmentName: null,
    adminNotes: null,
    resolutionNotes: null,
    rating: null,
    feedback: null,
    timeline: [
      {
        status: 'Submitted',
        timestamp: '2026-10-15T08:30:00Z',
        actor: 'Aarav Sharma (Student)',
        note: 'Complaint registered through student portal.',
      },
    ],
  },
];
