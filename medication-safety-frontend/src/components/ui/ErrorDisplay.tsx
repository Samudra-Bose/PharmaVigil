import React from "react";
import { AlertCircle, RefreshCw, Copy, Check } from "lucide-react";
import { Button } from "./Button";

export interface ApiErrorPayload {
  code: string;
  message: string;
  requestId?: string;
  details?: Array<{ field?: string; message: string }>;
}

interface ErrorDisplayProps {
  error: ApiErrorPayload | Error | string | null;
  onRetry?: () => void;
  title?: string;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  title = "An error occurred",
  className = "",
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!error) return null;

  let message = "An unexpected error occurred.";
  let code = "ERROR";
  let requestId: string | undefined;
  let details: Array<{ field?: string; message: string }> | undefined;

  if (typeof error === "string") {
    message = error;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "object" && "message" in error) {
    message = error.message;
    code = error.code || "UNKNOWN_ERROR";
    requestId = error.requestId;
    details = error.details;
  }

  const copyDiagnostics = () => {
    const payload = JSON.stringify({ code, message, requestId }, null, 2);
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="alert"
      className={`p-4 rounded-lg border border-rose-200 bg-rose-50/70 text-rose-950 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-rose-900">{title}</h3>
          <p className="mt-1 text-xs text-rose-800 leading-relaxed">{message}</p>

          {details && details.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-rose-700 list-disc list-inside">
              {details.map((d, i) => (
                <li key={i}>
                  {d.field ? <span className="font-semibold font-mono">{d.field}: </span> : null}
                  {d.message}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-rose-200/60">
            <span className="font-mono text-[11px] bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded border border-rose-200">
              Code: {code}
            </span>
            {requestId && (
              <span className="font-mono text-[11px] text-rose-800/80">
                Req ID: <span className="font-semibold">{requestId}</span>
              </span>
            )}
            <button
              onClick={copyDiagnostics}
              className="inline-flex items-center text-[11px] text-rose-700 hover:text-rose-900 underline ml-auto gap-1"
              type="button"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied diagnostic" : "Copy details"}
            </button>
          </div>
        </div>
      </div>

      {onRetry && (
        <div className="mt-3 flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="border-rose-300 text-rose-800 hover:bg-rose-100/60 text-xs gap-1.5 h-7"
          >
            <RefreshCw className="w-3 h-3" />
            Retry Action
          </Button>
        </div>
      )}
    </div>
  );
};
