import { Check, Circle } from "lucide-react";
import { passwordRules } from "../../validation/schemas";

// Live checklist under the password box: turns green as each rule is met
export default function PasswordChecklist({ value = "" }) {
  return (
    <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
      {passwordRules.map((rule) => {
        const ok = rule.test(value);
        return (
          <li key={rule.label} className={`flex items-center gap-1.5 text-xs ${ok ? "text-brand-700" : "text-slate-400"}`}>
            {ok ? <Check size={13} /> : <Circle size={11} />}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}