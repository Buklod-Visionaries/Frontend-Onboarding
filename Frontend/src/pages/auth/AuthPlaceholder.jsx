import AuthLayout, { AuthCard } from '../../components/layout/AuthLayout';
import { EmptyState } from '../../components/ui/Notice';

/** TEMPORARY. FirstLogin and ForgotPassword are built in Step 5. */
export default function AuthPlaceholder({ kicker, title }) {
  return (
    <AuthLayout>
      <AuthCard back kicker={kicker} title={title}>
        <EmptyState>This screen is built in Step 5.</EmptyState>
      </AuthCard>
    </AuthLayout>
  );
}
