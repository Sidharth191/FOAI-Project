export default function WelcomePlaceholder({ onStart }) {
  return (
    <div className="p-6">
      <p>Welcome</p>
      <button type="button" className="mt-4 border px-4 py-2" onClick={onStart}>
        Start
      </button>
    </div>
  );
}
