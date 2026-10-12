import { useId, useState } from 'react';
import { loadDisplayName, saveDisplayName } from '../game/displayName';

export function DisplayNameField() {
  const [value, setValue] = useState(() => loadDisplayName());
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const hintId = useId();

  const persist = () => {
    const name = saveDisplayName(value);
    if (!name) {
      setError('Use 2–20 letters, numbers, or spaces.');
      setSaved(false);
      return;
    }
    setValue(name);
    setError(null);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  return (
    <form
      className="name-field"
      data-testid="display-name"
      onSubmit={(e) => {
        e.preventDefault();
        persist();
      }}
    >
      <label className="section-label name-field-label" htmlFor={inputId}>
        Board name
      </label>
      <p className="name-field-hint" id={hintId}>
        Optional. Shown beside your record on the global Daily and rematch boards. Stored on this
        device only.
      </p>
      <div className="challenge-row">
        <input
          id={inputId}
          type="text"
          className="challenge-input"
          placeholder="e.g. Yogi"
          aria-describedby={hintId}
          autoComplete="nickname"
          data-testid="display-name-input"
          value={value}
          maxLength={20}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary">
          Save
        </button>
      </div>
      {error && <p className="field-error">{error}</p>}
      {saved && <p className="toast">Name saved on this device.</p>}
    </form>
  );
}
