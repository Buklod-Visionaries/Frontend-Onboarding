import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge, { OverdueBadge } from '../../components/ui/Badge';
import AutoGrid from '../../components/ui/AutoGrid';
import Notice from '../../components/ui/Notice';
import { EventList } from '../../components/ui/Timeline';
import { cx } from '../../lib/cx';
import { useApp } from '../../hooks/useApp';
import { useCurrentEmployee } from '../../hooks/useCurrentEmployee';
import { isOverdue } from '../../domain/requirements';
import { formatDate } from '../../domain/date';
import { REQUIREMENT_DESCRIPTIONS } from '../../data/positions';

/** Requirement details + document upload / resubmission. */
export default function RequirementDetail() {
  const app = useApp();
  const params = useParams();
  const navigate = useNavigate();
  const fileInput = useRef(null);
  const [pendingFile, setPendingFile] = useState('');

  const me = useCurrentEmployee();
  const requirement = me.requirements.find((row) => row.id === params.id);

  if (!requirement) {
    return (
      <Card>
        <p className="m-0 text-field">That requirement does not exist.</p>
        <Button className="mt-3 self-start" onClick={() => navigate('/employee/requirements')}>
          Back to requirements
        </Button>
      </Card>
    );
  }

  const uploadable = requirement.owner === 'Employee' && requirement.status !== 'Completed';

  const uploadLabel = pendingFile
    ? `Selected: ${pendingFile}`
    : requirement.status === 'Completed'
      ? requirement.file
        ? `${requirement.file} — verified`
        : 'Confirmed — no upload required'
      : requirement.owner !== 'Employee'
        ? 'Confirmed by your department representative'
        : requirement.file
          ? `Last upload: ${requirement.file}`
          : 'Choose a file to submit';

  const submit = () => {
    if (!pendingFile) return;
    app.submitDocument(requirement);
    setPendingFile('');
  };

  return (
    <AutoGrid min={320} className="items-start">
      <Card padding="lg" className="gap-4">
        <div>
          <div className="text-micro uppercase text-accent-700">{requirement.type}</div>
          <h2 className="mb-2 mt-1 text-[30px]">{requirement.name}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{requirement.status}</Badge>
            <span className="text-meta text-ink/55">
              Deadline {formatDate(requirement.deadline)}
            </span>
            <OverdueBadge when={isOverdue(requirement)} />
          </div>
        </div>

        <p className="m-0 text-field leading-relaxed text-ink/70">
          {REQUIREMENT_DESCRIPTIONS[requirement.name] ||
            'Submit this requirement to the HR Department for verification.'}
        </p>

        {requirement.note && requirement.status !== 'Completed' && (
          <Notice title="Resubmission requested">{requirement.note}</Notice>
        )}

        <div className="flex flex-col gap-2.5">
          <span className="text-micro uppercase text-ink/50">Submission</span>
          <div
            className={cx(
              'flex flex-col items-center gap-1.5 border border-dashed p-6 text-center',
              uploadable ? 'border-ink/30' : 'border-ink/[0.18] opacity-55'
            )}
          >
            <Upload size={26} strokeWidth={1.5} className="text-accent" />
            <div className="text-field">{uploadLabel}</div>
            <div className="text-meta text-ink/50">PDF, JPG or PNG &middot; max 10 MB</div>
            <input
              ref={fileInput}
              type="file"
              onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                if (file) setPendingFile(file.name);
              }}
            />
            <div className="mt-1.5 flex flex-wrap justify-center gap-2.5">
              <Button disabled={!uploadable} onClick={() => fileInput.current?.click()}>
                Choose file
              </Button>
              <Button variant="primary" disabled={!uploadable || !pendingFile} onClick={submit}>
                {requirement.file ? 'Resubmit document' : 'Submit document'}
              </Button>
            </div>
          </div>
        </div>

        <Button className="self-start" onClick={() => navigate('/employee/requirements')}>
          Back to requirements
        </Button>
      </Card>

      <Card padding="lg" className="gap-3.5">
        <h4 className="text-[20px]">Submission history</h4>
        <EventList
          items={
            requirement.history.length
              ? requirement.history
              : [{ text: 'No submissions yet', time: '—' }]
          }
        />
      </Card>
    </AutoGrid>
  );
}
