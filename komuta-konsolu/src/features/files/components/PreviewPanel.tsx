import * as React from "react";
import type { FileMeta } from "../../../types/attachments";
import { sniff, isTextLikeMime } from "../lib/file-sniff";

type Props = {
  open: boolean;
  file: FileMeta | null;
  onClose: () => void;
};

/**
 * Sağ çekme paneli (Sheet):
 *  - Text: büyük içerik için kaydırılabilir <pre>
 *  - Image: <img>
 *  - PDF: şimdilik yeni sekmede aç bağlantısı
 *  - Diğer: indir bağlantısı
 */
export default function PreviewPanel({ open, file, onClose }: Props) {
  React.useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  return (
    <>
      {/* backdrop */}
      <div
        className={[
          "fixed inset-0 bg-black/40 transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={onClose}
      />
      {/* sheet */}
      <aside
        className={[
          "fixed top-0 right-0 h-full w-full sm:w-[560px] bg-[#0e0e0e] border-l border-neutral-800",
          "transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full",
          "flex flex-col",
        ].join(" ")}
      >
        <header className="flex items-center justify-between px-4 h-12 border-b border-neutral-800">
          <div className="text-sm text-neutral-300 truncate">{file?.name ?? "Önizleme"}</div>
          <div className="flex items-center gap-2">
            {file?.url && (
              <a
                href={file.url}
                download={file.name}
                className="text-xs rounded border border-neutral-700 px-2 py-1 hover:bg-neutral-900 text-neutral-200"
              >
                İndir
              </a>
            )}
            <button
              onClick={onClose}
              className="text-xs rounded border border-neutral-700 px-2 py-1 hover:bg-neutral-900 text-neutral-200"
            >
              Kapat
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {file ? <FileBody file={file} /> : <EmptyState />}
        </div>
      </aside>
    </>
  );
}

function FileBody({ file }: { file: FileMeta }) {
  const mime = (file.mime || "").toLowerCase();
  const isImg = /^image\//.test(mime);
  const isPdf = mime === "application/pdf";
  const isText = isTextLikeMime(mime) && !!file.text;

  if (isImg && file.url) {
    return (
      <div className="p-4">
        <img src={file.url} alt={file.name} className="max-w-full rounded-lg border border-neutral-800" />
      </div>
    );
  }

  if (isPdf && file.url) {
    return (
      <div className="p-4 text-sm text-neutral-400">
        PDF basit görüntüleme. (İlerde react-pdf eklenebilir)
        <div className="mt-2">
          <a href={file.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
            Yeni sekmede aç
          </a>
        </div>
      </div>
    );
  }

  if (isText && file.text) {
    const { lineCount } = sniff(file.text);
    return (
      <div className="p-4">
        <div className="mb-2 text-xs text-neutral-400">
          {lineCount} satır • {file.mime}
          <button
            className="ml-3 underline underline-offset-2 hover:text-neutral-200"
            onClick={() => copyText(file.text!)}
          >
            Kopyala
          </button>
        </div>
        <pre className="text-[12px] leading-5 whitespace-pre-wrap bg-[#111] rounded-lg border border-neutral-800 p-3 overflow-auto">
{file.text}
        </pre>
      </div>
    );
  }

  return (
    <div className="p-4 text-sm text-neutral-300">
      Bu dosya türü için yerleşik önizleme yok.
      {file.url && (
        <div className="mt-2">
          <a href={file.url} download={file.name} className="underline underline-offset-2">
            İndir
          </a>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full grid place-items-center text-neutral-500 text-sm">
      Önizlenecek dosya yok
    </div>
  );
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // no-op
  }
}