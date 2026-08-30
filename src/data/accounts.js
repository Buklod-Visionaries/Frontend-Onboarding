/**
 * Demo sign-in identities, one per role.
 *
 * Step 3 extends this file with STAFF_USERS, EMPLOYEE_ACCOUNT_STATUS,
 * ACTIVITY_LOG and NOTIFICATIONS. Fixtures only — nothing here is imported by a
 * component directly; the store is the single reader.
 */
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
