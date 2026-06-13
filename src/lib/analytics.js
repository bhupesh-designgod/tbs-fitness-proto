// ── Lightweight analytics ──
// Prototype-grade event tracking. Logs to console and buffers on window so
// flows like onboarding drop-off can be inspected. Swap the sink for a real
// provider (Segment/Amplitude/etc.) without touching call sites.

export function track(event, props = {}) {
  const payload = { event, ts: Date.now(), ...props };
  if (typeof window !== 'undefined') {
    window.__tbsEvents = window.__tbsEvents || [];
    window.__tbsEvents.push(payload);
  }
  // eslint-disable-next-line no-console
  console.log(`[analytics] ${event}`, props);
}
