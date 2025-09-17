// src/components/chat/EmptyState.tsx
import { SUGGESTIONS } from '@/lib/constants';

type Props = {
  onSuggestionClick: (suggestion: string) => void;
};

export const EmptyState = ({ onSuggestionClick }: Props) => (
  <div className="empty-suggestions">
    {SUGGESTIONS.map((suggestion, index) => (
      <div 
        key={index}
        className="suggestion-card"
        onClick={() => onSuggestionClick(suggestion)}
      >
        {suggestion}
      </div>
    ))}
  </div>
);