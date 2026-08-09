/** Shared field + error styling so /login and /register can't drift apart. */
export function AuthField({
  label,
  name,
  type,
  autoComplete,
  minLength,
  hint,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  minLength?: number;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-[#3F3F46]">{label}</span>
      <input
        type={type}
        name={name}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        className="rounded-[9px] border border-[#DEDEDA] px-3.5 py-3 text-sm text-[#111] outline-none placeholder:text-[#A1A1A6] focus:border-[#0B7A6E]"
      />
      {hint && <span className="text-xs text-[#8A8A94]">{hint}</span>}
    </label>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="m-0 rounded-[9px] border border-[#F0D9D9] bg-[#FDF7F7] px-3.5 py-2.5 text-[13px] text-[#9F1239]"
    >
      {message}
    </p>
  );
}

export function AuthSubmit({
  pending,
  label,
  pendingLabel,
}: {
  pending: boolean;
  label: string;
  pendingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-[10px] bg-[#111] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
