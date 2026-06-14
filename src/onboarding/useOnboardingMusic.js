// ── Onboarding ambient music engine (v2 — fitness-premium) ──
// Driving yet elegant: rhythmic pulse, arpeggiated synths, sidechained pads.
// Think WHOOP commercial / Apple Fitness+ intro — active but premium.
// Truly royalty-free: generated in real-time from code.

import { useRef, useCallback, useEffect, useState } from 'react';

const BPM = 124;
const BEAT = 60 / BPM;  // ~0.484s per beat

// Notes
const N = {
  E2: 82.41, G2: 98, B2: 123.47, D3: 146.83,
  E3: 164.81, G3: 196, A3: 220, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, G4: 392, B4: 493.88,
};

// Chord progression — powerful, uplifting (Em → C → G → D)
const CHORDS = [
  { root: N.E2, mid: [N.E3, N.G3, N.B3],    arp: [N.E4, N.G4, N.B4, N.G4] },
  { root: N.G2, mid: [N.E3, N.G3, N.C4],    arp: [N.C4, N.E4, N.G4, N.E4] },
  { root: N.G2, mid: [N.G3, N.B3, N.D4],    arp: [N.D4, N.G4, N.B4, N.G4] },
  { root: N.D3, mid: [N.D3, N.A3, N.D4],    arp: [N.D4, N.G4, N.B4, N.G4] },
];

const BARS_PER_CHORD = 2; // 2 bars (8 beats) per chord

export default function useOnboardingMusic() {
  const ctxRef = useRef(null);
  const masterRef = useRef(null);
  const schedulerRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const startedRef = useRef(false);
  const progressRef = useRef(0);
  const beatRef = useRef(0);
  const nextBeatTimeRef = useRef(0);
  const nodesRef = useRef({ pads: [], sub: null, atmo: null });

  // ── Utility: create a filtered oscillator ──
  const makeOsc = useCallback((ctx, type, freq, dest, vol = 0.05) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = vol;
    osc.connect(g);
    g.connect(dest);
    osc.start();
    return { osc, gain: g };
  }, []);

  // ── Schedule a single percussion hit ──
  const scheduleKick = useCallback((ctx, time, dest) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.08);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.18, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;

    osc.connect(filter);
    filter.connect(g);
    g.connect(dest);
    osc.start(time);
    osc.stop(time + 0.3);
  }, []);

  const scheduleHihat = useCallback((ctx, time, dest, loud = false) => {
    const bufSize = ctx.sampleRate * 0.04;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;

    const g = ctx.createGain();
    g.gain.setValueAtTime(loud ? 0.06 : 0.03, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + (loud ? 0.06 : 0.035));

    src.connect(hp);
    hp.connect(g);
    g.connect(dest);
    src.start(time);
    src.stop(time + 0.08);
  }, []);

  // ── Schedule an arp note ──
  const scheduleArp = useCallback((ctx, time, freq, dest, intensity) => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800 + intensity * 2500, time);
    filter.frequency.exponentialRampToValueAtTime(400, time + BEAT * 0.8);
    filter.Q.value = 2;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.04 + intensity * 0.02, time);
    g.gain.linearRampToValueAtTime(0, time + BEAT * 0.9);

    osc.connect(filter);
    filter.connect(g);
    g.connect(dest);
    osc.start(time);
    osc.stop(time + BEAT);
  }, []);

  // ── Beat scheduler (runs ahead of time) ──
  const scheduleBeat = useCallback((ctx, compressor) => {
    const beat = beatRef.current;
    const time = nextBeatTimeRef.current;
    const intensity = progressRef.current;
    const chordIdx = Math.floor(beat / (BARS_PER_CHORD * 4)) % CHORDS.length;
    const chord = CHORDS[chordIdx];
    const beatInBar = beat % 4;

    // Kick: beats 0 and 2 (four-on-floor feels too EDM, half-time is premium)
    if (beatInBar === 0 || (beatInBar === 2 && intensity > 0.3)) {
      scheduleKick(ctx, time, compressor);
    }

    // Hi-hat: 8th notes once intensity builds
    if (intensity > 0.15) {
      scheduleHihat(ctx, time, compressor, beatInBar === 0);
      if (intensity > 0.4) {
        scheduleHihat(ctx, time + BEAT * 0.5, compressor, false);
      }
    }

    // Arp: 16th-note pattern on each beat (once past early screens)
    if (intensity > 0.2) {
      const arpNote = chord.arp[beatInBar % chord.arp.length];
      scheduleArp(ctx, time, arpNote, compressor, intensity);
    }

    // Update pad frequencies on chord changes
    if (beatInBar === 0 && (beat % (BARS_PER_CHORD * 4)) === 0) {
      const pads = nodesRef.current.pads;
      pads.forEach((p, idx) => {
        const targetFreq = idx === 0 ? chord.root : chord.mid[idx - 1];
        if (targetFreq) {
          p.osc.frequency.exponentialRampToValueAtTime(targetFreq, time + 0.6);
        }
      });
      // Update sub
      if (nodesRef.current.sub) {
        nodesRef.current.sub.osc.frequency.exponentialRampToValueAtTime(chord.root, time + 0.3);
      }
    }

    // Sidechain pump on pads (duck on kick)
    if (beatInBar === 0) {
      const pads = nodesRef.current.pads;
      pads.forEach(p => {
        const baseVol = 0.04 + intensity * 0.02;
        p.gain.gain.setValueAtTime(baseVol * 0.3, time);
        p.gain.gain.linearRampToValueAtTime(baseVol, time + BEAT * 0.7);
      });
    }

    // Update atmosphere filter with intensity
    if (nodesRef.current.atmo) {
      nodesRef.current.atmo.filter.frequency.linearRampToValueAtTime(
        400 + intensity * 800, time + BEAT
      );
      nodesRef.current.atmo.gain.gain.linearRampToValueAtTime(
        0.025 + intensity * 0.03, time + BEAT
      );
    }

    beatRef.current++;
    nextBeatTimeRef.current += BEAT;
  }, [scheduleKick, scheduleHihat, scheduleArp]);

  // ── Initialize engine ──
  const init = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;

      // Master gain
      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      masterRef.current = master;

      // Compressor
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.ratio.value = 4;
      comp.attack.value = 0.003;
      comp.release.value = 0.15;
      comp.connect(master);

      // ── Pads: warm filtered saws ──
      const chord = CHORDS[0];
      const padFreqs = [chord.root, ...chord.mid];
      nodesRef.current.pads = padFreqs.map((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx === 0 ? 'sine' : 'sawtooth';
        osc.frequency.value = freq;
        osc.detune.value = (idx - 1.5) * 7;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = idx === 0 ? 300 : 700;
        filter.Q.value = 0.5;

        const g = ctx.createGain();
        g.gain.value = idx === 0 ? 0.06 : 0.035;

        osc.connect(filter);
        filter.connect(g);
        g.connect(comp);
        osc.start();

        return { osc, gain: g, filter };
      });

      // ── Sub bass ──
      const sub = makeOsc(ctx, 'sine', chord.root, comp, 0.08);
      const subFilter = ctx.createBiquadFilter();
      subFilter.type = 'lowpass';
      subFilter.frequency.value = 100;
      sub.osc.disconnect();
      sub.osc.connect(subFilter);
      subFilter.connect(sub.gain);
      nodesRef.current.sub = { ...sub, filter: subFilter };

      // ── Atmosphere: filtered noise ──
      const bufSize = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let j = 0; j < bufSize; j++) data[j] = (Math.random() * 2 - 1) * 0.12;
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = buf;
      noiseSrc.loop = true;
      const nFilter = ctx.createBiquadFilter();
      nFilter.type = 'bandpass';
      nFilter.frequency.value = 500;
      nFilter.Q.value = 0.3;
      const nGain = ctx.createGain();
      nGain.gain.value = 0.025;
      noiseSrc.connect(nFilter);
      nFilter.connect(nGain);
      nGain.connect(comp);
      noiseSrc.start();
      nodesRef.current.atmo = { source: noiseSrc, filter: nFilter, gain: nGain };

      // ── Start scheduler ──
      beatRef.current = 0;
      nextBeatTimeRef.current = ctx.currentTime + 0.1;

      const lookahead = () => {
        while (nextBeatTimeRef.current < ctx.currentTime + 0.15) {
          scheduleBeat(ctx, comp);
        }
      };

      schedulerRef.current = setInterval(lookahead, 25);

      // Fade in
      master.gain.linearRampToValueAtTime(0.65, ctx.currentTime + 1.5);
    } catch {
      // Web Audio not supported
    }
  }, [makeOsc, scheduleBeat]);

  // Update intensity
  const setProgress = useCallback((p) => {
    progressRef.current = Math.min(1, Math.max(0, p));
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev;
      if (!next) {
        if (!startedRef.current) init();
        const ctx = ctxRef.current;
        if (ctx?.state === 'suspended') ctx.resume();
        if (masterRef.current && ctx) {
          masterRef.current.gain.linearRampToValueAtTime(0.65, ctx.currentTime + 0.5);
        }
      } else {
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
      if (schedulerRef.current) clearInterval(schedulerRef.current);
      const nodes = nodesRef.current;
      nodes.pads.forEach(p => { try { p.osc.stop(); } catch {} });
      try { nodes.sub?.osc.stop(); } catch {}
      try { nodes.atmo?.source.stop(); } catch {}
      nodesRef.current = { pads: [], sub: null, atmo: null };
      try { ctxRef.current?.close(); } catch {}
      startedRef.current = false;
    };
  }, []);

  return { muted, toggleMute, setProgress };
}
