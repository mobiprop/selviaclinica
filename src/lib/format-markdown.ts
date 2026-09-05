function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inline(text: string) {
  return text
    .replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1 py-0.5 text-[0.85em]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

/**
 * Minimal markdown -> HTML for chat responses: paragraphs, bullet/numbered
 * lists, **bold**, and `code`. Input is HTML-escaped first, so the output is
 * safe to render via dangerouslySetInnerHTML even though the source text
 * comes from a model response.
 */
export function renderLiteMarkdown(text: string): string {
  const lines = escapeHtml(text).split("\n");
  const parts: string[] = [];
  let listItems: string[] = [];
  let listType: "ul" | "ol" | null = null;

  function flushList() {
    if (listItems.length > 0 && listType) {
      const listClass = listType === "ul" ? "list-disc" : "list-decimal";
      parts.push(`<${listType} class="${listClass} list-inside my-1 space-y-0.5">${listItems.join("")}</${listType}>`);
    }
    listItems = [];
    listType = null;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const bulletMatch = /^[-*]\s+(.*)/.exec(line);
    const numberedMatch = /^\d+\.\s+(.*)/.exec(line);

    if (bulletMatch) {
      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }
      listItems.push(`<li>${inline(bulletMatch[1])}</li>`);
      continue;
    }
    if (numberedMatch) {
      if (listType !== "ol") {
        flushList();
        listType = "ol";
      }
      listItems.push(`<li>${inline(numberedMatch[1])}</li>`);
      continue;
    }

    flushList();
    if (line === "") continue;
    parts.push(`<p class="my-1 first:mt-0 last:mb-0">${inline(line)}</p>`);
  }
  flushList();

  return parts.join("");
}
