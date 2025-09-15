import * as React from "react";
import type { Capability, ModelInfo } from "@/types/model";
import { listModels } from "@/features/models/lib/models";

type Props = {
  /** Seçili model id (ör. "gpt-4o-mini") */
  value?: string;
  /** Seçim değiştiğinde tetiklenir */
  onChange: (modelId: string, model?: ModelInfo | undefined) => void;

  /** Tek ya da çoklu capability filtresi (örn. "function_call" ya da ["image","function_call"]) */
  requiredCapability?: Capability | Capability[];

  /** Uyuşmayanları gizle (default: true). false olursa disabled option olarak gösterilir. */
  hideIncompatible?: boolean;

  /** Dışarıdan model listesi geçmek istersen (fetch devre dışı kalır) */
  models?: ModelInfo[];

  /** Listedeki modeller dışında, elle model id girilebilsin mi? (default: false) */
  allowCustomId?: boolean;

  /** Tailwind class */
  className?: string;
};

export default function ModelPicker({
  value,
  onChange,
  requiredCapability,
  hideIncompatible = true,
  models: modelsProp,
  allowCustomId = false,
  className,
}: Props) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [models, setModels] = React.useState<ModelInfo[]>(modelsProp ?? []);
  const [customId, setCustomId] = React.useState("");

  const needsFetch = !modelsProp;

  const refresh = React.useCallback(async () => {
    if (!needsFetch) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listModels();
      // Basit normalize: id/provider/label zorunlu kabul edelim
      const sane = (Array.isArray(data) ? data : []).filter(
        (m: any) => typeof m?.id === "string" && typeof m?.provider === "string"
      ) as ModelInfo[];
      setModels(sane);
    } catch (e: any) {
      setError(e?.message || "Modeller alınamadı");
    } finally {
      setLoading(false);
    }
  }, [needsFetch]);

  React.useEffect(() => {
    if (!needsFetch) return;
    refresh();
  }, [needsFetch, refresh]);

  // capability filtresi
  const required = Array.isArray(requiredCapability)
    ? requiredCapability
    : requiredCapability
    ? [requiredCapability]
    : [];

  const supportsRequired = (m: ModelInfo) =>
    required.length === 0 ||
    required.every((cap) => m.capabilities?.includes(cap));

  // Sağlam ve okunur bir sıralama: önce provider, sonra label
  const sorted = React.useMemo(() => {
    const source = modelsProp ?? models;
    const arr = [...source];
    arr.sort((a, b) => {
      if (a.provider === b.provider) return (a.label || a.id).localeCompare(b.label || b.id);
      return a.provider.localeCompare(b.provider);
    });
    return arr;
  }, [modelsProp, models]);

  const groups = React.useMemo(() => {
    const g = new Map<string, ModelInfo[]>();
    for (const m of sorted) {
      const ok = supportsRequired(m);
      if (!ok && hideIncompatible) continue;
      const list = g.get(m.provider) ?? [];
      list.push(m);
      g.set(m.provider, list);
    }
    return g;
  }, [sorted, hideIncompatible]);

  const currentModel =
    (modelsProp ?? models).find((m) => m.id === value) || undefined;

  const handleSelect = (id: string) => {
    const m =
      (modelsProp ?? models).find((x) => x.id === id) ||
      undefined;
    onChange(id, m);
  };

  const disabled = loading;

  return (
    <div className={["flex items-center gap-2", className].filter(Boolean).join(" ")}>
      <div className="flex flex-col">
        <label className="text-xs text-neutral-400 mb-1">Model</label>
        <div className="flex items-center gap-2">
          <select
            value={value ?? ""}
            onChange={(e) => handleSelect(e.target.value)}
            disabled={disabled}
            className="min-w-64 appearance-none rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:ring-2 focus:ring-neutral-600"
          >
            <option value="" disabled>
              {loading ? "Yükleniyor..." : "Bir model seçin"}
            </option>

            {[...groups.entries()].map(([provider, list]) => (
              <optgroup key={provider} label={provider.toUpperCase()}>
                {list.map((m) => {
                  const ok = supportsRequired(m);
                  return (
                    <option
                      key={m.id}
                      value={m.id}
                      disabled={!ok && !hideIncompatible}
                      title={(m.capabilities || []).join(", ")}
                    >
                      {(m.label || m.id) +
                        (ok ? "" : " (uyumsuz)")}
                    </option>
                  );
                })}
              </optgroup>
            ))}
          </select>

          <button
            type="button"
            onClick={refresh}
            disabled={!needsFetch || loading}
            className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-900 disabled:opacity-50"
            title="Listeyi yenile"
          >
            Yenile
          </button>
        </div>

        {error && (
          <p className="mt-1 text-xs text-red-400">⚠️ {error}</p>
        )}

        {currentModel && (
          <div className="mt-1 flex flex-wrap gap-1">
            {(currentModel.capabilities || []).map((c) => (
              <span
                key={c}
                className="text-[10px] rounded border border-neutral-700 px-1.5 py-0.5 text-neutral-300"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {allowCustomId && (
        <div className="flex flex-col">
          <label className="text-xs text-neutral-400 mb-1">Elle ID</label>
          <div className="flex items-center gap-2">
            <input
              value={customId}
              onChange={(e) => setCustomId(e.target.value)}
              placeholder="sağlayıcı:model-id"
              className="w-56 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:ring-2 focus:ring-neutral-600"
            />
            <button
              type="button"
              onClick={() => {
                if (!customId.trim()) return;
                onChange(customId.trim(), undefined);
              }}
              className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-900"
            >
              Kullan
            </button>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Listede yoksa ID’yi elle girip kullanabilirsin.
          </p>
        </div>
      )}
    </div>
  );
}
