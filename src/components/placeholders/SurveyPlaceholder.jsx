export default function SurveyPlaceholder({ onComplete }) {
  return (
    <div className="p-6">
      <p>Survey</p>
      <button type="button" className="mt-4 border px-4 py-2" onClick={onComplete}>
        Complete
      </button>
    </div>
  );
}
