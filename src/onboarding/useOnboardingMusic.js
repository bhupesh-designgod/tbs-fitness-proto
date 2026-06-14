// ── Onboarding ambient music engine ──
// Generates a cinematic synth soundtrack using Web Audio API.
// Warm pads, sub-bass pulses, filtered atmosphere — builds with progress.
// Truly royalty-free: it's just math.

import { useRef, useCallback, useEffect, useState } from 'react';

// Musical constants
const NOTES = {
  A2: 110, C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196,
  A3: 220, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392,
  A4: 440, C5: 523.25, E5: 659.25,
};

// Chord progression — cinematic, aspirational (Am → F → C → G)
const CHORDS = [
  { root: NOTES.A2, notes: [NOTES.A3, NOTES.C4, NOTES.E4] },       // Am
  { root: NOTES.F3, notes: [NOTES.F3, NOTES.A3, NOTES.C4] },       // F
  { root: NOTES.C3, notes: [NOTES.C3, NOTES.E3, NOTES.G3] },       // C
  { root: NOTES.G3, notes: [NOTES.G3, NOTES.D4, NOTES.G4] },       // G
];

const CHORD_DUR = 4; // seconds per chord

export default function useOnboardingMusic() {
  const ctxRef = useRef(null);
  const masterRef = useRef(null);
  const nodesRef = useRef([]);
  const loopRef = useRef(null);
  const chordIdx = useRef(0);
  const [muted, setMuted] = useState(true); // start muted — user opts in
  const startedRef = useRef(false);
  const progressRef = useRef(0);

  // Create a warm pad oscillator
  const createPad = useCallback((ctx, freq, dest, detuneCents = 0) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.detune.value = detuneCents;

    const gain = ctx.createGain();
    gain.gain.value = 0;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    filter.Q.value = 0.7;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start();

    return { osc, gain, filter };
  }, []);

  // Create filtered noise for atmosphere
  const createAtmosphere = useCallback((ctx, dest) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 0.5;

    const gain = ctx.createGain();
    gain.gain.value = 0.06;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    source.start();

    return { source, gain, filter };
  }, []);

  // Play a chord transition
  const playChord = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || ctx.state === 'closed') return;

    const chord = CHORDS[chordIdx.current % CHORDS.length];
    const now = ctx.currentTime;
    const intensity = progressRef.current; // 0..1

    // Update existing pad nodes
    const pads = nodesRef.current.filter(n => n.type === 'pad');
    pads.forEach((pad, i) => {
      const targetFreq = i === 0 ? chord.root : (chord.notes[i - 1] || chord.notes[0]);
      pad.osc.frequency.exponentialRampToValueAtTime(targetFreq, now + 1.2);
      pad.filter.frequency.linearRampToValueAtTime(600 + intensity * 600, now + 0.8);

      // Swell envelope
      const vol = (i === 0 ? 0.08 : 0.04) + intensity * 0.03;
      pad.gain.gain.linearRampToValueAtTime(vol, now + 1.5);
    });

    // Update atmosphere intensity
    const atmo = nodesRef.current.find(n => n.type === 'atmo');
    if (atmo) {
      atmo.filter.frequency.linearRampToValueAtTime(300 + intensity * 500, now + 1);
      atmo.gain.gain.linearRampToValueAtTime(0.04 + intensity * 0.04, now + 1);
    }

    chordIdx.current++;
  }, []);

  // Initialize the audio engine
  const init = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;

      // Master gain (for mute)
      const master = ctx.createGain();
      master.gain.value = 0; // start silent, fade in
      master.connect(ctx.destination);
      masterRef.current = master;

      // Compressor for smooth dynamics
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.ratio.value = 4;
      compressor.connect(master);

      // Create 4 pad voices (root + 3 chord tones) with slight detune for warmth
      const chord = CHORDS[0];
      const allFreqs = [chord.root, ...chord.notes];
      allFreqs.forEach((freq, i) => {
        const pad = createPad(ctx, freq, compressor, (i - 1.5) * 6);
        const vol = i === 0 ? 0.08 : 0.04;
        pad.gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 2);
        nodesRef.current.push({ ...pad, type: 'pad' });
      });

      // Add a second layer of triangle waves for shimmer
      allFreqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = freq * 2; // octave up
        osc.detune.value = (i - 1) * 8;

        const gain = ctx.createGain();
        gain.gain.value = 0;
        gain.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 3);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(compressor);
        osc.start();

        nodesRef.current.push({ osc, gain, filter, type: 'shimmer' });
      });

      // Atmosphere layer
      const atmo = createAtmosphere(ctx, compressor);
      nodesRef.current.push({ ...atmo, type: 'atmo' });

      // Sub-bass pulse (slow LFO on gain)
      const sub = ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.value = chord.root / 2;
      const subGain = ctx.createGain();
      subGain.gain.value = 0.06;
      const subFilter = ctx.createBiquadFilter();
      subFilter.type = 'lowpass';
      subFilter.frequency.value = 120;
      sub.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(compressor);
      sub.start();
      nodesRef.current.push({ osc: sub, gain: subGain, filter: subFilter, type: 'sub' });

      // Chord loop
      chordIdx.current = 1; // already played first chord
      loopRef.current = setInterval(playChord, CHORD_DUR * 1000);

      // Fade in master
      master.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 2);
    } catch {
      // Web Audio not supported
    }
  }, [createPad, createAtmosphere, playChord]);

  // Update intensity based on onboarding progress
  const setProgress = useCallback((p) => {
    progressRef.current = Math.min(1, Math.max(0, p));
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev;
      if (!next) {
        // Unmuting — start engine if needed
        if (!startedRef.current) init();
        const ctx = ctxRef.current;
        if (ctx && ctx.state === 'suspended') ctx.resume();
        if (masterRef.current) {
          masterRef.current.gain.linearRampToValueAtTime(0.7, (ctxRef.current?.currentTime || 0) + 0.5);
        }
      } else {
        // Muting
        if (masterRef.current && ctxRef.current) {
          masterRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 0.3);
        }
      }
      return next;
    });
  }, [init]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
      nodesRef.current.forEach(n => {
        try { n.osc?.stop(); } catch { /* already stopped */ }
        try { n.source?.stop(); } catch { /* already stopped */ }
      });
      nodesRef.current = [];
      try { ctxRef.current?.close(); } catch { /* already closed */ }
      startedRef.current = false;
    };
  }, []);

  return { muted, toggleMute, setProgress };
}
