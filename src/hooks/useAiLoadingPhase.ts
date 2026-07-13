import { useCallback, useState } from "react";
import type { AiLoadingPhase } from "../components/AiLoadingState";

export function useAiLoadingPhase() {
  const [phase, setPhase] = useState<AiLoadingPhase | null>(null);

  const startAnalyzing = useCallback(() => {
    setPhase("analyzing");
  }, []);

  const startGenerating = useCallback(() => {
    setPhase("generating");
  }, []);

  const stop = useCallback(() => {
    setPhase(null);
  }, []);

  const isLoading = phase !== null;

  return {
    phase,
    isLoading,
    startAnalyzing,
    startGenerating,
    stop,
  };
}
