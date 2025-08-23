/**
 * React hook for managing optimization runs and real-time events.
 * Handles the complete optimization lifecycle with state management.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { OptimizationState, VariantCardState, Event, EventType, RunStatus } from '../types';
import { apiService } from '../services/api';

interface UseOptimizationReturn {
  state: OptimizationState;
  startOptimization: (inputText: string) => Promise<void>;
  replay: () => void;
  toggleInternals: () => void;
  reset: () => void;
  error: string | null;
}

const initialState: OptimizationState = {
  status: 'idle',
  variants: [],
  progress: 0,
  showInternals: false,
};

export function useOptimization(): UseOptimizationReturn {
  const [state, setState] = useState<OptimizationState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const replayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      if (replayTimeoutRef.current) {
        clearTimeout(replayTimeoutRef.current);
      }
    };
  }, []);

  const startOptimization = useCallback(async (inputText: string) => {
    try {
      setError(null);
      setState(prev => ({ ...prev, status: 'compiling', variants: [], progress: 0 }));

      // Create the run
      const runResponse = await apiService.createRun({ input_text: inputText });
      
      // Start streaming events
      const cleanup = apiService.streamRunEvents(
        runResponse.run_id,
        handleEvent,
        (streamError) => {
          console.error('Stream error:', streamError.message);
          // Only set error if we're not already complete
          setState(prev => {
            if (prev.status !== 'complete') {
              setError(streamError.message);
              return { ...prev, status: 'error' };
            }
            return prev;
          });
        }
      );
      
      cleanupRef.current = cleanup;

      // Fetch initial run data
      const runData = await apiService.getRun(runResponse.run_id);
      setState(prev => ({ 
        ...prev, 
        currentRun: runData,
        status: 'running'
      }));

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      setState(prev => ({ ...prev, status: 'error' }));
    }
  }, []);

  const handleEvent = useCallback((event: Event) => {
    console.log('Processing event:', event.type, event.payload);
    
    setState(prev => {
      const newState = { ...prev };

      switch (event.type) {
        case EventType.VARIANT_START:
          const { variant_id, prompt_spec } = event.payload;
          console.log(`Adding variant ${variant_id}`);
          
          const newVariant: VariantCardState = {
            variant: {
              variant_id,
              prompt_spec,
            },
            state: 'querying'
          };
          
          // Add or update variant
          const existingIndex = newState.variants.findIndex(v => v.variant.variant_id === variant_id);
          if (existingIndex >= 0) {
            newState.variants[existingIndex] = newVariant;
          } else {
            newState.variants = [...newState.variants, newVariant];
          }
          console.log(`Variants after adding ${variant_id}:`, newState.variants.map(v => v.variant.variant_id));
          break;

        case EventType.VARIANT_OUTPUT:
          const { variant_id: outputVariantId, output, latency_ms, error: variantError } = event.payload;
          newState.variants = newState.variants.map(v => {
            if (v.variant.variant_id === outputVariantId) {
              return {
                ...v,
                variant: {
                  ...v.variant,
                  output,
                  latency_ms,
                  error: variantError
                },
                state: variantError ? 'error' : 'output'
              };
            }
            return v;
          });
          break;

        case EventType.VARIANT_SCORED:
          const { variant_id: scoredVariantId, score } = event.payload;
          newState.variants = newState.variants.map(v => {
            if (v.variant.variant_id === scoredVariantId) {
              return {
                ...v,
                score,
                state: 'scored'
              };
            }
            return v;
          });
          break;

        case EventType.LEADER_CHANGE:
          const { new_leader } = event.payload;
          newState.leader = new_leader;
          break;

        case EventType.RUN_COMPLETE:
          const { winner_variant_id } = event.payload;
          console.log(`Run complete, winner: ${winner_variant_id}`);
          newState.status = 'complete';
          newState.progress = 100;
          newState.leader = winner_variant_id;
          
          // Cleanup stream
          if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
          }
          break;

        case EventType.ERROR:
          console.error('Received error event:', event.payload);
          newState.status = 'error';
          setError(event.payload.error || 'Unknown error occurred');
          break;
      }

      // Update progress based on completed variants
      const completedVariants = newState.variants.filter(v => 
        v.state === 'scored' || v.state === 'error'
      ).length;
      const totalVariants = Math.max(newState.variants.length, 3); // Assume at least 3 variants
      
      if (newState.status === 'complete') {
        newState.progress = 100;
      } else {
        newState.progress = Math.min((completedVariants / totalVariants) * 90, 90); // Cap at 90% until complete
      }
      
      console.log(`Progress update: ${completedVariants}/${totalVariants} variants complete, progress: ${newState.progress}%`);

      return newState;
    });
  }, []);

  const replay = useCallback(async () => {
    if (!state.currentRun) return;

    try {
      const replayData = await apiService.getReplayData(state.currentRun.run_id);
      
      // Reset to initial state
      setState(prev => ({
        ...prev,
        status: 'compiling',
        variants: [],
        progress: 0,
        leader: undefined
      }));

      // Replay events at 1.25x speed
      const replaySpeed = 1.25;
      let eventIndex = 0;

      const replayNextEvent = () => {
        if (eventIndex >= replayData.events.length) {
          return;
        }

        const event = replayData.events[eventIndex];
        handleEvent(event);
        eventIndex++;

        if (eventIndex < replayData.events.length) {
          const nextEvent = replayData.events[eventIndex];
          const delay = Math.max((nextEvent.ts - event.ts) / replaySpeed, 50); // Minimum 50ms delay
          
          replayTimeoutRef.current = setTimeout(replayNextEvent, delay);
        }
      };

      // Start replay after a short delay
      replayTimeoutRef.current = setTimeout(replayNextEvent, 500);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Replay failed';
      setError(message);
    }
  }, [state.currentRun, handleEvent]);

  const toggleInternals = useCallback(() => {
    setState(prev => ({ ...prev, showInternals: !prev.showInternals }));
  }, []);

  const reset = useCallback(() => {
    // Cleanup any active streams or timeouts
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    if (replayTimeoutRef.current) {
      clearTimeout(replayTimeoutRef.current);
      replayTimeoutRef.current = null;
    }

    setState(initialState);
    setError(null);
  }, []);

  return {
    state,
    startOptimization,
    replay,
    toggleInternals,
    reset,
    error
  };
}