import { Link } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Notice';

/** TEMPORARY. FirstLogin and ForgotPassword are built in Step 5. */
export default function AuthPlaceholder({ kicker, title }) {
  return (
    <AuthLayout>
      <Card padding="lg" className="w-full max-w-[400px] gap-5">
        <div>
          <div className="font-heading text-kicker uppercase text-accent-700">{kicker}</div>
          <h2 className="mt-1.5 text-[30px]">{title}</h2>
        </div>
        <EmptyState>This screen is built in Step 5.</EmptyState>
        <Link to="/login" className="self-center">
          <Button variant="ghost">Back to sign in</Button>
        </Link>
      </Card>
    </AuthLayout>
  );
}
