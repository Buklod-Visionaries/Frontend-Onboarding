import { useState } from 'react';
import { Bell, FileText } from 'lucide-react';

import Badge, { OverdueBadge } from './components/ui/Badge';
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import AutoGrid from './components/ui/AutoGrid';
import DividerList, { DividerRow } from './components/ui/DividerList';
import { Field, Input, Radio, Segmented, Select, Textarea } from './components/ui/Field';
import Modal from './components/ui/Modal';
import Notice, { EmptyState, InfoGroup, SectionHeading } from './components/ui/Notice';
import ProgressBar from './components/ui/ProgressBar';
import StatCard, { StatStrip } from './components/ui/StatCard';
import { TCell, THead, TRow, Table } from './components/ui/Table';
import { EventList, MilestoneTimeline } from './components/ui/Timeline';
import Toast from './components/ui/Toast';

const STATUSES = ['Pending', 'In Progress', 'Completed', 'Active', 'Pending first login', 'Deactivated'];

const MILESTONES = [
  { title: 'Requirements submitted and verified', done: true, detail: '9 of 11 requirements completed' },
  { title: 'Officially started', done: true, detail: 'Started Aug 3, 2026' },
  { title: 'Team introduction', done: true, detail: 'Introduced to the department team' },
  { title: 'Orientation', done: false, detail: 'Awaiting department confirmation' },
  { title: 'One-month training', done: false, detail: 'Tracked as an onboarding activity' }
];

const EVENTS = [
  { text: 'Maricel Bautista submitted PRC License', time: 'Today, 9:42 AM' },
  { text: 'HR requested resubmission of Transcript of Records', time: 'Yesterday, 4:15 PM' },
  { text: 'Angeline Cruz submitted Government Forms', time: 'Yesterday, 11:03 AM' }
];

const ROWS = [
  { name: 'Maricel Bautista', requirement: 'PRC License', file: 'prc_license_bautista.pdf', status: 'In Progress' },
  { name: 'Danica Reyes', requirement: 'Diploma', file: 'diploma_reyes.pdf', status: 'Pending' },
  { name: 'Rafael Domingo', requirement: 'Health Certificate', file: 'health_cert_domingo.jpg', status: 'Completed' }
];

function Section({ title, children }) {
  return (
    <Card className="gap-4">
      <SectionHeading>{title}</SectionHeading>
      {children}
    </Card>
  );
}

export default function KitchenSink() {
  const [segment, setSegment] = useState('All');
  const [tab, setTab] = useState('info');
  const [role, setRole] = useState('HR Staff');
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState('');

  const fireToast = () => {
    setToast('PRC License marked completed');
    window.setTimeout(() => setToast(''), 3200);
  };

  return (
    <div className="flex flex-col gap-6 p-7">
      <header>
        <div className="text-micro uppercase text-ink/50">Step 2 verification</div>
        <h2 className="mt-0.5 text-[34px]">UI primitives</h2>
        <p className="m-0 text-cell text-ink/55">Every component and variant in components/ui.</p>
      </header>

      <Section title="Button">
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="primary">Approve &amp; mark completed</Button>
          <Button>Request resubmission</Button>
          <Button variant="ghost">View all</Button>
          <Button variant="icon" aria-label="Notifications">
            <Bell size={16} strokeWidth={1.5} />
          </Button>
          <Button variant="primary" disabled>
            Primary disabled
          </Button>
          <Button disabled>Secondary disabled</Button>
        </div>
        <div className="max-w-[280px]">
          <Button variant="primary" block className="h-[42px]">
            Sign in
          </Button>
        </div>
      </Section>

      <Section title="Badge">
        <div className="flex flex-wrap items-center gap-2.5">
          {STATUSES.map((status) => (
            <Badge key={status}>{status}</Badge>
          ))}
          <OverdueBadge when />
          <OverdueBadge when={false} />
        </div>
      </Section>

      <Section title="Card padding">
        <AutoGrid min={200} gap="gap-4">
          <Card padding="sm">
            <span className="text-field">padding sm &mdash; 18px</span>
          </Card>
          <Card padding="md">
            <span className="text-field">padding md &mdash; 20px</span>
          </Card>
          <Card padding="lg">
            <span className="text-field">padding lg &mdash; 22px</span>
          </Card>
          <Card padding="none">
            <span className="p-3 text-field">padding none</span>
          </Card>
        </AutoGrid>
      </Section>

      <Section title="Field, Input, Textarea, Select, Radio, Segmented">
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Full name">
            <Input placeholder="e.g. Maria Santos" />
          </Field>
          <Field label="Temporary password" hint="The user sets their own password on first login.">
            <Input value="PMCL-Temp-4471" readOnly />
          </Field>
          <Field label="Position">
            <Select options={['Medical Technologist', 'Phlebotomist', 'Billing Officer']} />
          </Field>
          <Field label="Disabled control">
            <Input value="Not editable" disabled readOnly />
          </Field>
        </div>
        <Field label="Reason for resubmission (sent to the employee)">
          <Textarea placeholder="e.g. The uploaded scan is cut off. Please upload a full copy." />
        </Field>
        <div className="flex flex-col gap-2.5">
          <span className="text-meta text-ink/65">Select role</span>
          {['HR Staff', 'Department Representative', 'Employee'].map((option) => (
            <Radio
              key={option}
              name="kitchen-role"
              checked={role === option}
              onChange={() => setRole(option)}
            >
              {option}
            </Radio>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Segmented
            value={segment}
            onChange={setSegment}
            options={['All', 'Pending', 'In Progress', 'Completed']}
          />
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: 'info', label: 'Information' },
              { value: 'requirements', label: 'Requirements' },
              { value: 'progress', label: 'Onboarding progress' }
            ]}
          />
        </div>
      </Section>

      <Section title="Table">
        <Table>
          <THead
            columns={['Employee', 'Requirement', 'File', 'Status', { label: '', align: 'right' }]}
          />
          <tbody>
            {ROWS.map((row) => (
              <TRow key={row.requirement} onClick={() => {}}>
                <TCell strong>{row.name}</TCell>
                <TCell>{row.requirement}</TCell>
                <TCell muted className="font-heading text-cell text-accent-700">
                  {row.file}
                </TCell>
                <TCell>
                  <Badge>{row.status}</Badge>
                </TCell>
                <TCell align="right">
                  <Button>Review</Button>
                </TCell>
              </TRow>
            ))}
          </tbody>
        </Table>
      </Section>

      <Section title="ProgressBar">
        <div className="flex flex-col gap-3.5">
          <ProgressBar height="sm" value={35} />
          <ProgressBar height="md" value={64} />
          <ProgressBar height="lg" value={82} />
        </div>
      </Section>

      <Section title="StatCard and StatStrip">
        <AutoGrid min={190} gap="gap-4">
          <StatCard label="Total employees" value={7} note="Onboarding records on file" />
          <StatCard label="In progress" value={5} note="Onboarding not yet complete" />
          <StatCard label="Pending requirements" value={31} note="Not yet submitted" />
          <StatCard label="Overdue" value={4} note="Past deadline" />
        </AutoGrid>
        <StatStrip
          min={140}
          items={[
            { label: 'Completed', value: 9 },
            { label: 'In progress', value: 2 },
            { label: 'Pending', value: 0 },
            { label: 'Overdue', value: 1 }
          ]}
        />
      </Section>

      <Section title="Timeline">
        <AutoGrid min={300}>
          <MilestoneTimeline items={MILESTONES} />
          <div className="flex flex-col gap-5">
            <EventList items={EVENTS} />
            <EventList items={EVENTS} round />
          </div>
        </AutoGrid>
      </Section>

      <Section title="Notice, EmptyState, SectionHeading, InfoGroup">
        <Notice>
          11 onboarding requirements were assigned automatically from the position and department.
        </Notice>
        <Notice title="Resubmission requested">
          The scan is cut off on the right side. Please upload a complete copy showing all pages.
        </Notice>
        <EmptyState>No submissions are waiting for review.</EmptyState>
        <SectionHeading step="01">Employee information</SectionHeading>
        <AutoGrid min={260}>
          <InfoGroup
            title="Personal information"
            rows={[
              { label: 'Full name', value: 'Maricel Bautista' },
              { label: 'Date of birth', value: 'Feb 11, 1999' },
              { label: 'Civil status', value: 'Single' }
            ]}
          />
          <InfoGroup
            title="Government information"
            rows={[
              { label: 'SSS', value: '34-8829104-3' },
              { label: 'PhilHealth', value: '12-105882344-7' },
              { label: 'TIN', value: '452-118-903-000' }
            ]}
          />
        </AutoGrid>
      </Section>

      <Section title="DividerList">
        <DividerList>
          {['Government Forms', 'Diploma', 'Transcript of Records'].map((name) => (
            <DividerRow key={name} className="flex items-center gap-2.5 px-3 py-2.5">
              <span className="text-cell text-accent">&#10003;</span>
              <span className="flex-1 text-field">{name}</span>
              <span className="text-[10px] uppercase tracking-[0.1em] text-ink/45">Document</span>
            </DividerRow>
          ))}
          <DividerRow
            as="button"
            type="button"
            className="flex items-center gap-3 px-3.5 py-3 text-left hover:bg-accent-100"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-field font-medium">Health Certificate</span>
              <span className="block text-meta text-ink/55">Not yet submitted &middot; due Aug 17, 2026</span>
            </span>
            <Badge>Pending</Badge>
          </DividerRow>
        </DividerList>
      </Section>

      <Section title="Modal and Toast">
        <div className="flex flex-wrap gap-2.5">
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Open modal
          </Button>
          <Button onClick={fireToast}>Fire toast</Button>
        </div>
      </Section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        width="max-w-[720px]"
        kicker="Requirement verification"
        title="PRC License"
        subtitle="Maricel Bautista &middot; Medical Technologist &middot; Laboratory"
        actions={
          <>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setModalOpen(false)}>Request resubmission</Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>
              Approve &amp; mark completed
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-[1.1fr_1fr]">
          <div className="flex aspect-[3/4] flex-col items-center justify-center gap-2 border border-divider bg-surface">
            <FileText size={30} strokeWidth={1.5} className="text-accent" />
            <div className="font-heading text-[15px]">prc_license_bautista.pdf</div>
            <div className="text-[11px] text-ink/50">Document preview</div>
          </div>
          <dl className="grid gap-2 text-cell" style={{ gridTemplateColumns: '110px 1fr' }}>
            <dt className="text-ink/50">Type</dt>
            <dd className="m-0">Document</dd>
            <dt className="text-ink/50">Submitted</dt>
            <dd className="m-0">Aug 14, 2026</dd>
            <dt className="text-ink/50">Deadline</dt>
            <dd className="m-0">Aug 17, 2026</dd>
            <dt className="text-ink/50">Status</dt>
            <dd className="m-0">
              <Badge>In Progress</Badge>
            </dd>
          </dl>
        </div>
      </Modal>

      <Toast message={toast} />
    </div>
  );
}
