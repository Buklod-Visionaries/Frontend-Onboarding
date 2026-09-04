import { POSITIONS } from './positions';
import { buildRequirements } from '../domain/requirements';
import { SUB_LABELS } from '../domain/constants';
import { addDays, formatDate } from '../domain/date';

/**
 * Seeded employee records.
 *
 * Static fixtures — plain objects, built fresh on each call so the store owns a
 * private copy it can mutate. Overrides mark a requirement as:
 *   C = completed, S = submitted and awaiting HR, R = resubmission requested
 */
function applyOverride(requirement, override, start) {
  const [code, file, submitted, note] = override;

  if (code === 'C') {
    requirement.status = 'Completed';
    requirement.subLabel = requirement.type === 'Activity' ? SUB_LABELS.confirmed : SUB_LABELS.verified;
    requirement.file = file || '';
    requirement.submitted = submitted || '';
    requirement.history = [{ text: 'Marked completed', time: formatDate(submitted || start) }];
    return;
  }

  if (code === 'S') {
    requirement.status = 'In Progress';
    requirement.subLabel = SUB_LABELS.awaitingHr;
    requirement.file = file;
    requirement.submitted = submitted;
    requirement.history = [{ text: `Document submitted — ${file}`, time: formatDate(submitted) }];
    return;
  }

  if (code === 'R') {
    requirement.status = 'In Progress';
    requirement.subLabel = SUB_LABELS.resubmission;
    requirement.file = file;
    requirement.submitted = submitted;
    requirement.note = note;
    requirement.history = [
      { text: 'Resubmission requested by HR', time: formatDate(submitted) },
      { text: `Document submitted — ${file}`, time: formatDate(addDays(submitted, -2)) }
    ];
  }
}

function makeEmployee(id, name, position, start, overrides, profile) {
  const requirements = buildRequirements(position, start, id);
  for (const requirement of requirements) {
    const override = overrides[requirement.name];
    if (override) applyOverride(requirement, override, start);
  }

  return {
    id,
    name,
    position,
    department: POSITIONS[position].department,
    start,
    requirements,
    milestones: { started: false, intro: false, orientation: false, training: false },
    ...profile
  };
}

export function seedEmployees() {
  const list = [
    makeEmployee(
      'e1',
      'Maricel Bautista',
      'Medical Technologist',
      '2026-08-03',
      {
        'Government Forms': ['C', 'gov_forms_bautista.pdf', '2026-08-04'],
        'SSS Number': ['C', '', '2026-08-04'],
        'PhilHealth Number': ['C', '', '2026-08-04'],
        'Pag-IBIG Number': ['C', '', '2026-08-05'],
        TIN: ['C', '', '2026-08-05'],
        Diploma: ['S', 'diploma_bautista.pdf', '2026-08-12'],
        'Transcript of Records': [
          'R',
          'tor_bautista.jpg',
          '2026-08-13',
          'The scan is cut off on the right side. Please upload a complete copy showing all pages.'
        ],
        'PRC License': ['S', 'prc_license_bautista.pdf', '2026-08-14'],
        'Team Introduction': ['C', '', '2026-08-03']
      },
      {
        email: 'm.bautista@pmcl.ph',
        phone: '+63 917 244 8810',
        birth: '1999-02-11',
        civil: 'Single',
        address: '18 Mabini St., Brgy. San Roque, Marikina City',
        school: 'University of Santo Tomas',
        degree: 'BS Medical Technology',
        year: '2021',
        sss: '34-8829104-3',
        philhealth: '12-105882344-7',
        pagibig: '1210-9948-3315',
        tin: '452-118-903-000',
        prc: '0093442 — valid until Feb 2028'
      }
    ),
    makeEmployee(
      'e2',
      'Joshua Ramirez',
      'Radiologic Technologist',
      '2026-07-13',
      {
        'Government Forms': ['C', 'gov_forms_ramirez.pdf', '2026-07-15'],
        'SSS Number': ['C', '', '2026-07-15'],
        TIN: ['C', '', '2026-07-16'],
        Diploma: ['C', 'diploma_ramirez.pdf', '2026-07-18'],
        'PRC License': ['S', 'prc_ramirez.pdf', '2026-08-14'],
        'Team Introduction': ['C', '', '2026-07-13'],
        Orientation: ['C', '', '2026-07-17']
      },
      {
        email: 'j.ramirez@pmcl.ph',
        phone: '+63 918 330 7712',
        birth: '1997-06-04',
        civil: 'Single',
        address: '77 Katipunan Ave., Quezon City',
        school: 'Our Lady of Fatima University',
        degree: 'BS Radiologic Technology',
        year: '2019',
        sss: '34-7761230-8',
        philhealth: '—',
        pagibig: '—',
        tin: '388-220-114-000',
        prc: '0071553 — valid until Jun 2027'
      }
    ),
    makeEmployee(
      'e3',
      'Angeline Cruz',
      'Phlebotomist',
      '2026-08-10',
      {
        'Government Forms': ['S', 'gov_forms_cruz.pdf', '2026-08-15'],
        'SSS Number': ['C', '', '2026-08-11']
      },
      {
        email: 'a.cruz@pmcl.ph',
        phone: '+63 906 118 4402',
        birth: '2001-11-23',
        civil: 'Single',
        address: '4 Sampaguita St., Brgy. Concepcion, Marikina City',
        school: 'Centro Escolar University',
        degree: 'BS Medical Laboratory Science',
        year: '2023',
        sss: '35-1104882-1',
        philhealth: '—',
        pagibig: '—',
        tin: '—',
        prc: 'Not applicable'
      }
    ),
    makeEmployee(
      'e4',
      'Rafael Domingo',
      'Cardiovascular Technologist',
      '2026-07-27',
      {
        'Government Forms': ['C', 'gov_forms_domingo.pdf', '2026-07-28'],
        'SSS Number': ['C', '', '2026-07-28'],
        'PhilHealth Number': ['C', '', '2026-07-29'],
        'Pag-IBIG Number': ['C', '', '2026-07-29'],
        TIN: ['C', '', '2026-07-30'],
        Diploma: ['C', 'diploma_domingo.pdf', '2026-07-31'],
        'Transcript of Records': ['C', 'tor_domingo.pdf', '2026-07-31'],
        'Health Certificate': ['S', 'health_cert_domingo.jpg', '2026-08-15'],
        'PRC License': ['C', 'prc_domingo.pdf', '2026-08-01'],
        'Team Introduction': ['C', '', '2026-07-27'],
        Orientation: ['C', '', '2026-07-30']
      },
      {
        email: 'r.domingo@pmcl.ph',
        phone: '+63 927 552 6631',
        birth: '1995-01-09',
        civil: 'Married',
        address: '12 Rizal Ext., Brgy. Kalumpang, Marikina City',
        school: 'Far Eastern University',
        degree: 'BS Cardiovascular Technology',
        year: '2017',
        sss: '33-5590221-4',
        philhealth: '12-095512210-3',
        pagibig: '1209-5512-2103',
        tin: '221-556-889-000',
        prc: '0044820 — valid until Jan 2027'
      }
    ),
    makeEmployee(
      'e5',
      'Danica Reyes',
      'Billing Officer',
      '2026-08-11',
      {
        'Government Forms': ['C', 'gov_forms_reyes.pdf', '2026-08-12'],
        'SSS Number': ['C', '', '2026-08-12'],
        TIN: ['C', '', '2026-08-12'],
        Diploma: ['S', 'diploma_reyes.pdf', '2026-08-15'],
        'Team Introduction': ['C', '', '2026-08-11']
      },
      {
        email: 'd.reyes@pmcl.ph',
        phone: '+63 915 887 2210',
        birth: '2000-03-30',
        civil: 'Single',
        address: '31 Bayan-Bayanan Ave., Marikina City',
        school: 'Polytechnic University of the Philippines',
        degree: 'BS Accountancy',
        year: '2022',
        sss: '35-2210448-9',
        philhealth: '—',
        pagibig: '—',
        tin: '509-118-220-000',
        prc: 'Not applicable'
      }
    ),
    makeEmployee(
      'e6',
      'Kristine Villanueva',
      'Administrative Assistant',
      '2026-06-15',
      {},
      {
        email: 'k.villanueva@pmcl.ph',
        phone: '+63 908 441 2277',
        birth: '1998-09-14',
        civil: 'Single',
        address: '8 Gil Fernando Ave., Marikina City',
        school: 'Rizal Technological University',
        degree: 'BS Office Administration',
        year: '2020',
        sss: '34-9911002-5',
        philhealth: '12-118820441-2',
        pagibig: '1211-8820-4412',
        tin: '611-220-114-000',
        prc: 'Not applicable'
      }
    ),
    makeEmployee(
      'e7',
      'Paolo Mendoza',
      'Medical Technologist',
      '2026-05-18',
      {},
      {
        email: 'p.mendoza@pmcl.ph',
        phone: '+63 919 220 5588',
        birth: '1996-12-02',
        civil: 'Married',
        address: '55 J.P. Rizal St., Brgy. Sto. Niño, Marikina City',
        school: 'University of the East Ramon Magsaysay',
        degree: 'BS Medical Technology',
        year: '2018',
        sss: '34-2201558-7',
        philhealth: '12-100448821-9',
        pagibig: '1210-0448-8219',
        tin: '330-885-221-000',
        prc: '0058821 — valid until Dec 2027'
      }
    )
  ];

  const byId = (id) => list.find((employee) => employee.id === id);

  // e6 and e7 are fully completed, archived records.
  for (const id of ['e6', 'e7']) {
    const employee = byId(id);
    for (const requirement of employee.requirements) {
      requirement.status = 'Completed';
      requirement.subLabel =
        requirement.type === 'Activity' ? SUB_LABELS.confirmed : SUB_LABELS.verified;
      requirement.submitted = addDays(employee.start, 6);
      if (requirement.type === 'Document') {
        requirement.file = `${requirement.name.toLowerCase().split(' ').join('_')}.pdf`;
      }
    }
    employee.milestones = { started: true, intro: true, orientation: true, training: true };
    employee.completedOn = addDays(employee.start, 30);
  }

  byId('e1').milestones = { started: true, intro: true, orientation: false, training: false };
  byId('e2').milestones = { started: true, intro: true, orientation: true, training: false };
  byId('e3').milestones = { started: false, intro: false, orientation: false, training: false };
  byId('e4').milestones = { started: true, intro: true, orientation: true, training: false };
  byId('e5').milestones = { started: true, intro: true, orientation: false, training: false };

  return list;
}
