import { useUIStore } from "../src/store/use-ui-store";

// Helper to play a beep sound
export function playBeep() {
  const { enableSounds } = useUIStore.getState();
  if (!enableSounds) return;

  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = "sine";
    oscillator.frequency.value = 800; // Frequency in Hz
    gainNode.gain.value = 0.1; // Volume

    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioCtx.close();
    }, 100); // Duration in ms
  } catch (e) {
    console.error("Failed to play sound:", e);
  }
}

// Helper to trigger haptic feedback
export function triggerHaptic() {
  const { enableHaptics } = useUIStore.getState();
  if (!enableHaptics) return;

  if ("vibrate" in navigator) {
    navigator.vibrate([50]); // Vibrate for 50ms
  }
}

export function triggerFeedback() {
  playBeep();
  triggerHaptic();
}
