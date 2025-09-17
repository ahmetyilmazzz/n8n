// src/components/ui/TextArea.tsx
import React, { forwardRef } from 'react';

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>((props, ref) => (
  <textarea {...props} ref={ref} className="input-field" />
));

TextArea.displayName = 'TextArea';