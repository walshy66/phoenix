export interface CarouselInteractionState {
  isAutoRotating: boolean;
  lastInteractionAt: number;
}

export function getNextIndex(currentIndex: number, itemCount: number): number {
  if (itemCount <= 0) return 0;
  return (currentIndex + 1) % itemCount;
}

export function getPrevIndex(currentIndex: number, itemCount: number): number {
  if (itemCount <= 0) return 0;
  return (currentIndex - 1 + itemCount) % itemCount;
}

export function onManualNavigation(state: CarouselInteractionState, interactionTs: number): CarouselInteractionState {
  return {
    ...state,
    isAutoRotating: false,
    lastInteractionAt: interactionTs,
  };
}

export function shouldResumeAutoRotation(lastInteractionAt: number, now: number, resumeDelayMs: number): boolean {
  return now - lastInteractionAt > resumeDelayMs;
}
