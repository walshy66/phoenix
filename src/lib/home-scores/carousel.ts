export interface CarouselInteractionState {
  isAutoRotating: boolean;
  lastInteractionAt: number;
}

const MELBOURNE_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Australia/Melbourne',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function getMelbourneIsoDate(now = new Date()): string {
  return MELBOURNE_DATE_FORMATTER.format(now);
}

export function getSlidesPerView(viewportWidth: number): number {
  if (viewportWidth >= 1024) return 3;
  if (viewportWidth >= 768) return 2;
  return 1;
}

export function getMaxCarouselIndex(itemCount: number, slidesPerView: number): number {
  return Math.max(0, itemCount - Math.max(1, slidesPerView));
}

export function getNextIndex(currentIndex: number, itemCount: number, slidesPerView = 1): number {
  const maxIndex = getMaxCarouselIndex(itemCount, slidesPerView);
  if (maxIndex <= 0) return 0;
  return currentIndex >= maxIndex ? 0 : currentIndex + 1;
}

export function getPrevIndex(currentIndex: number, itemCount: number, slidesPerView = 1): number {
  const maxIndex = getMaxCarouselIndex(itemCount, slidesPerView);
  if (maxIndex <= 0) return 0;
  return currentIndex <= 0 ? maxIndex : currentIndex - 1;
}

export function getInitialCarouselIndex(
  kickoffDates: Array<string | null | undefined>,
  slidesPerView: number,
  now = new Date(),
): number {
  const today = getMelbourneIsoDate(now);
  const firstTodayOrUpcoming = kickoffDates.findIndex((date) => typeof date === 'string' && date >= today);
  const targetIndex = firstTodayOrUpcoming >= 0 ? firstTodayOrUpcoming : 0;
  return Math.min(targetIndex, getMaxCarouselIndex(kickoffDates.length, slidesPerView));
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
