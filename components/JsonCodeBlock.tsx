"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

type JsonCodeBlockProps = {
  value: string;
  ariaLabel: string;
  emptyText?: string;
  copyValue?: string;
  compact?: boolean;
};

type TokenType = "key" | "string" | "number" | "boolean" | "null" | "punctuation";

const tokenPattern =
  /"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?(?:[eE][+\-]?\d+)?|true|false|null|[{}\[\]:,]/g;

function tokenTypeFor(line: string, token: string, tokenIndex: number) {
  if (/^[{}\[\]:,]$/.test(token)) {
    return "punctuation" as TokenType;
  }

  if (token === "true" || token === "false") {
    return "boolean" as TokenType;
  }

  if (token === "null") {
    return "null" as TokenType;
  }

  if (/^-?\d/.test(token)) {
    return "number" as TokenType;
  }

  const remainder = line.slice(tokenIndex + token.length);
  return remainder.trimStart().startsWith(":") ? "key" : "string";
}

function renderJsonLine(line: string, lineIndex: number) {
  const tokens: ReactNode[] = [];
  let lastIndex = 0;
  let tokenCount = 0;

  for (const match of line.matchAll(tokenPattern)) {
    const token = match[0];
    const startIndex = match.index ?? 0;

    if (startIndex > lastIndex) {
      tokens.push(
        <span key={`plain-${lineIndex}-${tokenCount}`}>
          {line.slice(lastIndex, startIndex)}
        </span>
      );
    }

    tokens.push(
      <span
        key={`token-${lineIndex}-${tokenCount}`}
        className={`json-token json-token-${tokenTypeFor(line, token, startIndex)}`}
      >
        {token}
      </span>
    );

    lastIndex = startIndex + token.length;
    tokenCount += 1;
  }

  if (lastIndex < line.length) {
    tokens.push(<span key={`tail-${lineIndex}`}>{line.slice(lastIndex)}</span>);
  }

  if (tokens.length === 0) {
    tokens.push(<span key={`empty-${lineIndex}`}> </span>);
  }

  return tokens;
}

export function JsonCodeBlock({
  value,
  ariaLabel,
  emptyText = "No JSON yet.",
  copyValue,
  compact = false
}: JsonCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const displayValue = value.trim() ? value : emptyText;
  const lineCount = displayValue.split("\n").length;

  async function handleCopy() {
    await navigator.clipboard.writeText(copyValue ?? value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className={`json-code-surface${compact ? " is-compact" : ""}`}>
      <div className="json-code-toolbar">
        <div className="json-code-meta">
          <span className="json-code-badge">JSON</span>
          <span>{lineCount} lines</span>
        </div>
        <Button size="sm" type="button" variant="ghost" onClick={handleCopy}>
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <div className="json-code-frame" aria-label={ariaLabel} role="region">
        <div className="json-code-gutter" aria-hidden="true">
          {displayValue.split("\n").map((_, index) => (
            <span key={`line-${index + 1}`}>{index + 1}</span>
          ))}
        </div>
        <pre className="json-code-block">
          <code>
            {displayValue.split("\n").map((line, index) => (
              <span className="json-code-line" key={`code-line-${index + 1}`}>
                {renderJsonLine(line, index)}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
