export default function ProfileConfirmationPlaceholder({ onConfirm, onBack }) {
  return (
    <div className="p-6">
      <p>Confirm profile</p>
      <div className="mt-4 flex gap-2">
        {onBack ? (
          <button type="button" className="border px-4 py-2" onClick={onBack}>
            Back
          </button>
        ) : null}
        <button type="button" className="border px-4 py-2" onClick={onConfirm}>
          Confirm
        </button>
      </div>
    </div>
  );
}
