type SoundName = 'start' | 'build' | 'click' | 'incident' | 'notify' | 'success' | 'warning';

let audioContext: AudioContext | null = null;
let ambientOscillator: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;

export const startAudio = () => {
  const context = getAudioContext();
  if (context.state === 'suspended') void context.resume();
  startAmbient(context);
  playSound('start');
};

export const playSound = (name: SoundName) => {
  const context = getAudioContext();
  const now = context.currentTime;
  if (name === 'start') playTone(context, [392, 523, 659], now, 0.1, 0.16);
  if (name === 'build') playTone(context, [440, 660], now, 0.08, 0.12);
  if (name === 'click') playTone(context, [330], now, 0.05, 0.08);
  if (name === 'incident') playTone(context, [220, 196, 220], now, 0.12, 0.18);
  if (name === 'notify') playTone(context, [523, 659], now, 0.06, 0.1);
  if (name === 'success') playTone(context, [523, 659, 784], now, 0.07, 0.1);
  if (name === 'warning') playTone(context, [294, 247], now, 0.1, 0.14);
};

const getAudioContext = () => {
  audioContext ??= new AudioContext();
  return audioContext;
};

const startAmbient = (context: AudioContext) => {
  if (ambientOscillator || ambientGain) return;
  ambientGain = context.createGain();
  ambientGain.gain.setValueAtTime(0.018, context.currentTime);
  ambientOscillator = context.createOscillator();
  ambientOscillator.type = 'sine';
  ambientOscillator.frequency.setValueAtTime(164.81, context.currentTime);
  ambientOscillator.connect(ambientGain).connect(context.destination);
  ambientOscillator.start();
};

const playTone = (context: AudioContext, notes: number[], start: number, volume: number, step: number) => {
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const time = start + index * step;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, time);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + step);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(time);
    oscillator.stop(time + step + 0.02);
  });
};
