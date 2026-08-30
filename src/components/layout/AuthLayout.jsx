import ToastHost from './ToastHost';

/** Split authentication screen: deep accent field left, single card right. */
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen items-stretch lg:grid" style={{ gridTemplateColumns: '1.1fr 1fr' }}>
      <div className="flex flex-col gap-10 bg-accent-900 p-8 text-bg lg:p-14">
        <div className="flex flex-col gap-1.5">
          <div className="font-heading text-cell uppercase tracking-[0.22em] opacity-70">
            Premiere Medical and Cardiovascular Laboratory Inc.
          </div>
          <div className="font-heading text-cell uppercase tracking-[0.22em] opacity-45">
            Human Resources Department
          </div>
        </div>

        {/* my-auto keeps the headline vertically centred now that the figure
            strip that used to anchor the foot of this panel is gone. */}
        <div className="my-auto flex max-w-[460px] flex-col gap-5">
          <h1 className="text-[40px] leading-[1.02] lg:text-[56px]">
            Employee Onboarding Management and Tracking System
          </h1>
          <p className="m-0 text-base leading-relaxed opacity-70">
            Centralized onboarding records, requirement tracking and verification for new hires across
            Laboratory, Imaging, Cardiovascular and Administration.
          </p>
        </div>
      </div>

      <div className="grid place-items-center p-8 lg:px-10 lg:py-14">{children}</div>
      <ToastHost />
    </div>
  );
}
