// src/components/chat/ErrorDisplay.tsx

type Props = {
  error: string;
};

export const ErrorDisplay = ({ error }: Props) => (
  <div className="error-message">
    ⚠️ <strong>HATA:</strong> {error}
  </div>
);