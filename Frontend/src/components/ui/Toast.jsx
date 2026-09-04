export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-50 bg-accent-900 px-4.5 py-3.5 text-field text-bg shadow-lg"
    >
      {message}
    </div>
  );
}
