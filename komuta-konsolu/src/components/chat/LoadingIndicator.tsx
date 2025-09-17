// src/components/chat/LoadingIndicator.tsx
import { AIModel, AIProvider } from "@/lib/types";
import { TIER_ICONS } from "@/lib/ai-config";

type Props = {
  provider: AIProvider;
  activeModel?: AIModel;
}

export const LoadingIndicator = ({ provider, activeModel }: Props) => (
  <div className="loading-message">
    <div className="loading-icon">🤖</div>
    <div className="loading-text">AI Düşünüyor...</div>
    <div className="loading-dots">
      <div className="loading-dot"></div>
      <div className="loading-dot"></div>
      <div className="loading-dot"></div>
    </div>
    <div className="loading-model">
      {TIER_ICONS[activeModel?.tier || 'balanced']} {provider.toUpperCase()} - {activeModel?.name}
    </div>
  </div>
);