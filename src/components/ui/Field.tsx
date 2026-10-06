import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

const CONTROL_CLASSES =
  "h-control w-full rounded-control bg-surface-muted px-3 text-body text-ink placeholder:text-ink-subtle outline-none focus:ring-2 focus:ring-primary";

type FieldShellProps = {
  label: ReactNode;
  htmlFor: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
};

function FieldShell({ label, htmlFor, error, hint, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="px-1 text-footnote font-medium text-ink-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p className="px-1 text-footnote text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="px-1 text-footnote text-ink-subtle">{hint}</p>
      ) : null}
    </div>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
  name: string;
  error?: string;
  hint?: ReactNode;
  suffix?: string;
};

export function TextField({
  label,
  name,
  id,
  error,
  hint,
  suffix,
  className = "",
  ...props
}: TextFieldProps) {
  const inputId = id ?? `field-${name}`;
  return (
    <FieldShell label={label} htmlFor={inputId} error={error} hint={hint}>
      <div className="relative">
        <input
          id={inputId}
          name={name}
          aria-invalid={error ? true : undefined}
          className={`${CONTROL_CLASSES} ${suffix ? "pr-12" : ""} ${error ? "ring-2 ring-danger" : ""} ${className}`}
          {...props}
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-callout text-ink-muted">
            {suffix}
          </span>
        ) : null}
      </div>
    </FieldShell>
  );
}

/** Champ numérique adapté au mobile (clavier décimal, virgule acceptée côté serveur). */
export function NumberField(props: Omit<TextFieldProps, "type">) {
  return <TextField type="text" inputMode="decimal" autoComplete="off" {...props} />;
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: ReactNode;
  name: string;
  error?: string;
  hint?: ReactNode;
  options: { value: string; label: string }[];
};

export function SelectField({
  label,
  name,
  id,
  error,
  hint,
  options,
  className = "",
  ...props
}: SelectFieldProps) {
  const selectId = id ?? `field-${name}`;
  return (
    <FieldShell label={label} htmlFor={selectId} error={error} hint={hint}>
      <select
        id={selectId}
        name={name}
        className={`${CONTROL_CLASSES} appearance-none ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

type ChoiceOption = { value: string; label: string; description?: string };

/** Groupe de choix exclusifs (boutons radio stylés en pastilles ou en cartes). */
export function ChoiceGroup({
  label,
  name,
  options,
  defaultValue,
  layout = "row",
  error,
}: {
  label?: ReactNode;
  name: string;
  options: ChoiceOption[];
  defaultValue?: string;
  layout?: "row" | "stack";
  error?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      {label ? (
        <legend className="mb-1.5 px-1 text-footnote font-medium text-ink-muted">
          {label}
        </legend>
      ) : null}
      <div className={layout === "row" ? "flex flex-wrap gap-2" : "flex flex-col gap-2"}>
        {options.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={option.value === defaultValue}
              className="peer sr-only"
            />
            <span
              className={[
                "block rounded-control border border-line bg-surface text-ink transition-colors",
                "peer-checked:border-primary peer-checked:bg-primary-soft peer-checked:text-primary",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-primary",
                layout === "row" ? "px-4 py-2 text-callout font-medium" : "px-4 py-3",
              ].join(" ")}
            >
              <span className={layout === "stack" ? "block text-headline" : ""}>
                {option.label}
              </span>
              {option.description ? (
                <span className="mt-0.5 block text-footnote text-ink-muted">
                  {option.description}
                </span>
              ) : null}
            </span>
          </label>
        ))}
      </div>
      {error ? (
        <p className="px-1 text-footnote text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/** Champ de recherche contrôlé (filtrage instantané côté navigateur). */
export function SearchInput({
  value,
  onChange,
  placeholder = "Rechercher",
  label = "Rechercher",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}) {
  return (
    <div className="relative">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="pointer-events-none absolute inset-y-0 left-3 my-auto size-5 stroke-ink-subtle"
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
      >
        <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4" />
      </svg>
      <input
        type="search"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`${CONTROL_CLASSES} pl-10`}
      />
    </div>
  );
}
