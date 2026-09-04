/**
 * Reference data: which department a position belongs to, and which extra
 * requirements that position adds on top of the base set.
 *
 * Static fixtures. Nothing here imports React or reaches the network.
 */
export const POSITIONS = {
  'Medical Technologist': { department: 'Laboratory', extra: ['PRC License', 'Occupational Permit'] },
  Phlebotomist: { department: 'Laboratory', extra: ['Occupational Permit'] },
  'Radiologic Technologist': { department: 'Imaging', extra: ['PRC License'] },
  'Cardiovascular Technologist': { department: 'Cardiovascular', extra: ['PRC License'] },
  'Registered Nurse': { department: 'Cardiovascular', extra: ['PRC License'] },
  'Administrative Assistant': { department: 'Administration', extra: [] },
  'Billing Officer': { department: 'Administration', extra: [] }
};

export const POSITION_NAMES = Object.keys(POSITIONS);

/**
 * Every requirement carries a name, a type and a deadline offset in days from
 * the employee's start date.
 */
export const BASE_REQUIREMENTS = [
  { name: 'Government Forms', type: 'Document', offset: 7 },
  { name: 'Diploma', type: 'Document', offset: 7 },
  { name: 'Transcript of Records', type: 'Document', offset: 10 },
  { name: 'Health Certificate', type: 'Document', offset: 14 },
  { name: 'SSS Number', type: 'Registration', offset: 7 },
  { name: 'PhilHealth Number', type: 'Registration', offset: 7 },
  { name: 'Pag-IBIG Number', type: 'Registration', offset: 7 },
  { name: 'TIN', type: 'Registration', offset: 7 }
];

/** Confirmed by the department representative rather than uploaded by the employee. */
export const ACTIVITY_REQUIREMENTS = [
  { name: 'Team Introduction', type: 'Activity', offset: 1 },
  { name: 'Orientation', type: 'Activity', offset: 5 },
  { name: 'Department Training', type: 'Activity', offset: 30 }
];

/** Extra requirements a position adds are always documents, due at day 14. */
export const EXTRA_REQUIREMENT_OFFSET = 14;

export const REQUIREMENT_DESCRIPTIONS = {
  'Government Forms':
    'Completed and signed pre-employment government forms provided by HR during your job offer.',
  Diploma: 'A clear copy of your college diploma. Photocopies must be readable end to end.',
  'Transcript of Records':
    'Official Transcript of Records issued by your school, complete with all pages.',
  'Health Certificate':
    'Health certificate from an accredited clinic, issued within the last six months.',
  'SSS Number': 'Your SSS number. Upload your E-1 form or SSS ID if available.',
  'PhilHealth Number': 'Your PhilHealth identification number (PIN) or MDR printout.',
  'Pag-IBIG Number': 'Your Pag-IBIG MID number or membership registration confirmation.',
  TIN: 'Your Tax Identification Number as issued by the BIR.',
  'PRC License': 'Your valid PRC professional license for this position.',
  'Occupational Permit':
    'Occupational permit issued by the local government unit of your workplace.',
  'Team Introduction':
    'Introduction to your department team, confirmed by your department representative.',
  Orientation: 'Company orientation covering policies, rules and other important information.',
  'Department Training':
    'One-month department training period, confirmed by your department representative.'
};
