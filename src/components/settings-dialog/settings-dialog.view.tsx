import { useEffect, useRef } from "react";
import { useSettingsForm } from "./settings-dialog.model";
import * as css from "./settings-dialog.css";

export const SettingsDialog = () => {
  const { priorityFee, setPriorityFee, isOpen, save, close } = useSettingsForm();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.classList.add(css.nonScroll);
    return () => {
      document.body.classList.remove(css.nonScroll);
    };
  }, []);

  if (!isOpen) {
    return;
  }

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
            <button className={css.saveButton} onClick={() => save({ priorityFee })}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}