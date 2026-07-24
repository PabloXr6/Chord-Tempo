"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

export const useMetronomeEngine = (audioUrl = null, initialOffset = 0) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBPM] = useState(120);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [volume, setVolume] = useState(70);
  const [musicVolume, setMusicVolume] = useState(100);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [offset, setOffset] = useState(initialOffset);
  
  const audioContextRef = useRef(null);
  const audioTrackRef = useRef(null);
  const nextNoteTimeRef = useRef(0);
  const tapTimesRef = useRef([]);
  const beatRef = useRef(0);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (audioUrl) {
      if (audioTrackRef.current) {
        audioTrackRef.current.pause();
        audioTrackRef.current = null;
      }
      const audio = new Audio(audioUrl);
      audio.preload = "auto";
      audioTrackRef.current = audio;
    }
    return () => {
      if (audioTrackRef.current) {
        audioTrackRef.current.pause();
        audioTrackRef.current = null;
      }
    };
  }, [audioUrl]); 

  const playClick = useCallback((time, beat) => {
    if (!audioContextRef.current) return;
    const osc = audioContextRef.current.createOscillator();
    const envelope = audioContextRef.current.createGain();
    osc.frequency.value = beat === 0 ? 1000 : 800;
    envelope.gain.value = volume / 100;
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    osc.connect(envelope);
    envelope.connect(audioContextRef.current.destination);
    osc.start(time);
    osc.stop(time + 0.1);
  }, [volume]);

  const scheduler = useCallback(() => {
    while (nextNoteTimeRef.current < audioContextRef.current.currentTime + 0.1) {
      const beatsPerMeasure = parseInt(timeSignature.split('/')[0]);
      playClick(nextNoteTimeRef.current, beatRef.current);
      const secondsPerBeat = 60.0 / bpm;
      nextNoteTimeRef.current += secondsPerBeat;
      beatRef.current = (beatRef.current + 1) % beatsPerMeasure;
      setCurrentBeat(beatRef.current);
    }
  }, [bpm, timeSignature, playClick]);

  useEffect(() => {
    let timerID;
    const tick = () => {
      if (isPlaying) {
        scheduler();
        timerID = requestAnimationFrame(tick);
      }
    };
    if (isPlaying) {
      timerID = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(timerID);
    }
    return () => cancelAnimationFrame(timerID);
  }, [isPlaying, scheduler]);

  const play = useCallback(() => {
    initAudio();
    if (isPlaying) return;

    if (audioTrackRef.current) {
      audioTrackRef.current.play().catch(e => console.error("Playback error:", e));
    }
    // Pesan error kuning dihapus dari sini karena kita memang tidak pakai lagu mp3

    const offsetInSeconds = offset / 1000;
    nextNoteTimeRef.current = audioContextRef.current.currentTime + 0.05 + offsetInSeconds;
    
    beatRef.current = 0;
    setCurrentBeat(0);
    setIsPlaying(true);
  }, [initAudio, isPlaying, offset]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (audioTrackRef.current) audioTrackRef.current.pause();
  }, []);

  const stop = useCallback(() => {
    setIsPlaying(false);
    if (audioTrackRef.current) {
      audioTrackRef.current.pause();
      audioTrackRef.current.currentTime = 0;
    }
    beatRef.current = 0;
    setCurrentBeat(0);
  }, []);

  useEffect(() => {
    if (audioTrackRef.current) {
      audioTrackRef.current.volume = musicVolume / 100;
    }
  }, [musicVolume]);

  const tapTempo = useCallback(() => {
    const now = performance.now();
    tapTimesRef.current.push(now);
    if (tapTimesRef.current.length > 4) tapTimesRef.current.shift();
    if (tapTimesRef.current.length >= 2) {
      const intervals = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i-1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
      const newBPM = Math.round(60000 / avgInterval);
      if (newBPM >= 30 && newBPM <= 300) setBPM(newBPM);
    }
  }, []);

  return {
    isPlaying, play, pause, stop,
    bpm, setBPM,
    timeSignature, setTimeSignature,
    volume, setVolume,
    musicVolume, setMusicVolume,
    offset, setOffset,
    currentBeat, tapTempo
  };
};