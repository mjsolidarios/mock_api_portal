"use client";

import { useMemo, useRef, useState } from "react";
import { AlertCircle, Check, Copy, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type JsonCodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  minRows?: number;
};

function getJsonError(value: string) {
  try {
    JSON.parse(value);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Invalid JSON.";
  }
}

export function JsonCodeEditor({
  value,
  onChange,
  ariaLabel,
  minRows = 14
}: JsonCodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const jsonError = useMemo(() => getJsonError(value), [value]);
  const lines = value.split("\n");

  function handleScroll() {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Tab") {
      event.preventDefault();
      const target = event.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const nextValue = `${value.slice(0, start)}  ${value.slice(end)}`;
      onChange(nextValue);
      window.requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2;
          textareaRef.current.selectionEnd = start + 2;
        }
      });
      return;
    }

    if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "f") {
      event.preventDefault();
      handleFormat();
    }
  }

  function handleFormat() {
    try {
      onChange(JSON.stringify(JSON.parse(value), null, 2));
    } catch {
      return;
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="json-editor-surface">
      <div className="json-code-toolbar">
        <div className="json-code-meta">
          <span className="json-code-badge">JSON</span>
          <span>{lines.length} lines</span>
          {jsonError ? (
            <span className="json-code-status json-code-status-error">
              <AlertCircle aria-hidden="true" />
              Invalid
            </span>
          ) : (
            <span className="json-code-status json-code-status-valid">
              <Check aria-hidden="true" />
              Valid
            </span>
          )}
        </div>
        <div className="json-code-actions">
          <Button
            size="sm"
            type="button"
            variant="ghost"
            onClick={handleFormat}
            disabled={Boolean(jsonError)}
            title="Format JSON (Ctrl/Cmd+Shift+F)"
          >
            <WandSparkles aria-hidden="true" />
            Format
          </Button>
          <Button size="sm" type="button" variant="ghost" onClick={handleCopy}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>
      <div className="json-editor-frame">
        <div className="json-code-gutter json-editor-gutter" aria-hidden="true" ref={gutterRef}>
          {lines.map((_, index) => (
            <span key={`editor-line-${index + 1}`}>{index + 1}</span>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          aria-label={ariaLabel}
          className="json-code-editor"
          rows={minRows}
          spellCheck={false}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
        />
      </div>
      <div className="json-code-footer">
        {jsonError ? jsonError : "Tab indents. Ctrl/Cmd+Shift+F formats the payload."}
      </div>
    </div>
  );
}
