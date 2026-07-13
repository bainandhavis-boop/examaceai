import { cn } from "../lib/utils";

export type AiLoadingPhase = "analyzing" | "generating";

export const DEFAULT_AI_LOADING_LABELS = {
  analyzing: "Analyzing Question...",
  generating: "Generating Solution...",
} as const;

export type AiLoadingLabels = {
  analyzing: string;
  generating: string;
};

type AiLoadingSpinnerProps = {
  className?: string;
};

export function AiLoadingSpinner({ className }: AiLoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600",
        className
      )}
      aria-hidden="true"
    />
  );
}

type AiLoadingButtonContentProps = {
  label: string;
  spinnerClassName?: string;
};

export function AiLoadingButtonContent({
  label,
  spinnerClassName,
}: AiLoadingButtonContentProps) {
  return (
    <span className="flex items-center justify-center gap-2">
      <AiLoadingSpinner
        className={cn("border-white/30 border-t-white", spinnerClassName)}
      />
      <span>{label}</span>
    </span>
  );
}

type AiLoadingStateProps = {
  phase: AiLoadingPhase;
  labels?: AiLoadingLabels;
  className?: string;
};

function StepItem({
  step,
  label,
  active,
  complete,
}: {
  step: number;
  label: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active && "bg-white/80 text-gray-900 font-medium shadow-sm",
        complete && !active && "text-green-700",
        !active && !complete && "text-gray-500"
      )}
      aria-current={active ? "step" : undefined}
    >
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          active && "bg-gradient-to-r from-blue-600 to-green-600 text-white",
          complete && !active && "bg-green-100 text-green-700",
          !active && !complete && "bg-gray-100 text-gray-500"
        )}
      >
        {complete && !active ? "✓" : step}
      </span>
      <span className="leading-snug">{label}</span>
    </li>
  );
}

export function AiLoadingState({
  phase,
  labels = DEFAULT_AI_LOADING_LABELS,
  className,
}: AiLoadingStateProps) {
  const currentLabel =
    phase === "analyzing" ? labels.analyzing : labels.generating;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={currentLabel}
      className={cn(
        "rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-5",
        className
      )}
    >
      <div className="mb-4 flex items-center gap-3">
        <AiLoadingSpinner />
        <p className="text-sm font-medium text-gray-900 md:text-base">{currentLabel}</p>
      </div>

      <ol className="space-y-2" aria-label="AI processing steps">
        <StepItem
          step={1}
          label={labels.analyzing}
          active={phase === "analyzing"}
          complete={phase === "generating"}
        />
        <StepItem
          step={2}
          label={labels.generating}
          active={phase === "generating"}
          complete={false}
        />
      </ol>
    </div>
  );
}
