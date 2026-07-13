import { cn } from "../lib/utils";
import type { AppErrorContent } from "../lib/errors";

type InlineErrorProps = AppErrorContent & {
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
};

export function InlineError({
  title,
  body,
  onRetry,
  retryLabel = "Try again",
  className,
}: InlineErrorProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "rounded-xl border border-red-200 bg-red-50 p-4 md:p-5 text-left",
        className
      )}
    >
      <h3 className="text-sm font-semibold text-red-900 md:text-base">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-red-800">{body}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
