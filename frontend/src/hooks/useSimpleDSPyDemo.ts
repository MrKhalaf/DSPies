/**
 * Simplified hook for the educational DSPy demo
 * Transforms backend events into easy-to-understand variant states
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { apiService } from '../services/api';
import { Event, EventType } from '../types';

export interface SimpleVariant {
  id: string;
  name: string;
  prompt: string;
  output?: {
    category: string;
    summary: string;
  };
  score?: number;
  scoreBreakdown?: {
    label_valid: number;
    label_match: number;
    summary_len_ok: number;
    no_hedging: number;
    format_ok: number;
  };
  latency_ms?: number;
}

interface SimpleState {
  variants: SimpleVariant[];
  isRunning: boolean;
  winner?: string;
  currentInput?: string;
}

export function useSimpleDSPyDemo() {
  const [state, setState] = useState<SimpleState>({
    variants: [],
    isRunning: false
  });
  const [error, setError] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  const startOptimization = useCallback(async (inputText: string) => {
    try {
      setError(null);
      setState({
        variants: [
          {
            id: 'V1',
            name: 'Direct & Formal',
            prompt: 'Classify the text into one of the provided categories and write a concise summary.\n\nAvailable categories: billing, technical, cancellation, urgent, other\n\nInstructions: Classify the text into one of the provided categories and write a concise summary.\n\nText to classify: ' + inputText
          },
          {
            id: 'V2',
            name: 'Conversational & Helpful',
            prompt: 'Help classify this customer message and summarize what they need.\n\nAvailable categories: billing, technical, cancellation, urgent, other\n\nInstructions: Help classify this customer message and summarize what they need.\n\nText to classify: ' + inputText
          },
          {
            id: 'V3',
            name: 'Analytical & Detailed',
            prompt: 'Analyze the text to determine the primary intent category and provide a factual summary.\n\nAvailable categories: billing, technical, cancellation, urgent, other\n\nInstructions: Analyze the text to determine the primary intent category and provide a factual summary.\n\nText to classify: ' + inputText
          }
        ],
        isRunning: true,
        currentInput: inputText
      });

      // Create the run
      const runResponse = await apiService.createRun({ input_text: inputText });

      // Start streaming events
      const cleanup = apiService.streamRunEvents(
        runResponse.run_id,
        (event: Event) => handleEvent(event),
        (streamError) => {
          console.error('Stream error:', streamError.message);
          setError(streamError.message);
          setState(prev => ({ ...prev, isRunning: false }));
        }
      );

      cleanupRef.current = cleanup;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      setState(prev => ({ ...prev, isRunning: false }));
    }
  }, []);

  const handleEvent = useCallback((event: Event) => {
    console.log('Event received:', event.type, event.payload);

    setState(prev => {
      const newState = { ...prev };

      switch (event.type) {
        case EventType.VARIANT_OUTPUT:
          const { variant_id, output, latency_ms } = event.payload;
          newState.variants = newState.variants.map(v => {
            if (v.id === variant_id) {
              return {
                ...v,
                output: output ? {
                  category: output.category,
                  summary: output.summary
                } : undefined,
                latency_ms
              };
            }
            return v;
          });
          break;

        case EventType.VARIANT_SCORED:
          const { variant_id: scoredId, score } = event.payload;
          newState.variants = newState.variants.map(v => {
            if (v.id === scoredId) {
              return {
                ...v,
                score: score.total,
                scoreBreakdown: {
                  label_valid: score.components.label_valid,
                  label_match: score.components.label_match,
                  summary_len_ok: score.components.summary_len_ok,
                  no_hedging: score.components.no_hedging,
                  format_ok: score.components.format_ok
                }
              };
            }
            return v;
          });
          break;

        case EventType.RUN_COMPLETE:
          const { winner_variant_id } = event.payload;
          newState.winner = winner_variant_id;
          newState.isRunning = false;

          // Cleanup stream
          if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
          }
          break;

        case EventType.ERROR:
          console.error('Received error event:', event.payload);
          newState.isRunning = false;
          setError(event.payload.error || 'Unknown error occurred');
          break;
      }

      return newState;
    });
  }, []);

  const reset = useCallback(() => {
    // Cleanup any active streams
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    setState({
      variants: [],
      isRunning: false
    });
    setError(null);
  }, []);

  return {
    variants: state.variants,
    isRunning: state.isRunning,
    winner: state.winner,
    error,
    startOptimization,
    reset
  };
}
