/**
 * Dosya içeriği için basit analiz yardımcıları
 * - isTextLikeMime: MIME text benzeri mi?
 * - sniff: satır sayısı + 30 satır kuralına göre panel kararı
 */

/** MIME text-benzeri mi? */
export function isTextLikeMime(mime?: string): boolean {
  const m = (mime || "").toLowerCase();
  return (
    /^text\//.test(m) ||
    /json|markdown|xml|yaml|yml|javascript|typescript|html|css/.test(m) ||
    /^application\/(json|xml)/.test(m)
  );
}

/** İçerikteki satır sayısı + panel kararı (≤30 inline, >30 panel) */
export function sniff(content: string | undefined | null) {
  const text = typeof content === "string" ? content : "";
  const lineCount = text ? text.split(/\r?\n/).length : 0;
  const openInPanel = lineCount > 30;
  return { lineCount, openInPanel };
}
