import * as React from "react";
import type { Message } from "../../../types/message";
import type { FileMeta } from "../../../types/attachments";
import { sniff, isTextLikeMime } from "../../files/lib/file-sniff";

type Props = {
  messages: Message[];
  onExpandAttachment: (file: FileMeta) => void; // paneli açtırmak için
  className?: string;
};

/**
 * Basit mesaj listesi:
 * - Kullanıcı balonu koyu, asistan balonu daha açık.
 * - Text dosyaları: 30 satırdan kısaysa inline, fazlaysa panelde açılır.
 */
export default function MessageList({ messages, onExpandAttachment, className }: Props) {
  return (
    <div className={["w-full max-w-3xl mx-auto px-4 py-6 space-y-3", className].filter(Boolean).join(" ")}>
      {messages.map((m) => (
        <MessageItem key={m.id} msg={m} onExpandAttachment={onExpandAttachment} />
      ))}
    </div>
  );
}

function MessageItem({
  msg,
  onExpandAttachment,
}: {
  msg: Message;
  onExpandAttachment: (f: FileMeta) => void;
}) {
  const isUser = msg.role === "user";
  return (
    <div className={["flex", isUser ? "justify-end" : "justify-start"].join(" ")}>
      <div
        className={[
          "max-w-[85%] rounded-2xl border px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-[#0f0f0f] border-neutral-800 text-neutral-100"
            : "bg-[#1a1a1a] border-neutral-800 text-neutral-100",
        ].join(" ")}
      >
        {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}

        {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {msg.attachments.map((f: FileMeta) => (
              <AttachmentInline key={f.id} file={f} onExpand={onExpandAttachment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AttachmentInline({
  file,
  onExpand,
}: {
  file: FileMeta;
  onExpand: (f: FileMeta) => void;
}) {
  const mime = (file.mime || "").toLowerCase();
  const isText = isTextLikeMime(mime) && !!file.text;

  if (isText && file.text) {
    const { lineCount, openInPanel } = sniff(file.text);
    if (openInPanel) {
      return (
        <button
          onClick={() => onExpand(file)}
          className="w-full text-left rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-900 px-3 py-2"
          title={`${file.name} • ${lineCount} satır (panelde aç)`}
        >
          <div className="text-xs text-neutral-400 mb-1">
            {file.name} • {lineCount} satır
          </div>
          <div className="text-neutral-200">Uzun içerik — panelde görüntülemek için tıkla.</div>
        </button>
      );
    }
    // inline render (≤30 satır)
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 text-xs text-neutral-400">
          <span>
            {file.name} • {lineCount} satır
          </span>
          <button
            className="underline underline-offset-2 hover:text-neutral-200"
            onClick={() => onExpand(file)}
          >
            Panelde aç
          </button>
        </div>
        <pre className="max-h-80 overflow-auto px-3 py-2 text-[12px] leading-5 whitespace-pre-wrap text-neutral-100">
{file.text}
        </pre>
      </div>
    );
  }

  // text değilse küçük kart + panel
  return (
    <button
      onClick={() => onExpand(file)}
      className="w-full text-left rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-900 px-3 py-2"
      title={`${file.name} • ${Math.round((file.size || 0) / 1024)} KB`}
    >
      <div className="text-xs text-neutral-400 mb-1">{file.name}</div>
      <div className="text-neutral-200">Önizleme panelinde aç</div>
    </button>
  );
}