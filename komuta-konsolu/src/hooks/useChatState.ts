import { useState } from 'react';
import { AIProvider, AIModel } from '@/types';
import { AI_MODELS } from '@/constants/models';

export const useChatState = () => {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('claude');
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20241022');

  const availableModels = AI_MODELS.filter(model => model.provider === selectedProvider);
  
  const activeModel = AI_MODELS.find(m => m.id === selectedModel);

  const handleProviderChange = (provider: AIProvider) => {
    setSelectedProvider(provider);
    const firstModel = AI_MODELS.find(m => m.provider === provider);
    if (firstModel) {
      setSelectedModel(firstModel.id);
    }
  };

  return {
    selectedProvider,
    selectedModel,
    availableModels,
    activeModel,
    setSelectedProvider,
    setSelectedModel,
    handleProviderChange
  };
};