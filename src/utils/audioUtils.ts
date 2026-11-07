import confetti from 'canvas-confetti';

/**
 * Tiện ích Âm thanh và Hiệu ứng Lễ Tốt nghiệp (Ceremony Audio & Stage Effects)
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Phát tiếng chuông lễ hội (Prestigious graduation bell chime / fanfare gong)
 */
export function playCeremonyChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Chuỗi nốt vinh danh: C5, G5, C6 (523Hz, 784Hz, 1046Hz)
    const notes = [523.25, 783.99, 1046.5];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 2.0);
    });
  } catch {
    // Audio context may be restricted by browser policy before user interaction
  }
}

/**
 * Đọc tên tân cử nhân / kỹ sư lên bục nhận bằng (Vietnamese Speech Synthesis)
 */
export function announceStudentSpeech(fullName: string, major: string, title: string = 'Tân cử nhân'): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel(); // Dừng câu thoại cũ nếu có

    const text = `Kính mời ${title} ${fullName}, ngành ${major}, tiến lên bục danh dự nhận bằng tốt nghiệp.`;
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = 'vi-VN';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    // Tìm giọng tiếng Việt nếu có trong hệ thống
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.includes('vi') || v.lang.includes('VN'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech error
  }
}

/**
 * Bắn pháo hoa giấy rực rỡ khi trao bằng tốt nghiệp
 */
export function triggerDiplomaConfetti(): void {
  try {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#f59e0b', '#3b82f6', '#ffffff', '#10b981'],
    });
    fire(0.2, {
      spread: 60,
      colors: ['#ffd700', '#1e40af', '#e11d48'],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#f59e0b', '#ffffff', '#2563eb'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#fbbf24', '#38bdf8'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#ffd700', '#60a5fa'],
    });
  } catch {
    // Fallback if canvas-confetti is not available
  }
}
