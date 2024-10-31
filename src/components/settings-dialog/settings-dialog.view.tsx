import { useEffect, useRef } from "react";
import { useSettings } from "@components/settings-context";
import { useSettingsForm } from "./settings-dialog.model";
import * as css from "./settings-dialog.css";

export const SettingsDialogLayout = () => {
  const { isOpen } = useSettings();
  return (isOpen && <SettingsDialog />);
};

const SettingsDialog = () => {
  const { priorityFee, setPriorityFee, jitoMode, setJitoMode, save, close } = useSettingsForm();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.classList.add(css.nonScroll);
    return () => {
      document.body.classList.remove(css.nonScroll);
    };
  }, []);

  return (
    <div className={css.overlay} onClick={() => close()}>
      <div className={css.dialog} onClick={e => e.stopPropagation()}>
        <div className={css.formContainer}>
          <div className={css.formLine}>
            <div className={css.fieldTitle}>Priority Fee</div>
            <div className={css.inputWrapper} onClick={() => inputRef.current?.focus()}>
              <input
                className={css.input}
                autoFocus
                ref={inputRef}
                type="number"
                min="0"
                placeholder="0"
                value={priorityFee}
                onChange={e => setPriorityFee(e.target.value)}
              />
              <div>SOL</div>
            </div>
          </div>
          <div className={css.formLine}>
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={jitoMode}
                onChange={e => setJitoMode(e.target.checked)}
                style={{ marginRight: "8px" }}
              />
              Use Jito Block Engine
            </label>
          </div>
          <div className={css.formLine}>
            <button className={css.saveButton} onClick={() => save({ priorityFee, jitoMode })}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}