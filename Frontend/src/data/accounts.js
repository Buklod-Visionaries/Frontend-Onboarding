/**
 * Static account, activity and notification fixtures.
 *
 * Employee accounts are derived from the employee records in the store, so the
 * two can never drift apart — only their sign-in status is kept here.
 */
export const STAFF_USERS = [
  { id: 'u1', name: 'Grace Aquino', role: 'HR Staff', department: 'HR Department', email: 'g.aquino@pmcl.ph', status: 'Active', lastLogin: 'Today, 8:02 AM' },
  { id: 'u2', name: 'Ronald Estrada', role: 'HR Staff', department: 'HR Department', email: 'r.estrada@pmcl.ph', status: 'Active', lastLogin: 'Aug 15, 2026' },
  { id: 'u3', name: 'Liza Tanguilig', role: 'Department Representative', department: 'Laboratory', email: 'l.tanguilig@pmcl.ph', status: 'Active', lastLogin: 'Today, 7:41 AM' },
  { id: 'u4', name: 'Nico Alvarez', role: 'Department Representative', department: 'Imaging', email: 'n.alvarez@pmcl.ph', status: 'Active', lastLogin: 'Aug 14, 2026' },
  { id: 'u5', name: 'Teresa Lim', role: 'Department Representative', department: 'Cardiovascular', email: 't.lim@pmcl.ph', status: 'Pending first login', lastLogin: '—' }
];

export const EMPLOYEE_ACCOUNT_STATUS = {
  e1: 'Active',
  e2: 'Active',
  e3: 'Pending first login',
  e4: 'Active',
  e5: 'Pending first login',
  e6: 'Active',
  e7: 'Active'
};

export const ACTIVITY_LOG = [
  { text: 'Maricel Bautista submitted PRC License', time: 'Today, 9:42 AM' },
  { text: 'HR requested resubmission of Transcript of Records — Maricel Bautista', time: 'Yesterday, 4:15 PM' },
  { text: 'Angeline Cruz submitted Government Forms', time: 'Yesterday, 11:03 AM' },
  { text: 'Liza Tanguilig confirmed Orientation — Rafael Domingo', time: 'Aug 13, 2:20 PM' },
  { text: 'Onboarding record created for Danica Reyes', time: 'Aug 11, 8:30 AM' }
];

export const NOTIFICATIONS = [
  { id: 'n1', to: 'Employee', title: 'Resubmission requested', body: 'Transcript of Records — the scan is cut off on the right side. Please upload a complete copy.', time: 'Yesterday, 4:15 PM', unread: true },
  { id: 'n2', to: 'Employee', title: 'Requirement due in 3 days', body: 'Health Certificate is due on Aug 17, 2026.', time: 'Aug 14, 9:00 AM', unread: true },
  { id: 'n3', to: 'Employee', title: 'Requirement verified', body: 'Government Forms has been verified by HR.', time: 'Aug 4, 10:12 AM', unread: false },
  { id: 'n4', to: 'HR', title: '2 submissions awaiting verification', body: 'Maricel Bautista and Danica Reyes submitted documents for review.', time: 'Today, 9:42 AM', unread: true },
  { id: 'n5', to: 'HR', title: 'Overdue requirements', body: 'Joshua Ramirez has 4 requirements past their deadline.', time: 'Today, 8:00 AM', unread: true },
  { id: 'n6', to: 'HR', title: 'Department confirmation received', body: 'Liza Tanguilig confirmed Orientation for Rafael Domingo.', time: 'Aug 13, 2:20 PM', unread: false },
  { id: 'n7', to: 'Department', title: 'Pending department requirements', body: 'Orientation for Maricel Bautista and Angeline Cruz is awaiting confirmation.', time: 'Today, 8:00 AM', unread: true },
  { id: 'n8', to: 'Department', title: 'New employee in Laboratory', body: 'Angeline Cruz (Phlebotomist) started on Aug 10, 2026.', time: 'Aug 10, 8:05 AM', unread: false }
];

/** Demo sign-in identities, one per role. */
export const SESSION_PROFILES = {
  HR: {
    name: 'Grace Aquino',
    title: 'HR Officer',
    email: 'g.aquino@pmcl.ph',
    home: '/hr/dashboard'
  },
  Employee: {
    name: 'Maricel Bautista',
    title: 'Medical Technologist',
    email: 'm.bautista@pmcl.ph',
    employeeId: 'e1',
    home: '/employee/dashboard'
  },
  Department: {
    name: 'Liza Tanguilig',
    title: 'Laboratory Supervisor',
    email: 'l.tanguilig@pmcl.ph',
    department: 'Laboratory',
    home: '/dept/dashboard'
  }
};

export const ROLE_HOME = {
  HR: '/hr/dashboard',
  Employee: '/employee/dashboard',
  Department: '/dept/dashboard'
};
