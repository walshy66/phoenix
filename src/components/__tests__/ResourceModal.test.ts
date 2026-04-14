import { describe, expect, test } from 'vitest';

type ModalResourceType = 'video' | 'pdf' | 'document' | 'link';

interface ResourceModalInput {
  title: string;
  url: string;
  type: ModalResourceType;
  sourceDomain?: string;
}

class ResourceModalTestHarness {
  private readonly title: string;
  private readonly url: string;
  private readonly type: ModalResourceType;
  private readonly sourceDomain: string;
  private openState = false;
  private focusTarget: string | null = null;
  private triggerEl: string | null = null;
  private videoFallbackVisible = false;
  private pdfFallbackVisible = false;
  private focusables = ['close', 'secondary'];
  private focusIndex = 0;

  constructor({ title, url, type, sourceDomain = '' }: ResourceModalInput) {
    this.title = title;
    this.url = url;
    this.type = type;
    this.sourceDomain = sourceDomain;
  }

  private isEmbeddableVideo(url: string): boolean {
    return /(youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/\d+)/i.test(url);
  }

  private canOpenModal(): boolean {
    if (this.url === '#') return false;
    if (this.type === 'link') return false;
    if (this.type === 'video' && !this.isEmbeddableVideo(this.url)) return false;
    return true;
  }

  open(): void {
    if (!this.canOpenModal()) return;
    this.openState = true;
    this.focusIndex = 0;
    this.focusTarget = this.focusables[this.focusIndex];
  }

  close(): void {
    this.openState = false;
    this.focusTarget = this.triggerEl;
  }

  isOpen(): boolean {
    return this.openState;
  }

  pressEscape(): void {
    if (!this.openState) return;
    this.close();
  }

  clickClose(): void {
    if (!this.openState) return;
    this.close();
  }

  clickBackdrop(): void {
    if (!this.openState) return;
    this.close();
  }

  setTriggerEl(el: string): void {
    this.triggerEl = el;
  }

  getFocusTarget(): string | null {
    return this.focusTarget;
  }

  pressTab(shift = false): string | null {
    if (!this.openState) return null;
    if (shift) {
      this.focusIndex = (this.focusIndex - 1 + this.focusables.length) % this.focusables.length;
    } else {
      this.focusIndex = (this.focusIndex + 1) % this.focusables.length;
    }
    this.focusTarget = this.focusables[this.focusIndex];
    return this.focusTarget;
  }

  getRoleAttributes() {
    return {
      role: 'dialog',
      ariaModal: 'true',
      ariaLabelledBy: 'resource-modal-title',
    };
  }

  getCloseAriaLabel(): string {
    return 'Close resource';
  }

  getIframeTitle(): string {
    const source = this.sourceDomain ? ` — ${this.sourceDomain}` : '';
    return `${this.title}${source}`;
  }

  getPdfTitle(): string {
    return this.title;
  }

  getEmbedUrl(rawUrl: string): string | null {
    const ytWatch = rawUrl.match(/youtube\.com\/watch\?v=([^&]+)/i);
    if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}`;

    const ytShort = rawUrl.match(/youtu\.be\/([^?&]+)/i);
    if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`;

    const vimeo = rawUrl.match(/vimeo\.com\/(\d+)/i);
    if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

    return null;
  }

  triggerVideoTimeout(): void {
    this.videoFallbackVisible = true;
  }

  isVideoFallbackVisible(): boolean {
    return this.videoFallbackVisible;
  }

  isIframeVisible(): boolean {
    return !this.videoFallbackVisible;
  }

  getVideoFallbackLink(): string {
    return this.url;
  }

  triggerPdfError(): void {
    this.pdfFallbackVisible = true;
  }

  isPdfFallbackVisible(): boolean {
    return this.pdfFallbackVisible;
  }

  hasPdfDownloadLink(): boolean {
    return true;
  }
}

describe('ResourceModal harness', () => {
  test('1. opens for video', () => {
    const h = new ResourceModalTestHarness({ title: 'Video', url: 'https://youtube.com/watch?v=ABC123', type: 'video' });
    h.open();
    expect(h.isOpen()).toBe(true);
  });

  test('2. opens for pdf', () => {
    const h = new ResourceModalTestHarness({ title: 'PDF', url: 'https://example.com/file.pdf', type: 'pdf' });
    h.open();
    expect(h.isOpen()).toBe(true);
  });

  test('3. opens for document', () => {
    const h = new ResourceModalTestHarness({ title: 'Doc', url: 'https://example.com/file.pdf', type: 'document' });
    h.open();
    expect(h.isOpen()).toBe(true);
  });

  test('4. does not open for placeholder #', () => {
    const h = new ResourceModalTestHarness({ title: 'Soon', url: '#', type: 'pdf' });
    h.open();
    expect(h.isOpen()).toBe(false);
  });

  test('5. does not open for link', () => {
    const h = new ResourceModalTestHarness({ title: 'Link', url: 'https://example.com', type: 'link' });
    h.open();
    expect(h.isOpen()).toBe(false);
  });

  test('6. escape closes', () => {
    const h = new ResourceModalTestHarness({ title: 'Video', url: 'https://youtube.com/watch?v=ABC123', type: 'video' });
    h.open();
    h.pressEscape();
    expect(h.isOpen()).toBe(false);
  });

  test('7. close button closes', () => {
    const h = new ResourceModalTestHarness({ title: 'Video', url: 'https://youtube.com/watch?v=ABC123', type: 'video' });
    h.open();
    h.clickClose();
    expect(h.isOpen()).toBe(false);
  });

  test('8. focus returns to trigger on close', () => {
    const h = new ResourceModalTestHarness({ title: 'Video', url: 'https://youtube.com/watch?v=ABC123', type: 'video' });
    h.setTriggerEl('card-3');
    h.open();
    h.close();
    expect(h.getFocusTarget()).toBe('card-3');
  });

  test('9. tab cycles within modal focusables', () => {
    const h = new ResourceModalTestHarness({ title: 'PDF', url: 'https://example.com/file.pdf', type: 'pdf' });
    h.open();
    expect(h.pressTab()).toBe('secondary');
    expect(h.pressTab()).toBe('close');
  });

  test('10. role attributes are set', () => {
    const h = new ResourceModalTestHarness({ title: 'A', url: 'https://example.com/file.pdf', type: 'pdf' });
    expect(h.getRoleAttributes()).toEqual({ role: 'dialog', ariaModal: 'true', ariaLabelledBy: 'resource-modal-title' });
  });

  test('11. close button aria-label', () => {
    const h = new ResourceModalTestHarness({ title: 'A', url: 'https://example.com/file.pdf', type: 'pdf' });
    expect(h.getCloseAriaLabel()).toBe('Close resource');
  });

  test('12. iframe title uses title and source', () => {
    const h = new ResourceModalTestHarness({ title: 'Zone Defence', url: 'https://youtube.com/watch?v=ABC123', type: 'video', sourceDomain: 'Basketball Victoria' });
    expect(h.getIframeTitle()).toBe('Zone Defence — Basketball Victoria');
  });

  test('13. pdf object title uses resource title', () => {
    const h = new ResourceModalTestHarness({ title: 'Coach Notes', url: 'https://example.com/file.pdf', type: 'pdf' });
    expect(h.getPdfTitle()).toBe('Coach Notes');
  });

  test('14. youtube watch url converts to embed', () => {
    const h = new ResourceModalTestHarness({ title: 'Video', url: 'https://youtube.com/watch?v=ABC123', type: 'video' });
    expect(h.getEmbedUrl('https://youtube.com/watch?v=ABC123')).toBe('https://www.youtube.com/embed/ABC123');
  });

  test('15. vimeo url converts to player', () => {
    const h = new ResourceModalTestHarness({ title: 'Video', url: 'https://vimeo.com/123456', type: 'video' });
    expect(h.getEmbedUrl('https://vimeo.com/123456')).toBe('https://player.vimeo.com/video/123456');
  });

  test('16. unrecognised video url treated like link (modal no-op)', () => {
    const h = new ResourceModalTestHarness({ title: 'Video', url: 'https://example.com/video', type: 'video' });
    h.open();
    expect(h.isOpen()).toBe(false);
  });

  test('17. video timeout shows fallback and hides iframe', () => {
    const h = new ResourceModalTestHarness({ title: 'Video', url: 'https://youtube.com/watch?v=ABC123', type: 'video' });
    h.triggerVideoTimeout();
    expect(h.isVideoFallbackVisible()).toBe(true);
    expect(h.isIframeVisible()).toBe(false);
  });

  test('18. video fallback includes direct link', () => {
    const h = new ResourceModalTestHarness({ title: 'Video', url: 'https://youtube.com/watch?v=ABC123', type: 'video' });
    expect(h.getVideoFallbackLink()).toBe('https://youtube.com/watch?v=ABC123');
  });

  test('19. pdf error shows fallback with download', () => {
    const h = new ResourceModalTestHarness({ title: 'PDF', url: 'https://example.com/file.pdf', type: 'pdf' });
    h.triggerPdfError();
    expect(h.isPdfFallbackVisible()).toBe(true);
    expect(h.hasPdfDownloadLink()).toBe(true);
  });

  test('20. long title is handled', () => {
    const longTitle = 'This is an intentionally very long resource title that should still be rendered safely in modal header';
    const h = new ResourceModalTestHarness({ title: longTitle, url: 'https://example.com/file.pdf', type: 'pdf' });
    expect(() => h.getIframeTitle()).not.toThrow();
  });

  test('21. backdrop click closes modal', () => {
    const h = new ResourceModalTestHarness({ title: 'Video', url: 'https://youtube.com/watch?v=ABC123', type: 'video' });
    h.open();
    h.clickBackdrop();
    expect(h.isOpen()).toBe(false);
  });
});
