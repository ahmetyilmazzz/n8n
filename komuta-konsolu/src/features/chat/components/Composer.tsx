import * as React from "react";
import type { UploadedFile } from "../../files/lib/upload";
import { AttachmentButton } from "../../files/components/AttachmentButton";

type Props = {
  onSendMessage: (text: string) => void;
  onFileUpload: (files: FileList) => void;
  onPasteImage: () => void;
  onRemoveFile: (fileId: string) => void;
  uploadedFiles: UploadedFile[];
  selectedModel?: string;
  isLoading?: boolean;
};

export function Composer({
  onSendMessage,
  onFileUpload,
  onPasteImage,
  onRemoveFile,
  uploadedFiles,
  selectedModel,
  isLoading,
}: Props) {
  const [text, setText] = React.useState("");

  const trySend = () => {
    const t = text.trim();
    if (!t) return;
    onSendMessage(t);
    setText("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      trySend();
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 border-t border-neutral-800 bg-[#0c0c0c]/90 backdrop-blur">
      {/* seçili dosyalar */}
      {uploadedFiles.length > 0 && (
        <div className="mx-auto max-w-3xl px-4 pt-3">
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((f) => (
              <span
                key={f.id}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-300"
                title={`${f.name} • ${(f.size / 1024).toFixed(1)}KB`}
              >
                {f.name}
                <button
                  onClick={() => onRemoveFile(f.id)}
                  className="rounded-full border border-neutral-700 px-1 leading-none hover:bg-neutral-800"
                  title="Kaldır"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 py-3">
        <div className="composer flex items-end gap-2 rounded-2xl border border-neutral-800 bg-[#121212] px-3 py-2">
          {/* ataç */}
          <AttachmentButton onPick={onFileUpload} />

          {/* metin alanı */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={selectedModel ? `${selectedModel} ile konuş…` : "Mesaj yazın…"}
            rows={1}
            className="min-h-[40px] max-h-40 flex-1 resize-none bg-transparent p-2 outline-none text-neutral-100 placeholder:text-neutral-500"
          />

          {/* panodan resim */}
          <button
            onClick={onPasteImage}
            className="h-9 px-2 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-sm"
            title="Panodan resim yapıştır"
            type="button"
          >
            🖼️
          </button>

          {/* gönder */}
          <button
            onClick={trySend}
            disabled={isLoading}
            className="h-9 px-3 rounded-xl border border-neutral-800 bg-neutral-100 text-neutral-900 hover:bg-white disabled:opacity-50"
            title="Ctrl/Cmd + Enter"
            type="button"
          >
            Gönder
          </button>
        </div>

        <div className="mt-1 text-[11px] text-neutral-500">
          Kısayol: <kbd className="rounded border border-neutral-700 px-1">Ctrl</kbd>/<kbd className="rounded border border-neutral-700 px-1">⌘</kbd>{" "}
          + <kbd className="rounded border border-neutral-700 px-1">Enter</kbd>
        </div>
      </div>
    </div>
  );
}
