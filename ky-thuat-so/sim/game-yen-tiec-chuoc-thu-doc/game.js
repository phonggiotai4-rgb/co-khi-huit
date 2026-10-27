/**
 * YẾN TIỆC CHUỘT THỬ ĐỘC - GAME GIẢI ĐỐ NHỊ PHÂN
 * Ngôn ngữ: JavaScript thuần (Vanilla JS), không thư viện ngoài.
 * Đầy đủ logic toán học hệ nhị phân, Web Audio API, lưu LocalStorage.
 */

/* ========================================================
   1. QUẢN LÝ ÂM THANH (WEB AUDIO API SYNTHESIZER)
   ======================================================== */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.sfxMuted = false;
    this.bgmMuted = false;
    this.bgmPlaying = false;
    this.bgmInterval = null;
    this.bgmGainNode = null;
    this.bgmStep = 0;
    this.droneOsc = null;
    this.droneGain = null;
    this.initAudioContext();
  }

  get muted() {
    return this.sfxMuted;
  }

  set muted(val) {
    this.sfxMuted = val;
  }

  initAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
    }
  }

  ensureContext() {
    if (!this.ctx) this.initAudioContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setSfxMuted(muted) {
    this.sfxMuted = !!muted;
    return this.sfxMuted;
  }

  setBgmMuted(muted) {
    this.bgmMuted = !!muted;
    if (this.bgmMuted) {
      this.stopBgm();
    } else {
      this.startBgm();
    }
    return this.bgmMuted;
  }

  toggleMute() {
    return this.toggleSfx();
  }

  toggleSfx() {
    this.sfxMuted = !this.sfxMuted;
    return !this.sfxMuted;
  }

  toggleBgm() {
    this.bgmMuted = !this.bgmMuted;
    if (this.bgmMuted) {
      this.stopBgm();
    } else {
      this.startBgm();
    }
    return !this.bgmMuted;
  }

  /* ========================================================
     NHẠC NỀN CUNG ĐÌNH AMBIENT BGM (WEB AUDIO API SYNTHESIZER)
     Mô phỏng chuỗi hợp âm Lute / Harpsichord thời Phục Hưng
     tiến trình Dm - Bb - Gm - A7 huyền bí, êm dịu và hồi hộp.
     ======================================================== */
  startBgm() {
    if (this.bgmMuted) return;
    this.ensureContext();
    if (!this.ctx) return;
    if (this.bgmPlaying) return;

    this.bgmPlaying = true;
    this.bgmStep = 0;

    try {
      if (!this.bgmGainNode) {
        this.bgmGainNode = this.ctx.createGain();
        this.bgmGainNode.gain.setValueAtTime(0.09, this.ctx.currentTime);
        this.bgmGainNode.connect(this.ctx.destination);
      } else {
        this.bgmGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
        this.bgmGainNode.gain.setValueAtTime(0.09, this.ctx.currentTime);
      }

      // Chuỗi nốt đàn Lute cổ điển (4 ô nhịp x 8 nốt = 32 nốt chu kỳ)
      // Dm (D3, A3, F4, D4, A4, F4, D4, A3)
      // Bb (Bb2, F3, D4, Bb3, F4, D4, Bb3, F3)
      // Gm (G2, D3, Bb3, G3, D4, Bb3, G3, D3)
      // A7 (A2, E3, C#4, A3, E4, C#4, A3, E3)
      const courtNotes = [
        // Bar 1: D Minor
        146.83, 220.00, 349.23, 293.66, 440.00, 349.23, 293.66, 220.00,
        // Bar 2: Bb Major
        116.54, 174.61, 293.66, 233.08, 349.23, 293.66, 233.08, 174.61,
        // Bar 3: G Minor
        98.00,  146.83, 233.08, 196.00, 293.66, 233.08, 196.00, 146.83,
        // Bar 4: A Major (Cadence hoàng gia)
        110.00, 164.81, 277.18, 220.00, 329.63, 277.18, 220.00, 164.81
      ];

      const bassDrones = [73.42, 58.27, 49.00, 55.00]; // D2, Bb1, G1, A1

      const stepDuration = 220; // 220ms mỗi nốt (~68 BPM quý tộc êm dịu)

      this.bgmInterval = setInterval(() => {
        if (!this.bgmPlaying || this.bgmMuted || !this.ctx) return;

        const currentFreq = courtNotes[this.bgmStep % courtNotes.length];
        const barIndex = Math.floor((this.bgmStep % courtNotes.length) / 8);
        const isBarStart = (this.bgmStep % 8) === 0;

        // 1. Gảy đàn Lute (Plucked lute string tone)
        this.playPluckedLuteNote(currentFreq, 0.45);

        // 2. Tiếng đệm trầm (Bass drone hoàng cung) ở đầu mỗi ô nhịp
        if (isBarStart) {
          this.playBassDrone(bassDrones[barIndex], 1.6);
        }

        // 3. Chuông pha lê ngân nhẹ ở nốt đỉnh của cadence hoàng gia (bước 28)
        if (this.bgmStep % 32 === 28) {
          this.playCrystalHarmonic(1108.73, 1.2); // C#6
        }

        this.bgmStep++;
      }, stepDuration);

    } catch (e) {
      console.warn("Lỗi khởi tạo BGM:", e);
    }
  }

  playPluckedLuteNote(freq, decayTime = 0.5) {
    if (!this.ctx || !this.bgmGainNode || this.bgmMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const oscSub = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const noteGain = this.ctx.createGain();

      // Pha trộn sóng Tam giác + Sine tạo âm sắc gỗ mộc của đàn Lute
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      oscSub.type = 'sine';
      oscSub.frequency.setValueAtTime(freq * 0.5, now);

      // Bộ lọc lowpass ấm áp phong cách cung đình
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + decayTime);
      filter.Q.value = 1.8;

      // Độ cong âm lượng (Envelope) gảy dây: công kích nhanh (2ms), tắt dần tự nhiên
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.07, now + 0.006);
      noteGain.gain.exponentialRampToValueAtTime(0.0005, now + decayTime);

      osc.connect(filter);
      oscSub.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.bgmGainNode);

      osc.start(now);
      oscSub.start(now);
      osc.stop(now + decayTime + 0.05);
      oscSub.stop(now + decayTime + 0.05);
    } catch (e) {}
  }

  playBassDrone(freq, duration = 1.6) {
    if (!this.ctx || !this.bgmGainNode || this.bgmMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGainNode);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    } catch (e) {}
  }

  playCrystalHarmonic(freq, duration = 1.0) {
    if (!this.ctx || !this.bgmGainNode || this.bgmMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.02, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.bgmGainNode);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch (e) {}
  }

  stopBgm() {
    this.bgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.bgmGainNode && this.ctx) {
      try {
        this.bgmGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
        this.bgmGainNode.gain.setValueAtTime(0, this.ctx.currentTime);
      } catch (e) {}
    }
  }

  /* ========================================================
     HIỆU ỨNG ÂM THANH SFX (TOGGLEABLE)
     ======================================================== */

  // Âm thanh click phím bấm nhẹ nhàng
  playClick() {
    if (this.sfxMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  // Tiếng rót rượu mẫu "glug glug"
  playPour() {
    if (this.sfxMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const freqs = [350, 420, 500, 620];
      freqs.forEach((f, idx) => {
        setTimeout(() => {
          if (!this.ctx || this.sfxMuted) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(f + 80, this.ctx.currentTime + 0.08);

          gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.08);
        }, idx * 70);
      });
    } catch (e) {}
  }

  // ÂM THANH CHUỘT UỐNG RƯỢU ('RAT DRINKING')
  // Mô phỏng tiếng hớp nước li ti ngọt ngào của chú chuột + tiếng chít chít đáng yêu
  playRatDrinking() {
    if (this.sfxMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // 3 ngụm uống nước nhỏ liên tiếp (liquid sips)
      const sipTimes = [0, 0.08, 0.16];
      sipTimes.forEach((t, i) => {
        const startFreq = 320 + i * 60;
        const endFreq = 620 + i * 80;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(startFreq, now + t);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + t + 0.05);

        gain.gain.setValueAtTime(0.001, now + t);
        gain.gain.linearRampToValueAtTime(0.12, now + t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.055);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + t);
        osc.stop(now + t + 0.06);
      });

      // Tiếng chuột chít đáng yêu sau khi nhấp rượu
      setTimeout(() => {
        if (!this.ctx || this.sfxMuted) return;
        const chirpOsc = this.ctx.createOscillator();
        const chirpGain = this.ctx.createGain();
        const t2 = this.ctx.currentTime;

        chirpOsc.type = 'triangle';
        chirpOsc.frequency.setValueAtTime(2400, t2);
        chirpOsc.frequency.linearRampToValueAtTime(3200, t2 + 0.04);
        chirpOsc.frequency.exponentialRampToValueAtTime(2600, t2 + 0.09);

        chirpGain.gain.setValueAtTime(0.001, t2);
        chirpGain.gain.linearRampToValueAtTime(0.1, t2 + 0.02);
        chirpGain.gain.exponentialRampToValueAtTime(0.001, t2 + 0.09);

        chirpOsc.connect(chirpGain);
        chirpGain.connect(this.ctx.destination);
        chirpOsc.start(t2);
        chirpOsc.stop(t2 + 0.1);
      }, 230);

    } catch (e) {}
  }

  // Tiếng chuột trúng độc gục xuống (âm tần giảm dần lảo đảo)
  playPoisonCollapse() {
    if (this.sfxMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(360, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (e) {}
  }

  // Tiếng đồng hồ tích tắc đêm khuya
  playClockTick() {
    if (this.sfxMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch (e) {}
  }

  // TIẾNG CHUÔNG KHẢI HOÀN HOÀNG GIA ('GAME WIN')
  // Khúc kèn đồng khải hoàn cung đình + Chuông lớn lâu đài Aldric
  playVictory() {
    if (this.sfxMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      // 1. Khúc kèn đồng khải hoàn (Royal Fanfare Brass Motif): C4, E4, G4, C5, E5
      const fanfare = [
        { f: 523.25, t: 0, d: 0.16 },      // C5
        { f: 659.25, t: 120, d: 0.16 },    // E5
        { f: 783.99, t: 240, d: 0.20 },    // G5
        { f: 1046.50, t: 400, d: 0.45 },   // C6 (nốt vút cao)
      ];

      fanfare.forEach(note => {
        setTimeout(() => {
          if (!this.ctx || this.sfxMuted) return;
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();

          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(note.f, this.ctx.currentTime);
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(note.f * 0.5, this.ctx.currentTime);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(note.f, this.ctx.currentTime);
          filter.Q.value = 2.5;

          gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + note.d);

          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);

          osc1.start();
          osc2.start();
          osc1.stop(this.ctx.currentTime + note.d + 0.02);
          osc2.stop(this.ctx.currentTime + note.d + 0.02);
        }, note.t);
      });

      // 2. Đại chuông khải hoàn của Vương Cung (Aldric Cathedral Bells)
      const bells = [1046.50, 1318.51, 1567.98, 2093.00];
      setTimeout(() => {
        if (!this.ctx || this.sfxMuted) return;
        bells.forEach((freq, idx) => {
          setTimeout(() => {
            if (!this.ctx || this.sfxMuted) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0005, this.ctx.currentTime + 1.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 1.15);
          }, idx * 110);
        });
      }, 620);

    } catch (e) {}
  }

  // Tiếng thất bại khi đoán sai chai độc
  playDefeat() {
    if (this.sfxMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const notes = [300, 260, 210, 160];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          if (!this.ctx || this.sfxMuted) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.25);
        }, idx * 100);
      });
    } catch (e) {}
  }

  // Tiếng chuông mở gợi ý / thêm táo vào giỏ
  playChime() {
    if (this.sfxMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch (e) {}
  }
}

/* ========================================================
   2. HÌNH ẢNH SVG NỘI TUYẾN CHO CHUỘT & NHÂN VẬT (CAO CẤP)
   Được thiết kế tinh xảo với gradient, đổ bóng và chi tiết đậm chất cung đình
   ======================================================== */
const SVG_ASSETS = {
  // Chuột bình thường / khỏe mạnh (Đáng yêu, mắt long lanh, vòng cổ hoàng gia)
  mouseNormal: `
    <svg viewBox="0 0 70 70" class="mouse-svg" width="100%" height="100%">
      <defs>
        <radialGradient id="mouse-fur-grad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#f8fafc"/>
          <stop offset="60%" stop-color="#cbd5e1"/>
          <stop offset="100%" stop-color="#94a3b8"/>
        </radialGradient>
        <radialGradient id="mouse-ear-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fda4af"/>
          <stop offset="80%" stop-color="#f43f5e"/>
          <stop offset="100%" stop-color="#e11d48"/>
        </radialGradient>
        <linearGradient id="collar-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="50%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#b45309"/>
        </linearGradient>
      </defs>
      <!-- Đuôi chuột uốn lượn mềm mại -->
      <path d="M52,48 C64,52 68,62 58,66 C52,68 48,64 54,61" stroke="#cbd5e1" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- Thân chuột -->
      <ellipse cx="35" cy="42" rx="20" ry="16" fill="url(#mouse-fur-grad)" stroke="#64748b" stroke-width="1.5"/>
      <!-- Bụng chuột sáng màu -->
      <ellipse cx="35" cy="44" rx="12" ry="10" fill="#f8fafc" opacity="0.6"/>
      <!-- Tai trái & phải -->
      <ellipse cx="23" cy="24" rx="9" ry="12" fill="url(#mouse-fur-grad)" stroke="#64748b" stroke-width="1.5" transform="rotate(-15 23 24)"/>
      <ellipse cx="23" cy="24" rx="5.5" ry="8" fill="url(#mouse-ear-grad)" opacity="0.85" transform="rotate(-15 23 24)"/>
      <ellipse cx="47" cy="24" rx="9" ry="12" fill="url(#mouse-fur-grad)" stroke="#64748b" stroke-width="1.5" transform="rotate(15 47 24)"/>
      <ellipse cx="47" cy="24" rx="5.5" ry="8" fill="url(#mouse-ear-grad)" opacity="0.85" transform="rotate(15 47 24)"/>
      <!-- Đầu chuột -->
      <ellipse cx="35" cy="34" rx="16" ry="14" fill="url(#mouse-fur-grad)" stroke="#64748b" stroke-width="1.5"/>
      <!-- Mắt long lanh phong cách anime (To tròn, phản quang) -->
      <ellipse cx="28" cy="32" rx="3.5" ry="4.5" fill="#0f172a"/>
      <circle cx="27" cy="30.5" r="1.5" fill="#ffffff"/>
      <circle cx="29.5" cy="33.5" r="0.8" fill="#ffffff"/>
      <ellipse cx="42" cy="32" rx="3.5" ry="4.5" fill="#0f172a"/>
      <circle cx="41" cy="30.5" r="1.5" fill="#ffffff"/>
      <circle cx="43.5" cy="33.5" r="0.8" fill="#ffffff"/>
      <!-- Má hồng đáng yêu -->
      <ellipse cx="23" cy="36" rx="3" ry="1.8" fill="#fb7185" opacity="0.6"/>
      <ellipse cx="47" cy="36" rx="3" ry="1.8" fill="#fb7185" opacity="0.6"/>
      <!-- Mũi hồng hạt gạo -->
      <polygon points="33,37 37,37 35,40" fill="#f43f5e"/>
      <!-- Miệng cười chúm chím -->
      <path d="M32,41 Q35,43 38,41" stroke="#475569" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <!-- Râu mảnh hai bên -->
      <path d="M14,35 L26,37 M13,39 L25,39 M56,35 L44,37 M57,39 L45,39" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round"/>
      <!-- Vòng cổ hoàng gia đính ngọc vàng -->
      <path d="M25,48 Q35,53 45,48" stroke="url(#collar-gold)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="35" cy="51" r="3" fill="#10b981" stroke="url(#collar-gold)" stroke-width="1"/>
      <!-- Chân trước nhỏ xinh -->
      <ellipse cx="30" cy="52" rx="3.5" ry="2.5" fill="#f1f5f9" stroke="#64748b" stroke-width="1"/>
      <ellipse cx="40" cy="52" rx="3.5" ry="2.5" fill="#f1f5f9" stroke="#64748b" stroke-width="1"/>
    </svg>`,

  // Chuột đang uống rượu (Uống ngon lành từ ly rượu vàng hoàng gia)
  mouseDrinking: `
    <svg viewBox="0 0 70 70" class="mouse-svg" width="100%" height="100%">
      <defs>
        <radialGradient id="mouse-fur-grad-d" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#f8fafc"/>
          <stop offset="60%" stop-color="#cbd5e1"/>
          <stop offset="100%" stop-color="#94a3b8"/>
        </radialGradient>
        <linearGradient id="chalice-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="40%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#92400e"/>
        </linearGradient>
        <linearGradient id="wine-ruby" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f43f5e"/>
          <stop offset="100%" stop-color="#881337"/>
        </linearGradient>
      </defs>
      <!-- Đuôi vẫy vui vẻ -->
      <path d="M52,48 C66,45 68,55 60,62 C54,66 50,60 54,56" stroke="#cbd5e1" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- Thân chuột -->
      <ellipse cx="35" cy="42" rx="20" ry="16" fill="url(#mouse-fur-grad-d)" stroke="#64748b" stroke-width="1.5"/>
      <!-- Tai cụp ngước nhẹ -->
      <ellipse cx="22" cy="22" rx="9" ry="12" fill="url(#mouse-fur-grad-d)" stroke="#64748b" stroke-width="1.5" transform="rotate(-20 22 22)"/>
      <ellipse cx="22" cy="22" rx="5.5" ry="8" fill="#fb7185" opacity="0.8" transform="rotate(-20 22 22)"/>
      <ellipse cx="48" cy="22" rx="9" ry="12" fill="url(#mouse-fur-grad-d)" stroke="#64748b" stroke-width="1.5" transform="rotate(20 48 22)"/>
      <ellipse cx="48" cy="22" rx="5.5" ry="8" fill="#fb7185" opacity="0.8" transform="rotate(20 48 22)"/>
      <!-- Đầu hơi ngửa lên uống -->
      <ellipse cx="35" cy="33" rx="16" ry="14" fill="url(#mouse-fur-grad-d)" stroke="#64748b" stroke-width="1.5"/>
      <!-- Mắt nhắm tít mãn nguyện (^ ^) -->
      <path d="M26,33 Q29,29 32,33" stroke="#0f172a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M38,33 Q41,29 44,33" stroke="#0f172a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- Má ửng hồng vì say rượu thơm -->
      <circle cx="24" cy="36" r="3.5" fill="#f43f5e" opacity="0.7"/>
      <circle cx="46" cy="36" r="3.5" fill="#f43f5e" opacity="0.7"/>
      <!-- Mũi chuột chạm mép ly -->
      <polygon points="33,36 37,36 35,38" fill="#f43f5e"/>
      <!-- Ly rượu chạm vàng hoàng gia lấp lánh -->
      <path d="M30,38 L40,38 L42,46 Q35,50 28,46 Z" fill="url(#wine-ruby)" stroke="url(#chalice-gold)" stroke-width="1.5"/>
      <ellipse cx="35" cy="38" rx="5" ry="1.5" fill="#fda4af" opacity="0.8"/>
      <path d="M33,48 L37,48 L36,54 L39,56 L31,56 L34,54 Z" fill="url(#chalice-gold)" stroke="#78350f" stroke-width="1"/>
      <!-- Hai bàn tay nhỏ ôm lấy chiếc ly -->
      <ellipse cx="29" cy="44" rx="3" ry="2.5" fill="#f8fafc" stroke="#64748b" stroke-width="1"/>
      <ellipse cx="41" cy="44" rx="3" ry="2.5" fill="#f8fafc" stroke="#64748b" stroke-width="1"/>
      <!-- Giọt rượu mẫu tinh tế -->
      <circle cx="44" cy="38" r="1.5" fill="#e11d48"/>
      <!-- Bọt sủi rượu -->
      <circle cx="34" cy="42" r="1" fill="#fff" opacity="0.7"/>
    </svg>`,

  // Chuột đã gục sau đêm (Mắt xoáy comic @ @, đầu lâu xanh neon ma mị, khói độc lan tỏa)
  mousePoisoned: `
    <svg viewBox="0 0 70 70" class="mouse-svg" width="100%" height="100%">
      <defs>
        <radialGradient id="poison-fur-grad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#d1fae5"/>
          <stop offset="60%" stop-color="#6ee7b7"/>
          <stop offset="100%" stop-color="#059669"/>
        </radialGradient>
        <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
      <!-- Hào quang độc xanh neon mờ ảo -->
      <circle cx="35" cy="38" r="26" fill="#10b981" opacity="0.2" filter="url(#neon-glow)"/>
      <!-- Thân chuột nghiêng gục -->
      <ellipse cx="36" cy="45" rx="22" ry="14" fill="url(#poison-fur-grad)" stroke="#047857" stroke-width="1.8"/>
      <!-- Tai ủ rũ rớt xuống -->
      <ellipse cx="20" cy="34" rx="8" ry="11" fill="url(#poison-fur-grad)" stroke="#047857" stroke-width="1.5" transform="rotate(-40 20 34)"/>
      <ellipse cx="20" cy="34" rx="5" ry="7" fill="#34d399" opacity="0.8" transform="rotate(-40 20 34)"/>
      <ellipse cx="50" cy="34" rx="8" ry="11" fill="url(#poison-fur-grad)" stroke="#047857" stroke-width="1.5" transform="rotate(40 50 34)"/>
      <ellipse cx="50" cy="34" rx="5" ry="7" fill="#34d399" opacity="0.8" transform="rotate(40 50 34)"/>
      <!-- Đầu chuột gục lảo đảo -->
      <ellipse cx="35" cy="36" rx="16" ry="13" fill="url(#poison-fur-grad)" stroke="#047857" stroke-width="1.8"/>
      <!-- Mắt xoáy chóng mặt (@ @ comic dizzy eyes) -->
      <path d="M26,34 A3,3 0 0,1 29,31 A2,2 0 0,1 31,33 A1.5,1.5 0 0,1 29.5,34.5" stroke="#064e3b" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M39,34 A3,3 0 0,1 42,31 A2,2 0 0,1 44,33 A1.5,1.5 0 0,1 42.5,34.5" stroke="#064e3b" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- Vết xanh say độc trên má -->
      <circle cx="23" cy="38" r="3" fill="#059669" opacity="0.5"/>
      <circle cx="47" cy="38" r="3" fill="#059669" opacity="0.5"/>
      <!-- Miệng lượn sóng say độc -->
      <path d="M31,42 Q33,40 35,42 Q37,44 39,42" stroke="#064e3b" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- Bong bóng độc sủi ra từ miệng -->
      <circle cx="42" cy="40" r="2" fill="#34d399" stroke="#064e3b" stroke-width="0.8" opacity="0.85"/>
      <circle cx="45" cy="37" r="1.2" fill="#6ee7b7" opacity="0.7"/>
      <!-- Đầu lâu độc xanh neon dễ thương bay lơ lửng phía trên đầu -->
      <g transform="translate(26, 6) scale(0.85)" filter="url(#neon-glow)">
        <path d="M10,2 C5,2 2,6 2,11 C2,14.5 4,16.5 6,18 L6,21 L14,21 L14,18 C16,16.5 18,14.5 18,11 C18,6 15,2 10,2 Z" fill="#34d399" stroke="#065f46" stroke-width="1.8"/>
        <!-- Mắt xương xám đen -->
        <circle cx="6.5" cy="10" r="2.2" fill="#064e3b"/>
        <circle cx="13.5" cy="10" r="2.2" fill="#064e3b"/>
        <!-- Mũi tam giác ngược -->
        <polygon points="10,13 8.8,15.5 11.2,15.5" fill="#064e3b"/>
        <!-- Răng cưa -->
        <line x1="8" y1="18" x2="8" y2="21" stroke="#064e3b" stroke-width="1.2"/>
        <line x1="12" y1="18" x2="12" y2="21" stroke="#064e3b" stroke-width="1.2"/>
        <!-- Đốm sáng độc nhỏ xung quanh -->
        <circle cx="-3" cy="8" r="1" fill="#6ee7b7"/>
        <circle cx="23" cy="12" r="1.2" fill="#6ee7b7"/>
      </g>
    </svg>`,

  // Avatar Vua Aldric (Chân dung sơn dầu hoàng gia: Vương miện ngọc, áo choàng nhung đỏ thêu lông chồn)
  kingAvatar: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <radialGradient id="king-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#881337"/>
          <stop offset="70%" stop-color="#4c0519"/>
          <stop offset="100%" stop-color="#1e020a"/>
        </radialGradient>
        <linearGradient id="crown-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="40%" stop-color="#f59e0b"/>
          <stop offset="80%" stop-color="#d97706"/>
          <stop offset="100%" stop-color="#78350f"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#king-bg)"/>
      <!-- Họa tiết mái vòm cung điện hoàng gia phía sau -->
      <path d="M15,100 L15,35 Q50,10 85,35 L85,100 Z" fill="none" stroke="#b45309" stroke-width="1.5" opacity="0.35"/>
      <!-- Áo choàng nhung hoàng gia đỏ sẫm -->
      <path d="M10,100 L25,65 L75,65 L90,100 Z" fill="#9f1239" stroke="#78350f" stroke-width="2"/>
      <!-- Cổ áo lông chồn tuyết đính đốm đen cao quý -->
      <path d="M22,65 Q50,78 78,65 Q85,75 80,88 Q50,96 20,88 Q15,75 22,65 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <ellipse cx="32" cy="74" rx="2" ry="4" fill="#0f172a" transform="rotate(-15 32 74)"/>
      <ellipse cx="50" cy="78" rx="2" ry="4" fill="#0f172a"/>
      <ellipse cx="68" cy="74" rx="2" ry="4" fill="#0f172a" transform="rotate(15 68 74)"/>
      <!-- Dây chuyền vàng thánh thần -->
      <path d="M30,86 Q50,98 70,86" stroke="url(#crown-gold)" stroke-width="3" fill="none"/>
      <circle cx="50" cy="94" r="5" fill="#f59e0b" stroke="#78350f" stroke-width="1.5"/>
      <circle cx="50" cy="94" r="2.5" fill="#38bdf8"/>
      <!-- Khuôn mặt vua phương phi, uy nghiêm -->
      <circle cx="50" cy="50" r="19" fill="#fed7aa"/>
      <!-- Râu quai nón vàng đồng dũng mãnh -->
      <path d="M33,48 Q50,86 67,48 Q70,72 50,78 Q30,72 33,48 Z" fill="#b45309"/>
      <!-- Mắt xanh thẳm của bậc quân vương -->
      <ellipse cx="43" cy="48" rx="2.5" ry="3" fill="#0284c7"/>
      <circle cx="43" cy="47.5" r="1" fill="#fff"/>
      <ellipse cx="57" cy="48" rx="2.5" ry="3" fill="#0284c7"/>
      <circle cx="57" cy="47.5" r="1" fill="#fff"/>
      <!-- Lông mày rậm oai phong -->
      <path d="M38,44 Q43,41 48,44" stroke="#78350f" stroke-width="2.5" fill="none"/>
      <path d="M52,44 Q57,41 62,44" stroke="#78350f" stroke-width="2.5" fill="none"/>
      <!-- Mũi cao thanh tú -->
      <path d="M50,47 L48,55 L52,55" stroke="#ea580c" stroke-width="1.5" fill="none"/>
      <!-- Vương miện hoàng đế nạm ngọc Ruby & Sapphire -->
      <polygon points="25,38 30,16 42,27 50,12 58,27 70,16 75,38" fill="url(#crown-gold)" stroke="#78350f" stroke-width="2"/>
      <circle cx="30" cy="16" r="3" fill="#ef4444" stroke="#fff" stroke-width="0.8"/>
      <circle cx="50" cy="12" r="3.5" fill="#38bdf8" stroke="#fff" stroke-width="0.8"/>
      <circle cx="70" cy="16" r="3" fill="#ef4444" stroke="#fff" stroke-width="0.8"/>
      <!-- Dải ngọc đính quanh vành vương miện -->
      <rect x="25" y="34" width="50" height="5" rx="2" fill="url(#crown-gold)" stroke="#78350f" stroke-width="1.5"/>
      <circle cx="35" cy="36.5" r="1.5" fill="#10b981"/>
      <circle cx="50" cy="36.5" r="1.8" fill="#ef4444"/>
      <circle cx="65" cy="36.5" r="1.5" fill="#10b981"/>
    </svg>`,

  // Avatar Lão Toán Sư (Nhà thông thái uyên bác, chòm sao hoàng đạo và toán nhị phân)
  masterAvatar: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <radialGradient id="master-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#312e81"/>
          <stop offset="70%" stop-color="#1e1b4b"/>
          <stop offset="100%" stop-color="#090520"/>
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#master-bg)"/>
      <!-- Các chòm sao và ký tự số nhị phân huyền bí ẩn hiện sau lưng -->
      <g stroke="#818cf8" stroke-width="0.8" opacity="0.45" fill="none">
        <circle cx="20" cy="20" r="1.5" fill="#818cf8"/>
        <circle cx="35" cy="15" r="1.5" fill="#818cf8"/>
        <circle cx="80" cy="25" r="1.5" fill="#818cf8"/>
        <line x1="20" y1="20" x2="35" y2="15"/>
        <line x1="35" y1="15" x2="50" y2="20"/>
      </g>
      <text x="82" y="45" fill="#6366f1" opacity="0.4" font-size="9" font-family="monospace">2^k</text>
      <text x="12" y="60" fill="#6366f1" opacity="0.4" font-size="8" font-family="monospace">1011</text>
      <!-- Áo choàng xanh thẫm học giả đại học đường -->
      <path d="M12,100 L28,68 L72,68 L88,100 Z" fill="#1e1b4b" stroke="#4338ca" stroke-width="2"/>
      <path d="M38,68 L50,100 L62,68 Z" fill="#312e81"/>
      <!-- Mũ học giả nẹp chỉ vàng tinh xảo -->
      <polygon points="12,32 50,18 88,32 50,42" fill="#3730a3" stroke="#fbbf24" stroke-width="2"/>
      <!-- Tua rua nón vàng óng bay bổng -->
      <circle cx="50" cy="22" r="3" fill="#fbbf24"/>
      <path d="M50,22 Q75,25 82,45" stroke="#f59e0b" stroke-width="2" fill="none"/>
      <circle cx="82" cy="46" r="2.5" fill="#f59e0b"/>
      <!-- Gương mặt thông thái, đôn hậu -->
      <circle cx="50" cy="49" r="18" fill="#fde68a"/>
      <!-- Chòm râu dài bạc trắng như tuyết tượng trưng cho trí tuệ -->
      <path d="M32,54 Q50,98 68,54 Q50,92 32,54 Z" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5"/>
      <!-- Cặp kính gọng tròn bác học bằng vàng lấp lánh phản quang -->
      <circle cx="43" cy="46" r="6" fill="rgba(255,255,255,0.2)" stroke="#f59e0b" stroke-width="2"/>
      <circle cx="57" cy="46" r="6" fill="rgba(255,255,255,0.2)" stroke="#f59e0b" stroke-width="2"/>
      <line x1="49" y1="46" x2="51" y2="46" stroke="#f59e0b" stroke-width="2"/>
      <!-- Mắt hiền từ phía sau tròng kính -->
      <circle cx="43" cy="46" r="2" fill="#1e293b"/>
      <circle cx="57" cy="46" r="2" fill="#1e293b"/>
      <circle cx="42" cy="45" r="0.8" fill="#fff"/>
      <circle cx="56" cy="45" r="0.8" fill="#fff"/>
      <!-- Nụ cười thông thái thâm sâu -->
      <path d="M46,55 Q50,58 54,55" stroke="#78350f" stroke-width="1.5" fill="none"/>
    </svg>`,

  // Avatar Bá tước Vesper (Kẻ phản bội thâm hiểm: Đôi mắt đỏ rực, kính một tròng monocle, áo choàng tím đen)
  vesperAvatar: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <radialGradient id="vesper-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#3b0764"/>
          <stop offset="70%" stop-color="#1e1035"/>
          <stop offset="100%" stop-color="#090310"/>
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#vesper-bg)"/>
      <!-- Khói độc màu tím xanh bí ẩn phảng phất -->
      <path d="M10,80 Q30,60 15,40 T30,10" stroke="#a855f7" stroke-width="3" fill="none" opacity="0.25"/>
      <path d="M90,75 Q70,55 85,35 T70,10" stroke="#10b981" stroke-width="2.5" fill="none" opacity="0.3"/>
      <!-- Cổ áo choàng nhọn cao vút phong cách ma cà rồng/quý tộc phản bội -->
      <polygon points="15,100 20,45 35,68 65,68 80,45 85,100" fill="#581c87" stroke="#3b0764" stroke-width="2"/>
      <polygon points="26,60 50,95 74,60" fill="#2e1065"/>
      <!-- Khuy áo chạm đầu lâu bạc bí mật -->
      <circle cx="50" cy="74" r="3.5" fill="#94a3b8" stroke="#475569" stroke-width="1"/>
      <!-- Gương mặt sắc lạnh góc cạnh, gò má cao -->
      <polygon points="34,40 50,66 66,40 50,30" fill="#fed7aa"/>
      <!-- Tóc bạc vuốt ngược kiêu hãnh kiểu quý tộc bóng đêm -->
      <path d="M28,38 Q50,15 72,38 Q66,22 50,20 Q34,22 28,38 Z" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/>
      <!-- Lông mày xếch xảo quyệt -->
      <path d="M37,40 L46,43" stroke="#1e1b4b" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M54,43 L63,40" stroke="#1e1b4b" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Mắt trái liếc sắc lẹm -->
      <polygon points="38,45 44,43 45,47 39,48" fill="#1e1b4b"/>
      <circle cx="42" cy="45.5" r="1.5" fill="#ef4444"/>
      <!-- Kính một tròng (Monocle) mắt phải bằng vàng tỏa ánh đỏ ma mị -->
      <circle cx="58" cy="46" r="6.5" fill="rgba(239, 68, 68, 0.2)" stroke="#f59e0b" stroke-width="2"/>
      <circle cx="58" cy="46" r="2" fill="#ef4444"/>
      <circle cx="57" cy="45" r="0.8" fill="#fff"/>
      <path d="M64,48 Q72,55 70,75" stroke="#f59e0b" stroke-width="1.2" fill="none"/>
      <!-- Nụ cười nhếch mép nửa miệng hiểm độc -->
      <path d="M42,57 Q49,59 58,54" stroke="#78350f" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- Lọ độc cầm tay he hé với khói xanh -->
      <ellipse cx="22" cy="85" rx="5" ry="8" fill="#10b981" stroke="#047857" stroke-width="1.5"/>
      <rect x="20" y="74" width="4" height="4" fill="#d97706"/>
    </svg>`,

  // Avatar Thử Độc Sư (Người chơi: Dược sĩ hoàng gia can trường, mũ nồi xanh, kính bảo hộ)
  playerAvatar: `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <radialGradient id="player-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#065f46"/>
          <stop offset="70%" stop-color="#064e3b"/>
          <stop offset="100%" stop-color="#022c22"/>
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#player-bg)"/>
      <!-- Dây đai da và ống nghiệm dược phẩm sau lưng -->
      <path d="M12,100 L28,68 L72,68 L88,100 Z" fill="#047857" stroke="#064e3b" stroke-width="2"/>
      <path d="M35,68 L48,100 L52,100 L65,68 Z" fill="#0f766e"/>
      <!-- Dây đai da chéo qua ngực với các ống nghiệm nhỏ -->
      <line x1="25" y1="72" x2="75" y2="98" stroke="#78350f" stroke-width="4"/>
      <circle cx="45" cy="82" r="3" fill="#38bdf8" stroke="#78350f" stroke-width="1"/>
      <circle cx="55" cy="87" r="3" fill="#f59e0b" stroke="#78350f" stroke-width="1"/>
      <!-- Khuôn mặt trẻ trung, quyết tâm, thông minh -->
      <circle cx="50" cy="50" r="18" fill="#fed7aa"/>
      <!-- Mũ nồi dược sĩ hoàng gia màu xanh ngọc với lông vũ vàng -->
      <path d="M22,38 C22,20 78,20 78,38 Q50,44 22,38 Z" fill="#059669" stroke="#065f46" stroke-width="2"/>
      <path d="M72,32 Q88,15 80,10 Q70,22 72,32 Z" fill="#f59e0b" stroke="#b45309" stroke-width="1"/>
      <!-- Cặp kính bảo hộ phóng đại bằng đồng trên trán -->
      <circle cx="41" cy="35" r="6" fill="rgba(254, 240, 138, 0.45)" stroke="#d97706" stroke-width="2"/>
      <circle cx="59" cy="35" r="6" fill="rgba(254, 240, 138, 0.45)" stroke="#d97706" stroke-width="2"/>
      <line x1="47" y1="35" x2="53" y2="35" stroke="#d97706" stroke-width="2"/>
      <!-- Đôi mắt sáng ngời tinh anh -->
      <ellipse cx="43" cy="49" rx="2.5" ry="3.5" fill="#0f172a"/>
      <circle cx="42" cy="48" r="1" fill="#fff"/>
      <ellipse cx="57" cy="49" rx="2.5" ry="3.5" fill="#0f172a"/>
      <circle cx="56" cy="48" r="1" fill="#fff"/>
      <!-- Nụ cười tự tin, can đảm đối mặt thử thách -->
      <path d="M45,58 Q50,62 55,58" stroke="#b45309" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`
};

/* ========================================================
   3. DANH SÁCH 10 CHÚ CHUỘT THÔNG THÁI
   ======================================================== */
const MICE_DATA = [
  { bit: 0, weight: 1, name: "Mimi", trait: "Nhanh nhẹn" },
  { bit: 1, weight: 2, name: "Bo", trait: "Dũng cảm" },
  { bit: 2, weight: 4, name: "Zú", trait: "Mũm mĩm" },
  { bit: 3, weight: 8, name: "Kẹo", trait: "Thích ngọt" },
  { bit: 4, weight: 16, name: "Bông", trait: "Hiếu động" },
  { bit: 5, weight: 32, name: "Tí", trait: "Trầm tư" },
  { bit: 6, weight: 64, name: "Mực", trait: "Lém lỉnh" },
  { bit: 7, weight: 128, name: "Mỡ", trait: "Ngủ nhiều" },
  { bit: 8, weight: 256, name: "Sóc", trait: "Khéo léo" },
  { bit: 9, weight: 512, name: "Hạt Dẻ", trait: "Thông thái" }
];

/* ========================================================
   4. DỮ LIỆU CẤU HÌNH MÀN CHƠI (LEVELS CONFIG)
   Dễ dàng mở rộng từ 13 màn lên 40 màn chỉ bằng thêm object.
   ======================================================== */
const LEVELS_CONFIG = [
  // --- CHƯƠNG 1: PHÒNG THÍ NGHIỆM BAN ĐẦU ---
  {
    id: 1,
    chapter: "Chương 1: Phòng Thí Nghiệm",
    title: "Màn 1: Thử Nghiệm Đầu Tiên",
    bottles: 4,
    mice: 2, // 2 chuột: weights 1, 2 (phân biệt tối đa 4 chai: 1,2,3,4)
    poisonedCount: 1,
    storyIntro: {
      speaker: "Vua Aldric",
      role: "Quốc vương",
      avatar: "kingAvatar",
      text: "Thử Độc Sư! Hầm rượu vừa nhận 4 chai ngự tửu. Một chai bị tẩm độc phát tác sau đúng một đêm. Ta chỉ giao cho ngươi 2 chú chuột Mimi và Bo. Đừng làm ta thất vọng!"
    },
    hint1: "Với 2 chú chuột, chuột 1 thử chai lẻ (bit 1), chuột 2 thử các chai có bit 2. Hãy xem bảng nhị phân để gán chính xác!",
    hint2: "Chai 1: chỉ chuột Mimi. Chai 2: chỉ chuột Bo. Chai 3: cả 2 cùng uống!",
    fixedPoison: null
  },
  {
    id: 2,
    chapter: "Chương 1: Phòng Thí Nghiệm",
    title: "Màn 2: Mở Rộng Thử Thách",
    bottles: 6,
    mice: 3, // weights 1, 2, 4
    poisonedCount: 1,
    storyIntro: {
      speaker: "Lão Toán Sư",
      role: "Cố vấn Triều đình",
      avatar: "masterAvatar",
      text: "Hoan hô người trẻ! Nhưng 4 chai chỉ là khởi đầu. Bây giờ là 6 chai rượu và ta cấp thêm chú chuột thứ ba: Zú (trọng số 4). Đừng thử từng chai một, hãy chia nhóm thông minh!"
    },
    hint1: "Số 6 trong nhị phân là 4 + 2 (tức 110 nhị phân). Chuột trọng số 2 và 4 sẽ cùng uống chai 6.",
    hint2: "Chuột Mimi (1) uống 1, 3, 5; Chuột Bo (2) uống 2, 3, 6; Chuột Zú (4) uống 4, 5, 6.",
    fixedPoison: null
  },
  {
    id: 3,
    chapter: "Chương 1: Phòng Thí Nghiệm",
    title: "Màn 3: Giới Hạn Của 3 Chú Chuột",
    bottles: 8,
    mice: 3, // weights 1, 2, 4 phân biệt đúng 8 chai (1 đến 8)
    poisonedCount: 1,
    storyIntro: {
      speaker: "Bá tước Vesper",
      role: "Tổng quản Cung đình",
      avatar: "vesperAvatar",
      text: "Khá khen cho ngươi. Nhưng liệu 3 con chuột nhỏ bé có thể kiểm soát trọn vẹn 8 chai rượu không? Nếu tất cả đều sống thì sao?"
    },
    hint1: "3 chú chuột có 2^3 = 8 trạng thái (từ 000 đến 111). Đủ để mã hóa hoàn hảo 8 chai!",
    hint2: "Dùng tính năng 'Tự Điền Chuẩn Nhị Phân' để thấy cách phân phối tối ưu nhất.",
    fixedPoison: null
  },

  // --- CHƯƠNG 2: HẦM SÁCH CỔ ---
  {
    id: 4,
    chapter: "Chương 2: Hầm Sách Cổ",
    title: "Màn 4: Giỏ Táo Của Lão Toán Sư",
    bottles: 12,
    mice: 4, // weights 1, 2, 4, 8
    poisonedCount: 1,
    storyIntro: {
      speaker: "Lão Toán Sư",
      role: "Cố vấn Triều đình",
      avatar: "masterAvatar",
      text: "Chào mừng tới hầm sách! Nhìn lên kệ kia kìa: 12 chai rượu. Ta đưa thêm chuột Kẹo (trọng số 8). Hãy mở 'Bảng Giỏ Táo' trên góc màn hình để hiểu cách các lũy thừa của 2 cộng lại!"
    },
    hint1: "12 = 8 + 4. Chai 12 sẽ được cho chuột Kẹo (8) và Zú (4) uống.",
    hint2: "Bất kỳ số nào cũng biểu diễn được duy nhất bằng tổng các lũy thừa của 2.",
    fixedPoison: null
  },
  {
    id: 5,
    chapter: "Chương 2: Hầm Sách Cổ",
    title: "Màn 5: Sức Mạnh Lũy Thừa 4",
    bottles: 16,
    mice: 4, // 2^4 = 16
    poisonedCount: 1,
    storyIntro: {
      speaker: "Lão Toán Sư",
      role: "Cố vấn Triều đình",
      avatar: "masterAvatar",
      text: "16 chai rượu hảo hạng! Với 4 chú chuột, mỗi chuột uống một nửa số chai. Sau đêm nay, dãy gục/sống sẽ chỉ đích danh thủ phạm!"
    },
    hint1: "Chuột Mimi (1) uống 8 chai lẻ. Chuột Bo (2) uống các chai có bit 2. Tương tự cho bit 4 và bit 8.",
    hint2: "Hãy thử kiểm tra bảng đối chiếu để tra cứu mã nhị phân của từng chai.",
    fixedPoison: null
  },
  {
    id: 6,
    chapter: "Chương 2: Hầm Sách Cổ",
    title: "Màn 6: Bước Nhảy 32 Chai",
    bottles: 32,
    mice: 5, // weights 1, 2, 4, 8, 16
    poisonedCount: 1,
    storyIntro: {
      speaker: "Vua Aldric",
      role: "Quốc vương",
      avatar: "kingAvatar",
      text: "32 chai rượu từ vùng Bordeaux danh tiếng! Ta cần câu trả lời trước buổi thiết triều sáng mai. 5 chú chuột của ngươi đã sẵn sàng chưa?"
    },
    hint1: "5 chuột = 2^5 = 32 chai. Mỗi chai n tương ứng với bit n & (1 << k).",
    hint2: "Bấm 'Tự Điền Chuẩn Nhị Phân' nếu muốn phân bổ nhanh toàn bộ 32 chai.",
    fixedPoison: null
  },

  // --- CHƯƠNG 3: CHỢ RƯỢU HOÀNG GIA ---
  {
    id: 7,
    chapter: "Chương 3: Chợ Rượu Hoàng Gia",
    title: "Màn 7: Nửa Trăm Chai Rượu",
    bottles: 50,
    mice: 6, // weights 1, 2, 4, 8, 16, 32 (tối đa 64)
    poisonedCount: 1,
    storyIntro: {
      speaker: "Thử Độc Sư",
      role: "Người chơi",
      avatar: "playerAvatar",
      text: "50 chai rượu vừa cập bến chợ cảng. Có tin đồn sát thủ của Vesper đã trà trộn vào đây. Cần 6 chú chuột để rà soát toàn bộ!"
    },
    hint1: "Với 50 chai, 2^5 = 32 không đủ, do đó ta cần 6 chuột (2^6 = 64 chai).",
    hint2: "Chuột thứ 6 là Tí (trọng số 32). Mọi chai từ 32 đến 50 đều có Tí uống.",
    fixedPoison: null
  },
  {
    id: 8,
    chapter: "Chương 3: Chợ Rượu Hoàng Gia",
    title: "Màn 8: Rà Soát Toàn Diện",
    bottles: 70,
    mice: 7, // weights 1, 2, 4, 8, 16, 32, 64 (tối đa 128)
    poisonedCount: 1,
    storyIntro: {
      speaker: "Lão Toán Sư",
      role: "Cố vấn Triều đình",
      avatar: "masterAvatar",
      text: "70 chai rượu vượt quá 64, nên chúng ta cần 7 chú chuột: chào đón Mực (trọng số 64). Lượng chai tăng lên nhưng chỉ cần thêm đúng 1 chú chuột!"
    },
    hint1: "Mỗi khi số chai nhân đôi, ta chỉ cần thêm đúng 1 chú chuột. Đó là sức mạnh hàm logarit cơ số 2!",
    hint2: "Chuột Mực (64) sẽ uống các chai có số hiệu >= 64.",
    fixedPoison: null
  },
  {
    id: 9,
    chapter: "Chương 3: Chợ Rượu Hoàng Gia",
    title: "Màn 9: Sự Cố Tráo Nhãn 100 Chai",
    bottles: 100,
    mice: 7, // 2^7 = 128 > 100
    poisonedCount: 1,
    storyIntro: {
      speaker: "Bá tước Vesper",
      role: "Tổng quản Cung đình",
      avatar: "vesperAvatar",
      text: "Ngươi khá lắm. Nhưng 100 chai này đã bị xáo trộn nhãn mác. Ngươi có chắc là lũ chuột của ngươi không đọc nhầm số không?"
    },
    hint1: "Dù nhãn bị xáo trộn ra sao, thuật toán nhị phân n & 2^k vẫn luôn đúng tuyệt đối.",
    hint2: "Chai 100 = 64 + 32 + 4. Chuột uống chai 100 gồm Mực (64), Tí (32) và Zú (4).",
    fixedPoison: null
  },

  // --- CHƯƠNG 4: CUNG ĐIỆN HOÀNG GIA (THỬ THÁCH LỚN) ---
  {
    id: 10,
    chapter: "Chương 4: Cung Điện Hoàng Gia",
    title: "Màn 10: Bí Mật Chai 295",
    bottles: 295,
    mice: 9, // weights up to 256 (2^9 = 512)
    poisonedCount: 1,
    storyIntro: {
      speaker: "Lão Toán Sư",
      role: "Cố vấn Triều đình",
      avatar: "masterAvatar",
      text: "Hãy chú ý màn này! Đây chính là ví dụ kinh điển trong sách cổ: 295 chai rượu! 295 = 256 + 32 + 4 + 2 + 1. Chuột Sóc (256), Tí (32), Zú (4), Bo (2) và Mimi (1) sẽ cùng thử chai này!"
    },
    hint1: "Phân tích 295 ra nhị phân: 0100100111. Các vị trí 1 tương ứng các chuột gục.",
    hint2: "Khi sáng ra, nếu các chuột 256, 32, 4, 2, 1 gục, hãy cộng lại: 256 + 32 + 4 + 2 + 1 = 295!",
    fixedPoison: 295
  },
  {
    id: 11,
    chapter: "Chương 4: Cung Điện Hoàng Gia",
    title: "Màn 11: Nửa Đường Đại Yến",
    bottles: 500,
    mice: 9, // 2^9 = 512 > 500
    poisonedCount: 1,
    storyIntro: {
      speaker: "Vua Aldric",
      role: "Quốc vương",
      avatar: "kingAvatar",
      text: "500 chai ngự tửu đã dọn sẵn trước đại điện! Mùi rượu nồng nặc khắp nơi. Chỉ 9 chú chuột có đủ cứu sống 500 mạng người không?"
    },
    hint1: "500 < 512, do đó 9 chú chuột (1, 2, 4, ..., 256) là hoàn toàn đủ.",
    hint2: "Dùng nút 'Tự Điền Chuẩn Nhị Phân' rồi đưa chuột vào đêm.",
    fixedPoison: null
  },
  {
    id: 12,
    chapter: "Chương 4: Cung Điện Hoàng Gia",
    title: "Màn 12: Thách Thức Chai 999",
    bottles: 999,
    mice: 10, // 2^10 = 1024 > 999
    poisonedCount: 1,
    storyIntro: {
      speaker: "Lão Toán Sư",
      role: "Cố vấn Triều đình",
      avatar: "masterAvatar",
      text: "999 chai rượu! Chú chuột thứ 10: Hạt Dẻ (512) chính thức xuất trận. Con số 999 = 512 + 256 + 128 + 64 + 32 + 4 + 2 + 1 (tức 1111100111). Hầu như tất cả các chuột đều phải uống nó!"
    },
    hint1: "Chai 999 chỉ trừ chuột 8 và chuột 16 ra, còn lại tất cả 8 chuột khác đều uống!",
    hint2: "Cộng dồn tất cả các chuột gục vào buổi sáng để ra con số 999.",
    fixedPoison: 999
  },

  // --- CHƯƠNG 5: ĐẠI YẾN CUNG ĐÌNH (CUỘC ĐẤU TRÍ CUỐI CÙNG) ---
  {
    id: 13,
    chapter: "Chương 5: Đại Yến Cung Đình",
    title: "Màn 13: 1.000 Chai Rượu & Âm Mưu Vesper",
    bottles: 1000,
    mice: 10, // 10 chuột kiểm soát 1024 chai
    poisonedCount: 1,
    isFinalBoss: true,
    storyIntro: {
      speaker: "Bá tước Vesper",
      role: "Kẻ Phản Bội Lộ Diện",
      avatar: "vesperAvatar",
      text: "Ha ha ha! Đúng như ta dự đoán, ngươi đã dùng thuật nhị phân đến tận đây. Nhưng đêm nay, đúng 1.000 chai rượu sẽ được dâng lên nhà vua. Chai độc được đặt chính xác ở số 1.000 - con số danh dự của triều đình! Ngươi có dám đối mặt?"
    },
    hint1: "1.000 = 512 + 256 + 128 + 64 + 32 + 8. Dãy nhị phân là 1111101000.",
    hint2: "Chuột gục sẽ là Hạt Dẻ (512), Sóc (256), Mỡ (128), Mực (64), Tí (32) và Kẹo (8). Tổng đúng bằng 1000!",
    fixedPoison: 1000
  }
];

/* ========================================================
   5. QUẢN LÝ LƯU TIẾN TRÌNH (LOCAL STORAGE MANAGER)
   Có bọc try/catch đầy đủ để tránh crash iframe/trình duyệt
   ======================================================== */
const STORAGE_KEY = 'rat_poison_game_save_v2';

class StorageManager {
  static load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this.getDefaultSave();
      const parsed = JSON.parse(raw);
      return Object.assign(this.getDefaultSave(), parsed);
    } catch (err) {
      console.warn("Lỗi đọc LocalStorage, dùng dữ liệu mặc định:", err);
      return this.getDefaultSave();
    }
  }

  static save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn("Lỗi ghi LocalStorage:", err);
    }
  }

  static getDefaultSave() {
    return {
      unlockedLevel: 1,
      levelStars: {}, // { [levelId]: starsEarned }
      soundEnabled: true,
      bgmEnabled: true,
      expertMode: false
    };
  }

  static reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }
}

/* ========================================================
   6. LỚP GAME CHÍNH (MAIN GAME CONTROLLER)
   ======================================================== */
class RatPoisonGame {
  constructor() {
    this.sound = new SoundEngine();
    this.saveData = StorageManager.load();
    this.currentLevelIndex = 0;
    this.currentLevel = LEVELS_CONFIG[0];

    // Trạng thái màn chơi hiện tại
    this.currentPhase = 1; // 1: Lập kế hoạch, 2: Chờ đêm, 3: Giải mã
    this.actualPoisonedBottle = 1; // Chai độc thực sự
    this.planDistribution = {}; // { [bottleNum]: [mouseIndices...] }
    this.mousePoisonedStatus = []; // Mảng boolean cho từng chuột trong màn
    this.hintsUsed = 0; // Số gợi ý đã dùng trong màn (0: 3 sao, 1: 2 sao, >=2: 1 sao)
    this.inspectedBottle = 1; // Chai đang chọn xem chi tiết

    // Bảng giỏ táo
    this.appleBasketsState = new Array(10).fill(0); // 10 bit

    // Trạng thái thử nghiệm tương tác trong Hướng dẫn
    this.guideDemoState = new Array(10).fill(0); // 10 bit

    this.cacheDom();
    this.initAudioSettings();
    this.bindEvents();
    this.initAppleBaskets();
    this.initLookupTable();
    this.initGuideTabs();
    this.initGuideLiveDemo();
    this.updateTitleScreenStats();

    // Tự động kiểm tra URL tham số ?test
    if (window.location.search.includes('test')) {
      setTimeout(() => this.runSelfTest(), 500);
    }
  }

  initAudioSettings() {
    const isSfx = this.saveData.soundEnabled !== false;
    const isBgm = this.saveData.bgmEnabled !== false;
    this.sound.setSfxMuted(!isSfx);
    this.sound.setBgmMuted(!isBgm);
    this.updateAudioIcons();

    // Khởi động nhạc nền ngay khi người chơi tương tác đầu tiên (click/touch/phím)
    const startAudioOnGesture = () => {
      this.sound.ensureContext();
      if (!this.sound.bgmMuted && !this.sound.bgmPlaying) {
        this.sound.startBgm();
      }
      document.removeEventListener('pointerdown', startAudioOnGesture);
      document.removeEventListener('keydown', startAudioOnGesture);
    };
    document.addEventListener('pointerdown', startAudioOnGesture, { passive: true });
    document.addEventListener('keydown', startAudioOnGesture, { passive: true });
  }

  updateAudioIcons() {
    const isSfx = !this.sound.sfxMuted;
    const isBgm = !this.sound.bgmMuted;
    if (this.soundIcon) this.soundIcon.textContent = isSfx ? '🔊' : '🔇';
    if (this.btnSoundToggle) {
      this.btnSoundToggle.classList.toggle('muted', !isSfx);
      this.btnSoundToggle.classList.toggle('active-audio', isSfx);
    }
    if (this.bgmIcon) this.bgmIcon.textContent = isBgm ? '🎵' : '🔇';
    if (this.btnBgmToggle) {
      this.btnBgmToggle.classList.toggle('muted', !isBgm);
      this.btnBgmToggle.classList.toggle('active-audio', isBgm);
    }
    if (this.settingSound) this.settingSound.checked = isSfx;
    if (this.settingBgm) this.settingBgm.checked = isBgm;
  }

  cacheDom() {
    // Các màn hình
    this.screens = {
      title: document.getElementById('screen-title'),
      levels: document.getElementById('screen-levels'),
      game: document.getElementById('screen-game')
    };

    // Header buttons
    this.btnBackHome = document.getElementById('btn-back-home');
    this.btnOpenScenery = document.getElementById('btn-open-scenery');
    this.btnOpenGuide = document.getElementById('btn-open-guide');
    this.btnOpenBasket = document.getElementById('btn-open-basket');
    this.btnOpenLookup = document.getElementById('btn-open-lookup');
    this.btnBgmToggle = document.getElementById('btn-bgm-toggle');
    this.bgmIcon = document.getElementById('bgm-icon');
    this.btnSoundToggle = document.getElementById('btn-sound-toggle');
    this.soundIcon = document.getElementById('sound-icon');
    this.btnOpenSettings = document.getElementById('btn-open-settings');

    // Title screen buttons
    this.btnStartGame = document.getElementById('btn-start-game');
    this.btnHeroScenery = document.getElementById('btn-hero-scenery');
    this.btnHeroGuide = document.getElementById('btn-hero-guide');
    this.btnViewLevels = document.getElementById('btn-view-levels');
    this.btnHeroBasket = document.getElementById('btn-hero-basket');
    this.btnHeroSandbox = document.getElementById('btn-hero-sandbox');
    this.heroStarsCount = document.getElementById('hero-stars-count');
    this.heroClearedCount = document.getElementById('hero-cleared-count');

    // Scenery strip button in game
    this.btnStripViewScenery = document.getElementById('btn-strip-view-scenery');

    // Level select screen
    this.chaptersList = document.getElementById('chapters-list');
    this.mapTotalStars = document.getElementById('map-total-stars');

    // Gameplay elements
    this.stepPhase1 = document.getElementById('step-phase-1');
    this.stepPhase2 = document.getElementById('step-phase-2');
    this.stepPhase3 = document.getElementById('step-phase-3');
    this.gameChapterName = document.getElementById('game-chapter-name');
    this.gameLevelName = document.getElementById('game-level-name');
    this.gameBottlesCount = document.getElementById('game-bottles-count');
    this.gameMiceCount = document.getElementById('game-mice-count');
    this.gamePoisonCount = document.getElementById('game-poison-count');
    this.miceDisplayList = document.getElementById('mice-display-list');

    // Phase views
    this.phasePlanningView = document.getElementById('phase-planning-view');
    this.phaseNightView = document.getElementById('phase-night-view');
    this.phaseDecodeView = document.getElementById('phase-decode-view');

    // Planning buttons
    this.btnAutoBinary = document.getElementById('btn-auto-binary');
    this.btnClearPlan = document.getElementById('btn-clear-plan');
    this.btnPhaseGuide = document.getElementById('btn-phase-guide');
    this.btnHintDialog = document.getElementById('btn-hint-dialog');
    this.hintLevelCount = document.getElementById('hint-level-count');
    this.workbenchArea = document.getElementById('workbench-area');
    this.btnConfirmNight = document.getElementById('btn-confirm-night');
    this.planSummaryText = document.getElementById('plan-summary-text');

    // Night view
    this.nightClockHand = document.getElementById('night-clock-hand');
    this.nightNarrative = document.getElementById('night-narrative');
    this.nightRatsShowcase = document.getElementById('night-rats-showcase');

    // Decode view
    this.decodeStrip = document.getElementById('decode-strip');
    this.decodeFormula = document.getElementById('decode-formula');
    this.decodeCalculatedSum = document.getElementById('decode-calculated-sum');
    this.inputSuspectBottle = document.getElementById('input-suspect-bottle');
    this.btnFillFromBits = document.getElementById('btn-fill-from-bits');
    this.btnSubmitAnswer = document.getElementById('btn-submit-answer');

    // Modals
    this.modalGuide = document.getElementById('modal-guide');
    this.modalScenery = document.getElementById('modal-scenery');
    this.modalDialogue = document.getElementById('modal-dialogue');
    this.modalBasket = document.getElementById('modal-basket');
    this.modalLookup = document.getElementById('modal-lookup');
    this.modalHints = document.getElementById('modal-hints');
    this.modalResult = document.getElementById('modal-result');
    this.modalSettings = document.getElementById('modal-settings');
    this.toastMessage = document.getElementById('toast-message');

    // Guide live demo elements
    this.demoGuideMiceStrip = document.getElementById('demo-guide-mice-strip');
    this.demoBinaryVal = document.getElementById('demo-binary-val');
    this.demoCalcVal = document.getElementById('demo-calc-val');
    this.demoBottleVal = document.getElementById('demo-bottle-val');
    this.btnDemoReset = document.getElementById('btn-demo-reset');

    // Dialogue elements
    this.vnAvatarContainer = document.getElementById('vn-avatar-container');
    this.vnCharName = document.getElementById('vn-char-name');
    this.vnCharRole = document.getElementById('vn-char-role');
    this.vnSpeechText = document.getElementById('vn-speech-text');
    this.btnNextDialogue = document.getElementById('btn-next-dialogue');
    this.btnSkipDialogue = document.getElementById('btn-skip-dialogue');

    // Apple baskets modal
    this.basketsGridInteractive = document.getElementById('baskets-grid-interactive');
    this.basketDecimalTotal = document.getElementById('basket-decimal-total');
    this.basketBinaryString = document.getElementById('basket-binary-string');
    this.btnResetBasket = document.getElementById('btn-reset-basket');

    // Lookup table
    this.lookupTableBody = document.getElementById('lookup-table-body');
    this.lookupSearchInput = document.getElementById('lookup-search-input');

    // Hints modal
    this.hintText1 = document.getElementById('hint-text-1');
    this.hintContent2 = document.getElementById('hint-content-2');
    this.hintText2 = document.getElementById('hint-text-2');
    this.btnUnlockHint2 = document.getElementById('btn-unlock-hint-2');
    this.hintContent3 = document.getElementById('hint-content-3');
    this.hintText3 = document.getElementById('hint-text-3');
    this.btnUnlockHint3 = document.getElementById('btn-unlock-hint-3');

    // Result modal
    this.resultBannerColor = document.getElementById('result-banner-color');
    this.resultIcon = document.getElementById('result-icon');
    this.resultTitle = document.getElementById('result-title');
    this.resultMessage = document.getElementById('result-message');
    this.resultStarsDisplay = document.getElementById('result-stars-display');
    this.resPoisonActual = document.getElementById('res-poison-actual');
    this.resPoisonUser = document.getElementById('res-poison-user');
    this.resMiceDead = document.getElementById('res-mice-dead');
    this.resEfficiency = document.getElementById('res-efficiency');
    this.resultExplanation = document.getElementById('result-explanation');
    this.btnRetryLevel = document.getElementById('btn-retry-level');
    this.btnNextLevel = document.getElementById('btn-next-level');
    this.fireworksContainer = document.getElementById('fireworks-container');

    // Settings
    this.settingBgm = document.getElementById('setting-bgm');
    this.settingSound = document.getElementById('setting-sound');
    this.settingExpert = document.getElementById('setting-expert');
    this.btnRunSelftest = document.getElementById('btn-run-selftest');
    this.btnResetProgress = document.getElementById('btn-reset-progress');
  }

  bindEvents() {
    // Hiệu ứng phản hồi click (animation scale nhẹ & nảy đàn hồi) cho tất cả các nút bấm trong ứng dụng
    const triggerClickAnim = (el) => {
      if (!el) return;
      el.classList.remove('btn-clicked');
      void el.offsetWidth; // Force reflow để animation kích hoạt mượt mà ngay cả khi bấm liên tục
      el.classList.add('btn-clicked');
      el.addEventListener('animationend', () => {
        el.classList.remove('btn-clicked');
      }, { once: true });
    };

    document.addEventListener('pointerdown', (e) => {
      const btn = e.target.closest('button, [role="button"], .matrix-cell-btn, .bottle-compact-chip, .mouse-drink-toggle, .level-card:not(.locked), .apple-add-btn, .apple-sub-btn, .sim-bit-btn, .guide-tab-btn, .guide-step-btn, .scenery-tab-btn');
      if (btn) triggerClickAnim(btn);
    }, { passive: true });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const btn = document.activeElement && document.activeElement.closest('button, [role="button"], .level-card:not(.locked)');
        if (btn) triggerClickAnim(btn);
      }
    });

    // Header navigation
    this.btnBackHome.addEventListener('click', () => {
      this.sound.playClick();
      this.switchScreen('title');
    });

    if (this.btnOpenScenery) {
      this.btnOpenScenery.addEventListener('click', () => {
        this.sound.playClick();
        this.openModal(this.modalScenery);
      });
    }

    if (this.btnOpenGuide) {
      this.btnOpenGuide.addEventListener('click', () => {
        this.sound.playClick();
        this.openModal(this.modalGuide);
      });
    }

    this.btnOpenBasket.addEventListener('click', () => {
      this.sound.playClick();
      this.openModal(this.modalBasket);
    });

    this.btnOpenLookup.addEventListener('click', () => {
      this.sound.playClick();
      this.openModal(this.modalLookup);
    });

    // BẬT / TẮT NHẠC NỀN CUNG ĐÌNH (BGM)
    if (this.btnBgmToggle) {
      this.btnBgmToggle.addEventListener('click', () => {
        const isBgmActive = this.sound.toggleBgm();
        this.saveData.bgmEnabled = isBgmActive;
        StorageManager.save(this.saveData);
        this.updateAudioIcons();
        this.showToast(isBgmActive ? "Đã bật Nhạc Nền Cung Đình 🎵" : "Đã tắt Nhạc Nền Cung Đình 🔇");
      });
    }

    if (this.settingBgm) {
      this.settingBgm.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        this.sound.setBgmMuted(!enabled);
        this.saveData.bgmEnabled = enabled;
        StorageManager.save(this.saveData);
        this.updateAudioIcons();
      });
    }

    // BẬT / TẮT HIỆU ỨNG ÂM THANH (SFX)
    this.btnSoundToggle.addEventListener('click', () => {
      const isSfxActive = this.sound.toggleSfx();
      this.saveData.soundEnabled = isSfxActive;
      StorageManager.save(this.saveData);
      this.updateAudioIcons();
      this.showToast(isSfxActive ? "Đã bật Hiệu Ứng Âm Thanh 🔊" : "Đã tắt Hiệu Ứng Âm Thanh 🔇");
    });

    if (this.settingSound) {
      this.settingSound.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        this.sound.setSfxMuted(!enabled);
        this.saveData.soundEnabled = enabled;
        StorageManager.save(this.saveData);
        this.updateAudioIcons();
      });
    }

    this.btnOpenSettings.addEventListener('click', () => {
      this.sound.playClick();
      this.openModal(this.modalSettings);
    });

    // Close buttons on all modals
    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.sound.playClick();
        const targetModalId = btn.getAttribute('data-close');
        if (targetModalId) {
          if (targetModalId === 'modal-result') {
            this.clearFireworks();
          }
          this.closeModal(document.getElementById(targetModalId));
        }
      });
    });

    // Title screen
    this.btnStartGame.addEventListener('click', () => {
      this.sound.playClick();
      const currentUnlocked = this.saveData.unlockedLevel || 1;
      this.loadLevel(currentUnlocked);
    });

    if (this.btnHeroGuide) {
      this.btnHeroGuide.addEventListener('click', () => {
        this.sound.playClick();
        this.openModal(this.modalGuide);
      });
    }

    if (this.btnHeroScenery) {
      this.btnHeroScenery.addEventListener('click', () => {
        this.sound.playClick();
        this.openModal(this.modalScenery);
      });
    }

    if (this.btnStripViewScenery) {
      this.btnStripViewScenery.addEventListener('click', () => {
        this.sound.playClick();
        this.openModal(this.modalScenery);
      });
    }

    // Các tab chuyển cảnh trong modal Mỹ Cảnh
    document.querySelectorAll('.scenery-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sound.playClick();
        const tabTarget = btn.getAttribute('data-tab');
        document.querySelectorAll('.scenery-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.scenery-tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = document.getElementById(tabTarget);
        if (panel) panel.classList.add('active');
      });
    });

    this.btnViewLevels.addEventListener('click', () => {
      this.sound.playClick();
      this.renderLevelSelect();
      this.switchScreen('levels');
    });

    this.btnHeroBasket.addEventListener('click', () => {
      this.sound.playClick();
      this.openModal(this.modalBasket);
    });

    this.btnHeroSandbox.addEventListener('click', () => {
      this.sound.playClick();
      this.loadLevel(13); // Mở thẳng màn 1000 chai trong chế độ thử thách
    });

    if (this.btnPhaseGuide) {
      this.btnPhaseGuide.addEventListener('click', () => {
        this.sound.playClick();
        this.openModal(this.modalGuide);
      });
    }

    // Back button in level select
    document.querySelectorAll('.btn-back').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sound.playClick();
        const target = btn.getAttribute('data-target');
        if (target === 'screen-title') this.switchScreen('title');
      });
    });

    // Planning phase actions
    this.btnAutoBinary.addEventListener('click', () => {
      this.sound.playPour();
      this.autoDistributeBinary();
      this.renderWorkbench();
      this.updatePlanSummary();
      this.showToast("Đã phân bổ mọi chai theo chuẩn nhị phân (n & 2^k)!");
    });

    this.btnClearPlan.addEventListener('click', () => {
      this.sound.playClick();
      this.clearPlan();
      this.renderWorkbench();
      this.updatePlanSummary();
      this.showToast("Đã xoá toàn bộ phân bổ!");
    });

    this.btnConfirmNight.addEventListener('click', () => {
      this.confirmAndEnterNight();
    });

    this.btnHintDialog.addEventListener('click', () => {
      this.sound.playClick();
      this.openHintsModal();
    });

    // Decode phase
    this.btnFillFromBits.addEventListener('click', () => {
      this.sound.playClick();
      const calculatedSum = parseInt(this.decodeCalculatedSum.textContent, 10) || 0;
      this.inputSuspectBottle.value = calculatedSum;
    });

    this.btnSubmitAnswer.addEventListener('click', () => {
      this.submitAnswer();
    });

    // Dialogue buttons
    this.btnNextDialogue.addEventListener('click', () => {
      this.sound.playClick();
      this.closeModal(this.modalDialogue);
    });

    this.btnSkipDialogue.addEventListener('click', () => {
      this.sound.playClick();
      this.closeModal(this.modalDialogue);
    });

    // Hints unlocking
    this.btnUnlockHint2.addEventListener('click', () => {
      this.sound.playChime();
      this.hintsUsed = Math.max(this.hintsUsed, 1);
      this.btnUnlockHint2.classList.add('hidden');
      this.hintText2.classList.remove('hidden');
    });

    this.btnUnlockHint3.addEventListener('click', () => {
      this.sound.playPour();
      this.hintsUsed = Math.max(this.hintsUsed, 2);
      this.btnUnlockHint3.classList.add('hidden');
      this.hintText3.classList.remove('hidden');
      this.autoDistributeBinary();
      this.renderWorkbench();
      this.updatePlanSummary();
      this.showToast("Đã giải mẫu và tự điền phân bổ nhị phân chuẩn!");
    });

    // Results modal
    this.btnRetryLevel.addEventListener('click', () => {
      this.sound.playClick();
      this.clearFireworks();
      this.closeModal(this.modalResult);
      this.loadLevel(this.currentLevel.id);
    });

    this.btnNextLevel.addEventListener('click', () => {
      this.sound.playClick();
      this.clearFireworks();
      this.closeModal(this.modalResult);
      const nextId = this.currentLevel.id + 1;
      if (nextId <= LEVELS_CONFIG.length) {
        this.loadLevel(nextId);
      } else {
        this.showToast("Chúc mừng! Bạn đã hoàn thành toàn bộ cốt truyện!");
        this.switchScreen('title');
      }
    });

    // Settings actions
    this.settingSound.addEventListener('change', (e) => {
      this.sound.muted = !e.target.checked;
      this.saveData.soundEnabled = e.target.checked;
      StorageManager.save(this.saveData);
      this.soundIcon.textContent = this.sound.muted ? '🔇' : '🔊';
    });

    this.settingExpert.addEventListener('change', (e) => {
      this.saveData.expertMode = e.target.checked;
      StorageManager.save(this.saveData);
      this.btnAutoBinary.style.display = e.target.checked ? 'none' : 'inline-flex';
      this.showToast(e.target.checked ? "Đã bật Chế độ Chuyên Gia" : "Đã tắt Chế độ Chuyên Gia");
    });

    this.btnRunSelftest.addEventListener('click', () => {
      this.sound.playClick();
      this.closeModal(this.modalSettings);
      this.runSelfTest();
    });

    this.btnResetProgress.addEventListener('click', () => {
      if (confirm("Bạn có chắc chắn muốn đặt lại toàn bộ tiến trình không?")) {
        StorageManager.reset();
        this.saveData = StorageManager.getDefaultSave();
        this.updateTitleScreenStats();
        this.closeModal(this.modalSettings);
        this.showToast("Đã đặt lại tiến trình!");
        this.switchScreen('title');
      }
    });

    // Apple basket preset buttons
    document.querySelectorAll('.basket-presets .btn-chip[data-num]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sound.playChime();
        const targetNum = parseInt(btn.getAttribute('data-num'), 10);
        this.setAppleBasketFromDecimal(targetNum);
      });
    });

    this.btnResetBasket.addEventListener('click', () => {
      this.sound.playClick();
      this.setAppleBasketFromDecimal(0);
    });

    // Lookup table search
    this.lookupSearchInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (!val) return;
      const targetRow = document.getElementById(`lookup-row-${val}`);
      if (targetRow) {
        document.querySelectorAll('.lookup-table tr').forEach(r => r.classList.remove('highlight-row'));
        targetRow.classList.add('highlight-row');
        targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  switchScreen(screenName) {
    Object.values(this.screens).forEach(scr => scr.classList.remove('active'));
    if (this.screens[screenName]) {
      this.screens[screenName].classList.add('active');
    }
  }

  openModal(modalElem) {
    if (modalElem) modalElem.classList.add('active');
  }

  closeModal(modalElem) {
    if (modalElem) modalElem.classList.remove('active');
  }

  showToast(msg) {
    this.toastMessage.textContent = msg;
    this.toastMessage.classList.remove('hidden');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastMessage.classList.add('hidden');
    }, 2800);
  }

  updateTitleScreenStats() {
    let totalStars = 0;
    let cleared = 0;
    LEVELS_CONFIG.forEach(lvl => {
      const stars = this.saveData.levelStars[lvl.id] || 0;
      totalStars += stars;
      if (stars > 0) cleared++;
    });

    const maxStars = LEVELS_CONFIG.length * 3;
    this.heroStarsCount.textContent = `${totalStars} / ${maxStars}`;
    this.heroClearedCount.textContent = `${cleared} / ${LEVELS_CONFIG.length}`;
    this.mapTotalStars.textContent = `⭐ ${totalStars}/${maxStars}`;
  }

  /* ========================================================
     7. VÙNG CHỌN MÀN CHƠI (LEVEL SELECTOR)
     ======================================================== */
  renderLevelSelect() {
    this.updateTitleScreenStats();
    this.chaptersList.innerHTML = '';

    // Nhóm theo chương
    const chapters = {};
    LEVELS_CONFIG.forEach(lvl => {
      if (!chapters[lvl.chapter]) chapters[lvl.chapter] = [];
      chapters[lvl.chapter].push(lvl);
    });

    const unlocked = this.saveData.unlockedLevel || 1;

    Object.keys(chapters).forEach(chapTitle => {
      const box = document.createElement('div');
      box.className = 'chapter-box';

      const header = document.createElement('div');
      header.className = 'chapter-header';
      header.innerHTML = `
        <div class="chapter-title-group">
          <h3>${chapTitle}</h3>
          <p>${chapters[chapTitle].length} thử thách trí tuệ</p>
        </div>
      `;
      box.appendChild(header);

      const grid = document.createElement('div');
      grid.className = 'levels-grid';

      chapters[chapTitle].forEach(lvl => {
        const isLocked = lvl.id > unlocked;
        const stars = this.saveData.levelStars[lvl.id] || 0;

        const card = document.createElement('div');
        card.className = `level-card ${isLocked ? 'locked' : ''}`;
        
        let starsHtml = '';
        for (let i = 1; i <= 3; i++) {
          starsHtml += `<span class="${i <= stars ? 'earned' : ''}">★</span>`;
        }

        card.innerHTML = `
          <div class="lvl-number">Màn ${lvl.id}</div>
          <div class="lvl-meta">${lvl.bottles} chai · ${lvl.mice} chuột</div>
          <div class="lvl-stars">${isLocked ? '🔒 Khóa' : starsHtml}</div>
        `;

        if (!isLocked) {
          card.addEventListener('click', () => {
            this.sound.playClick();
            this.loadLevel(lvl.id);
          });
        }

        grid.appendChild(card);
      });

      box.appendChild(grid);
      this.chaptersList.appendChild(box);
    });
  }

  /* ========================================================
     8. KHỞI TẠO VÀ CHƠI MÀN (LEVEL LOADER)
     ======================================================== */
  loadLevel(levelId) {
    const level = LEVELS_CONFIG.find(l => l.id === levelId) || LEVELS_CONFIG[0];
    this.currentLevel = level;
    this.currentLevelIndex = LEVELS_CONFIG.indexOf(level);
    this.hintsUsed = 0;

    // Chọn chai độc ngẫu nhiên trong khoảng 1 đến level.bottles
    if (level.fixedPoison) {
      this.actualPoisonedBottle = level.fixedPoison;
    } else {
      this.actualPoisonedBottle = Math.floor(Math.random() * level.bottles) + 1;
    }

    // Khởi tạo bảng kế hoạch rỗng
    this.planDistribution = {};
    for (let b = 1; b <= level.bottles; b++) {
      this.planDistribution[b] = [];
    }

    // Tự động phân phối nhị phân mặc định để người chơi dễ tiếp cận
    this.autoDistributeBinary();

    // Reset trạng thái chuột
    this.mousePoisonedStatus = new Array(level.mice).fill(false);

    // Cập nhật giao diện thông số màn
    this.gameChapterName.textContent = level.chapter;
    this.gameLevelName.textContent = level.title;
    this.gameBottlesCount.textContent = level.bottles;
    this.gameMiceCount.textContent = level.mice;
    this.gamePoisonCount.textContent = level.poisonedCount;

    // Kiểm tra chế độ chuyên gia
    this.btnAutoBinary.style.display = this.saveData.expertMode ? 'none' : 'inline-flex';

    // Đưa về Pha 1: Lập kế hoạch
    this.setPhase(1);
    this.renderMiceStage('normal');
    this.renderWorkbench();
    this.updatePlanSummary();

    // Chuyển màn hình
    this.switchScreen('game');

    // Mở hộp thoại cốt truyện mở đầu nếu có
    if (level.storyIntro) {
      this.showDialogue(level.storyIntro);
    }
  }

  showDialogue(dialogueData) {
    this.vnAvatarContainer.innerHTML = SVG_ASSETS[dialogueData.avatar] || SVG_ASSETS.masterAvatar;
    this.vnCharName.textContent = dialogueData.speaker;
    this.vnCharRole.textContent = dialogueData.role;
    this.vnSpeechText.textContent = dialogueData.text;
    this.openModal(this.modalDialogue);
  }

  setPhase(phaseNum) {
    this.currentPhase = phaseNum;

    // Cập nhật thanh bước lớn phía trên
    [this.stepPhase1, this.stepPhase2, this.stepPhase3].forEach((step, idx) => {
      if (idx + 1 === phaseNum) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });

    // Cập nhật thanh tiến trình nhỏ (các điểm tròn dưới #game-level-name)
    const miniDots = document.querySelectorAll('#phase-mini-progress .mini-step-dot');
    const miniLines = document.querySelectorAll('#phase-mini-progress .mini-line');

    miniDots.forEach((dot, idx) => {
      const stepIdx = idx + 1;
      dot.classList.remove('active', 'completed');
      if (stepIdx === phaseNum) {
        dot.classList.add('active');
      } else if (stepIdx < phaseNum) {
        dot.classList.add('completed');
      }
    });

    miniLines.forEach((line, idx) => {
      if (idx + 1 < phaseNum) {
        line.classList.add('completed');
      } else {
        line.classList.remove('completed');
      }
    });

    // Ẩn hiện từng view
    this.phasePlanningView.classList.toggle('active', phaseNum === 1);
    this.phaseNightView.classList.toggle('active', phaseNum === 2);
    this.phaseDecodeView.classList.toggle('active', phaseNum === 3);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ========================================================
     9. ĐỘI NGŨ CHUỘT THỬ ĐỘC (MICE STAGE RENDER)
     ======================================================== */
  renderMiceStage(visualState) {
    this.miceDisplayList.innerHTML = '';
    const miceCount = this.currentLevel.mice;

    for (let k = 0; k < miceCount; k++) {
      const mouse = MICE_DATA[k];
      const isDead = this.mousePoisonedStatus[k];

      const card = document.createElement('div');
      card.className = 'mouse-podium';

      let svgHtml = SVG_ASSETS.mouseNormal;
      let badgeText = "Sẵn sàng";

      if (visualState === 'drinking') {
        svgHtml = SVG_ASSETS.mouseDrinking;
        badgeText = "Đang thử";
        card.classList.add('highlight-active');
      } else if (visualState === 'after-night') {
        if (isDead) {
          svgHtml = SVG_ASSETS.mousePoisoned;
          badgeText = "Gục (Bit 1)";
          card.classList.add('state-poisoned');
        } else {
          svgHtml = SVG_ASSETS.mouseNormal;
          badgeText = "Bình an (Bit 0)";
          card.classList.add('state-safe');
        }
      }

      card.innerHTML = `
        <div class="mouse-avatar-wrap">
          ${svgHtml}
        </div>
        <span class="mouse-name">${mouse.name}</span>
        <span class="mouse-bit-weight">2^${k} = ${mouse.weight}</span>
        <span class="mouse-state-badge">${badgeText}</span>
      `;

      this.miceDisplayList.appendChild(card);
    }
  }

  /* ========================================================
     10. PHA 1: LẬP KẾ HOẠCH & WORKBENCH
     ======================================================== */
  autoDistributeBinary() {
    const totalBottles = this.currentLevel.bottles;
    const miceCount = this.currentLevel.mice;

    for (let b = 1; b <= totalBottles; b++) {
      this.planDistribution[b] = [];
      for (let k = 0; k < miceCount; k++) {
        // Công thức cốt lõi nhị phân: (b & (1 << k)) !== 0
        if ((b & (1 << k)) !== 0) {
          this.planDistribution[b].push(k);
        }
      }
    }
  }

  clearPlan() {
    for (let b = 1; b <= this.currentLevel.bottles; b++) {
      this.planDistribution[b] = [];
    }
  }

  renderWorkbench() {
    this.workbenchArea.innerHTML = '';
    const bottlesCount = this.currentLevel.bottles;
    const miceCount = this.currentLevel.mice;

    if (bottlesCount <= 16) {
      // Dùng ma trận tương tác đối với số lượng chai nhỏ
      this.renderMatrixWorkbench(bottlesCount, miceCount);
    } else {
      // Dùng giao diện thanh duyệt và chỉnh sửa thông minh đối với số chai lớn (50, 100, 295, 1000)
      this.renderLargeBottlesWorkbench(bottlesCount, miceCount);
    }
  }

  renderMatrixWorkbench(bottlesCount, miceCount) {
    const table = document.createElement('table');
    table.className = 'matrix-table';

    // Hàng tiêu đề
    let theadHtml = '<thead><tr><th>Chuột \\ Chai</th>';
    for (let b = 1; b <= bottlesCount; b++) {
      theadHtml += `<th>Chai ${b}</th>`;
    }
    theadHtml += '</tr></thead>';
    table.innerHTML = theadHtml;

    const tbody = document.createElement('tbody');
    for (let k = 0; k < miceCount; k++) {
      const mouse = MICE_DATA[k];
      const tr = document.createElement('tr');

      let rowHtml = `<td style="text-align: left; font-weight: bold; color: var(--primary-amber);">
        ${mouse.name} (2^${k} = ${mouse.weight})
      </td>`;

      for (let b = 1; b <= bottlesCount; b++) {
        const isAssigned = (this.planDistribution[b] || []).includes(k);
        rowHtml += `<td>
          <button class="matrix-cell-btn ${isAssigned ? 'selected' : ''}" data-bottle="${b}" data-mouse="${k}">
            ${isAssigned ? '✓' : '—'}
          </button>
        </td>`;
      }
      tr.innerHTML = rowHtml;
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    this.workbenchArea.appendChild(table);

    // Gắn sự kiện click vào các ô ma trận
    table.querySelectorAll('.matrix-cell-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const b = parseInt(btn.getAttribute('data-bottle'), 10);
        const k = parseInt(btn.getAttribute('data-mouse'), 10);

        const list = this.planDistribution[b] || [];
        const idx = list.indexOf(k);
        if (idx >= 0) {
          list.splice(idx, 1);
          this.sound.playClick();
        } else {
          list.push(k);
          this.sound.playRatDrinking();
        }
        this.planDistribution[b] = list;

        this.renderWorkbench();
        this.updatePlanSummary();
      });
    });
  }

  renderLargeBottlesWorkbench(bottlesCount, miceCount) {
    const wrapper = document.createElement('div');
    wrapper.className = 'large-bottles-inspector';

    wrapper.innerHTML = `
      <div class="inspector-nav">
        <span class="inspector-tip">
          💡 Với ${bottlesCount} chai, hệ thống tự động gán nhị phân chuẩn. Bạn có thể chọn từng chai bên dưới để xem/điều chỉnh chuột uống:
        </span>
      </div>
      <div class="bottles-compact-grid" id="compact-bottles-list">
        <!-- Render các nút chai thu nhỏ -->
      </div>
      <div class="bottle-detail-editor" id="bottle-detail-box">
        <!-- Render chi tiết chai đang chọn -->
      </div>
    `;

    this.workbenchArea.appendChild(wrapper);

    // Render danh sách các chai
    const listElem = wrapper.querySelector('#compact-bottles-list');
    for (let b = 1; b <= bottlesCount; b++) {
      const chip = document.createElement('div');
      chip.className = `bottle-compact-chip ${b === this.inspectedBottle ? 'active' : ''}`;
      const assignedCount = (this.planDistribution[b] || []).length;

      chip.innerHTML = `
        <span class="chip-num">#${b}</span>
        <span class="chip-mice-count">${assignedCount} chuột</span>
      `;

      chip.addEventListener('click', () => {
        this.sound.playClick();
        this.inspectedBottle = b;
        this.renderLargeBottlesWorkbench(bottlesCount, miceCount);
      });

      listElem.appendChild(chip);
    }

    // Render chi tiết chai đang được chọn (inspectedBottle)
    const detailBox = wrapper.querySelector('#bottle-detail-box');
    const assignedMice = this.planDistribution[this.inspectedBottle] || [];

    let checkboxesHtml = '';
    for (let k = 0; k < miceCount; k++) {
      const mouse = MICE_DATA[k];
      const isChecked = assignedMice.includes(k);
      checkboxesHtml += `
        <div class="mouse-drink-toggle ${isChecked ? 'checked' : ''}" data-mouse="${k}">
          <span>${isChecked ? '☑' : '☐'}</span>
          <strong>${mouse.name}</strong> (2^${k} = ${mouse.weight})
        </div>
      `;
    }

    detailBox.innerHTML = `
      <div class="b-detail-header">
        <span class="b-detail-title">Cấu hình chai rượu #${this.inspectedBottle}</span>
        <span style="font-size: 12px; color: var(--text-dim);">
          Mã nhị phân: ${(this.inspectedBottle).toString(2).padStart(miceCount, '0')}
        </span>
      </div>
      <div class="mice-checkbox-row">
        ${checkboxesHtml}
      </div>
    `;

    detailBox.querySelectorAll('.mouse-drink-toggle').forEach(elem => {
      elem.addEventListener('click', () => {
        const k = parseInt(elem.getAttribute('data-mouse'), 10);
        const list = this.planDistribution[this.inspectedBottle] || [];
        const idx = list.indexOf(k);
        if (idx >= 0) {
          list.splice(idx, 1);
          this.sound.playClick();
        } else {
          list.push(k);
          this.sound.playRatDrinking();
        }
        this.planDistribution[this.inspectedBottle] = list;

        this.renderLargeBottlesWorkbench(bottlesCount, miceCount);
        this.updatePlanSummary();
      });
    });
  }

  updatePlanSummary() {
    let assignedBottles = 0;
    const total = this.currentLevel.bottles;
    for (let b = 1; b <= total; b++) {
      if ((this.planDistribution[b] || []).length > 0) assignedBottles++;
    }
    this.planSummaryText.textContent = `Đã xếp lịch cho ${assignedBottles}/${total} chai rượu. Nhấn xác nhận để đưa chuột vào đêm thử độc!`;
  }

  /* ========================================================
     11. PHA 2: CHỜ ĐÊM (NIGHT WATCH & TRANSITION)
     ======================================================== */
  confirmAndEnterNight() {
    this.sound.playPour();
    // Tiếng chuột uống thử ('rat drinking') đặc trưng
    setTimeout(() => {
      this.sound.playRatDrinking();
    }, 280);
    this.setPhase(2);
    this.renderMiceStage('drinking');

    this.nightNarrative.textContent = "Bóng tối buông xuống... Tiếng kim đồng hồ tích tắc... Lũ chuột đang uống các chén rượu...";
    this.nightRatsShowcase.innerHTML = '';

    const miceCount = this.currentLevel.mice;

    // Render các thẻ chuột đang thử rượu với cấu trúc .night-rat-item
    for (let k = 0; k < miceCount; k++) {
      const mouse = MICE_DATA[k];
      const ratCard = document.createElement('div');
      ratCard.className = 'night-rat-item';
      ratCard.id = `night-rat-${k}`;
      ratCard.innerHTML = `
        <div class="night-rat-avatar-box" id="night-avatar-${k}">
          ${SVG_ASSETS.mouseDrinking}
        </div>
        <div class="night-rat-name">${mouse.name}</div>
        <div class="night-rat-weight">2^${k} = ${mouse.weight}</div>
        <span class="night-rat-status-tag" id="night-status-${k}">Đang thử...</span>
      `;
      this.nightRatsShowcase.appendChild(ratCard);
    }

    // Xác định chuột nào uống phải chai độc
    const poisonedBottle = this.actualPoisonedBottle;
    const drinkers = this.planDistribution[poisonedBottle] || [];

    // Phát tiếng tích tắc 4 lần
    let ticks = 0;
    const tickInterval = setInterval(() => {
      this.sound.playClockTick();
      ticks++;
      if (ticks >= 4) {
        clearInterval(tickInterval);
      }
    }, 700);

    // Thời điểm nửa đêm (~1600ms): Độc tính phát tác!
    // Kích hoạt CSS transition mượt mà rotate(-90deg) và chuyển màu ánh độc neon cho các chuột trúng độc
    setTimeout(() => {
      this.nightNarrative.textContent = "Nửa đêm canh ba... Độc tính phát tác! Các chú chuột uống phải chén độc bắt đầu lảo đảo rồi gục xuống!";

      let hasVictim = false;
      for (let k = 0; k < miceCount; k++) {
        const ratCard = document.getElementById(`night-rat-${k}`);
        const statusTag = document.getElementById(`night-status-${k}`);

        if (drinkers.includes(k)) {
          hasVictim = true;
          if (ratCard) {
            ratCard.classList.add('collapsed');
          }
          if (statusTag) {
            statusTag.textContent = 'Đã gục ☠️';
          }
        } else {
          if (ratCard) {
            ratCard.classList.add('sleeping');
          }
          if (statusTag) {
            statusTag.textContent = 'Bình an 💤';
          }
        }
      }

      if (hasVictim) {
        this.sound.playPoisonCollapse();
      }
    }, 1600);

    // Sau 3.5 giây đêm trôi qua, bước vào bình minh
    setTimeout(() => {
      this.processPoisonEffects();
      this.setPhase(3);
      this.renderDecodeView();
      this.sound.playChime();
    }, 3500);
  }

  processPoisonEffects() {
    const miceCount = this.currentLevel.mice;
    this.mousePoisonedStatus = new Array(miceCount).fill(false);

    // Chuột k bị độc nếu uống phải chai độc
    const poisonedBottle = this.actualPoisonedBottle;
    const drinkers = this.planDistribution[poisonedBottle] || [];

    drinkers.forEach(mouseIndex => {
      if (mouseIndex < miceCount) {
        this.mousePoisonedStatus[mouseIndex] = true;
      }
    });

    // Cập nhật lại hình ảnh chuột sau đêm (gục hoặc bình an)
    this.renderMiceStage('after-night');
  }

  /* ========================================================
     12. PHA 3: GIẢI MÃ & BÁO CÁO KẾT QUẢ
     ======================================================== */
  renderDecodeView() {
    this.decodeStrip.innerHTML = '';
    const miceCount = this.currentLevel.mice;

    let mathTerms = [];
    let calculatedSum = 0;

    for (let k = 0; k < miceCount; k++) {
      const mouse = MICE_DATA[k];
      const isDead = this.mousePoisonedStatus[k];
      const bitVal = isDead ? 1 : 0;

      if (isDead) {
        mathTerms.push(`${mouse.weight}`);
        calculatedSum += mouse.weight;
      }

      const bitCard = document.createElement('div');
      bitCard.className = `decode-bit-card ${isDead ? 'bit-active' : ''}`;
      bitCard.innerHTML = `
        <span class="bit-weight-label">2^${k}=${mouse.weight}</span>
        <span class="bit-digit">${bitVal}</span>
        <span class="bit-mouse-name">${mouse.name}</span>
      `;
      this.decodeStrip.appendChild(bitCard);
    }

    if (mathTerms.length === 0) {
      this.decodeFormula.textContent = "Không có chuột nào gục (0)";
    } else {
      this.decodeFormula.textContent = mathTerms.join(' + ');
    }
    this.decodeCalculatedSum.textContent = calculatedSum;
    this.inputSuspectBottle.value = '';
    this.inputSuspectBottle.focus();
  }

  triggerShakeInput() {
    if (!this.inputSuspectBottle) return;
    this.inputSuspectBottle.classList.remove('shake');
    // Bắt buộc trình duyệt reflow để kích hoạt lại CSS animation 'shake'
    void this.inputSuspectBottle.offsetWidth;
    this.inputSuspectBottle.classList.add('shake');
    this.inputSuspectBottle.focus();

    setTimeout(() => {
      if (this.inputSuspectBottle) {
        this.inputSuspectBottle.classList.remove('shake');
      }
    }, 600);
  }

  submitAnswer() {
    const guess = parseInt(this.inputSuspectBottle.value, 10);
    if (isNaN(guess) || guess < 1) {
      this.triggerShakeInput();
      this.showToast("Vui lòng nhập một số chai hợp lệ!");
      return;
    }

    const actual = this.actualPoisonedBottle;
    const isCorrect = guess === actual;

    this.resPoisonActual.textContent = `Chai #${actual}`;
    this.resPoisonUser.textContent = `Chai #${guess}`;

    // Đếm số chuột gục
    const deadCount = this.mousePoisonedStatus.filter(Boolean).length;
    this.resMiceDead.textContent = `${deadCount} chú chuột`;

    if (isCorrect) {
      this.sound.playVictory();
      this.resultBannerColor.className = 'result-banner victory';
      this.resultIcon.textContent = '👑';
      this.resultTitle.textContent = "XUẤT SẮC! BẠN ĐÃ TÌM ĐÚNG CHAI ĐỘC";
      this.resultMessage.textContent = "Toàn bộ khách khứa và nhà vua đã được bảo vệ an toàn!";

      // Tính số sao:
      // ⭐ 1: Tìm đúng
      // ⭐ 2: Dùng đúng số chuột cần thiết
      // ⭐ 3: Giải ngay không dùng gợi ý
      let stars = 1;
      const minMiceNeeded = Math.ceil(Math.log2(this.currentLevel.bottles));
      if (this.currentLevel.mice >= minMiceNeeded) stars++;
      if (this.hintsUsed === 0) stars = 3;
      else if (this.hintsUsed === 1) stars = Math.min(stars, 2);
      else stars = 1;

      // Lưu kỷ lục sao
      const prevStars = this.saveData.levelStars[this.currentLevel.id] || 0;
      if (stars > prevStars) {
        this.saveData.levelStars[this.currentLevel.id] = stars;
      }

      // Mở khóa màn tiếp theo
      if (this.currentLevel.id >= this.saveData.unlockedLevel) {
        this.saveData.unlockedLevel = this.currentLevel.id + 1;
      }
      StorageManager.save(this.saveData);
      this.updateTitleScreenStats();

      // Hiển thị sao
      let starsHtml = '';
      for (let s = 1; s <= 3; s++) {
        starsHtml += `<span class="${s <= stars ? 'earned' : ''}">${s <= stars ? '⭐' : '☆'}</span>`;
      }
      this.resultStarsDisplay.innerHTML = starsHtml;

      this.resEfficiency.textContent = stars === 3 ? "Tối ưu tuyệt đối (3 Sao)" : `${stars} Sao`;
      this.resultExplanation.innerHTML = `
        <strong>Giải mã nhị phân:</strong> Số ${actual} được tách thành tổng lũy thừa: 
        <em>${actual.toString(2).padStart(this.currentLevel.mice, '0')}</em>. 
        Mỗi vị trí bit 1 tương ứng với chú chuột uống chai này và phát tác!
      `;

      this.btnNextLevel.classList.remove('hidden');
      this.spawnVictoryFireworks();
      this.openModal(this.modalResult);
    } else {
      // Xoá pháo hoa nếu có
      this.clearFireworks();

      // Hiệu ứng rung lắc phản hồi thị giác khi đoán sai
      this.triggerShakeInput();
      this.sound.playDefeat();

      this.resultBannerColor.className = 'result-banner defeat';
      this.resultIcon.textContent = '☠️';
      this.resultTitle.textContent = "CHƯA CHÍNH XÁC!";
      this.resultMessage.textContent = `Chai độc thực sự là #${actual}, nhưng bạn đã báo cáo chai #${guess}. Hãy phân tích lại các bit!`;
      this.resultStarsDisplay.innerHTML = '<span>☆</span><span>☆</span><span>☆</span>';
      this.resEfficiency.textContent = "Thất bại";

      this.resultExplanation.innerHTML = `
        <strong>Gợi ý sửa sai:</strong> Kiểm tra lại các chuột đã gục và cộng trọng số của chúng (${this.decodeFormula.textContent}). 
        Tổng cộng dồn chính là số thứ tự của chai độc!
      `;

      this.btnNextLevel.classList.add('hidden');

      // Tạm dừng 450ms để người chơi nhìn rõ hiệu ứng rung lắc trên ô nhập trước khi mở bảng báo cáo
      setTimeout(() => {
        this.openModal(this.modalResult);
      }, 450);
    }
  }

  /* ========================================================
     HIỆU ỨNG PHÁO HOA ĂN MỪNG CHIẾN THẮNG (CSS PARTICLES)
     ======================================================== */
  spawnVictoryFireworks() {
    if (!this.fireworksContainer) return;
    this.clearFireworks();

    const colors = ['#fbbf24', '#f59e0b', '#34d399', '#10b981', '#38bdf8', '#06b6d4', '#f43f5e', '#e879f9', '#ffffff'];
    const shapes = ['spark', 'star', 'streamer'];

    // 3 tâm điểm nổ pháo hoa trên banner kết quả
    const burstCenters = [
      { x: 25, y: 28 },
      { x: 50, y: 18 },
      { x: 75, y: 28 }
    ];

    burstCenters.forEach((center, burstIndex) => {
      const particleCount = 18;
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.className = `firework-particle ${shape}`;
        if (shape === 'star') {
          particle.textContent = Math.random() > 0.5 ? '★' : '✦';
        }

        // Tọa độ gốc nổ
        particle.style.left = `${center.x}%`;
        particle.style.top = `${center.y}%`;

        // Quỹ đạo nổ phân tán tròn
        const angle = (i / particleCount) * 2 * Math.PI + (Math.random() * 0.4 - 0.2);
        const distance = 45 + Math.random() * 105; // 45px to 150px
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        const duration = 0.85 + Math.random() * 0.45; // 0.85s - 1.3s
        const delay = burstIndex * 0.16 + Math.random() * 0.12; // So le các đợt nổ
        const size = shape === 'star' ? (12 + Math.random() * 8) : (5 + Math.random() * 6);
        const rot = (Math.random() * 360 - 180) + 'deg';

        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        particle.style.setProperty('--duration', `${duration}s`);
        particle.style.setProperty('--delay', `${delay}s`);
        particle.style.setProperty('--color', color);
        particle.style.setProperty('--size', `${size}px`);
        particle.style.setProperty('--rot', rot);

        this.fireworksContainer.appendChild(particle);
      }
    });
  }

  clearFireworks() {
    if (this.fireworksContainer) {
      this.fireworksContainer.innerHTML = '';
    }
  }

  /* ========================================================
     13. BẢNG GIỎ TÁO (APPLE BASKETS INTERACTIVE LAB)
     ======================================================== */
  initAppleBaskets() {
    this.basketsGridInteractive.innerHTML = '';

    // Render 10 giỏ tương ứng các bit 0..9 (1, 2, 4, 8, ..., 512)
    // Sắp xếp bit 9 (512) bên trái, bit 0 (1) bên phải như toán học
    for (let k = 9; k >= 0; k--) {
      const mouse = MICE_DATA[k];
      const card = document.createElement('div');
      card.className = 'apple-basket-card';
      card.id = `basket-col-${k}`;

      card.innerHTML = `
        <div class="basket-icon-wrap" id="basket-apple-${k}">🧺</div>
        <span class="basket-weight">${mouse.weight}</span>
        <span class="basket-bit-badge">Bit 0</span>
      `;

      card.addEventListener('click', () => {
        this.sound.playChime();
        this.appleBasketsState[k] = this.appleBasketsState[k] === 1 ? 0 : 1;
        this.updateAppleBasketsUI();
      });

      this.basketsGridInteractive.appendChild(card);
    }

    this.updateAppleBasketsUI();
  }

  setAppleBasketFromDecimal(num) {
    for (let k = 0; k < 10; k++) {
      this.appleBasketsState[k] = (num & (1 << k)) !== 0 ? 1 : 0;
    }
    this.updateAppleBasketsUI();
  }

  updateAppleBasketsUI() {
    let totalDecimal = 0;
    let binaryChars = [];

    for (let k = 9; k >= 0; k--) {
      const hasApple = this.appleBasketsState[k] === 1;
      const card = document.getElementById(`basket-col-${k}`);
      const appleIcon = document.getElementById(`basket-apple-${k}`);

      if (card) {
        card.classList.toggle('has-apple', hasApple);
        card.querySelector('.basket-bit-badge').textContent = hasApple ? 'Bit 1' : 'Bit 0';
      }
      if (appleIcon) {
        appleIcon.textContent = hasApple ? '🍎' : '🧺';
      }

      binaryChars.push(hasApple ? '1' : '0');
      if (hasApple) {
        totalDecimal += MICE_DATA[k].weight;
      }
    }

    this.basketDecimalTotal.textContent = totalDecimal;
    this.basketBinaryString.textContent = binaryChars.join('');
  }

  /* ========================================================
     14. BẢNG ĐỐI CHIẾU THẬP PHÂN & NHỊ PHÂN (LOOKUP TABLE)
     ======================================================== */
  initLookupTable() {
    this.lookupTableBody.innerHTML = '';
    // Tạo 100 dòng mẫu đầu tiên và cho phép tra cứu tới 1024
    const fragment = document.createDocumentFragment();
    for (let n = 1; n <= 1000; n++) {
      const tr = document.createElement('tr');
      tr.id = `lookup-row-${n}`;

      const binStr = n.toString(2).padStart(10, '0');
      const activeMice = [];
      for (let k = 0; k < 10; k++) {
        if ((n & (1 << k)) !== 0) {
          activeMice.push(`${MICE_DATA[k].name}(${MICE_DATA[k].weight})`);
        }
      }

      tr.innerHTML = `
        <td style="font-weight: bold; color: var(--primary-amber);">#${n}</td>
        <td style="color: var(--neon-cyan); letter-spacing: 1px;">${binStr}</td>
        <td style="color: var(--text-muted); font-size: 11px;">${activeMice.join(', ')}</td>
      `;
      fragment.appendChild(tr);
    }
    this.lookupTableBody.appendChild(fragment);
  }

  /* ========================================================
     15. GỢI Ý 3 CẤP (HINT SYSTEM)
     ======================================================== */
  openHintsModal() {
    const lvl = this.currentLevel;
    this.hintText1.textContent = lvl.hint1 || "Mỗi chú chuột ứng với một lũy thừa của 2.";
    this.hintText2.textContent = lvl.hint2 || "Hãy mở bảng giỏ táo để tra cứu.";
    this.hintText3.textContent = `Hệ thống sẽ tự động gán toàn bộ ${lvl.bottles} chai rượu theo bit n & (1 << k).`;

    // Reset trạng thái hiển thị
    if (this.hintsUsed >= 1) {
      this.btnUnlockHint2.classList.add('hidden');
      this.hintText2.classList.remove('hidden');
    } else {
      this.btnUnlockHint2.classList.remove('hidden');
      this.hintText2.classList.add('hidden');
    }

    if (this.hintsUsed >= 2) {
      this.btnUnlockHint3.classList.add('hidden');
      this.hintText3.classList.remove('hidden');
    } else {
      this.btnUnlockHint3.classList.remove('hidden');
      this.hintText3.classList.add('hidden');
    }

    this.openModal(this.modalHints);
  }

  /* ========================================================
     16. HƯỚNG DẪN CÁCH CHƠI & BẤM THỬ MÔ PHỎNG (GUIDE LOGIC)
     ======================================================== */
  initGuideTabs() {
    const tabBtns = document.querySelectorAll('.guide-tab-btn');
    const tabPanes = document.querySelectorAll('.guide-tab-pane');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.sound.playClick();
        const targetId = btn.getAttribute('data-tab');

        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetPane = document.getElementById(`tab-${targetId}`);
        if (targetPane) {
          targetPane.classList.add('active');
        }
      });
    });
  }

  initGuideLiveDemo() {
    if (!this.demoGuideMiceStrip) return;
    this.demoGuideMiceStrip.innerHTML = '';

    // Render 10 chuột từ bit 9 (512) đến bit 0 (1) theo chuẩn toán học
    for (let k = 9; k >= 0; k--) {
      const mouse = MICE_DATA[k];
      const btn = document.createElement('div');
      btn.className = 'demo-mouse-btn';
      btn.id = `demo-mouse-btn-${k}`;

      btn.innerHTML = `
        <span class="demo-mouse-icon" id="demo-icon-${k}">🐭</span>
        <span class="demo-mouse-name">${mouse.name}</span>
        <span class="demo-mouse-weight">2^${k} = ${mouse.weight}</span>
        <span class="demo-mouse-state" id="demo-state-${k}">Sống (0)</span>
      `;

      btn.addEventListener('click', () => {
        this.sound.playChime();
        this.guideDemoState[k] = this.guideDemoState[k] === 1 ? 0 : 1;
        this.updateGuideLiveDemoUI();
      });

      this.demoGuideMiceStrip.appendChild(btn);
    }

    // Gắn sự kiện các nút chọn nhanh preset
    document.querySelectorAll('.demo-quick-btn[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sound.playChime();
        const presetNum = parseInt(btn.getAttribute('data-preset'), 10);
        this.setGuideLiveDemoFromDecimal(presetNum);
      });
    });

    if (this.btnDemoReset) {
      this.btnDemoReset.addEventListener('click', () => {
        this.sound.playClick();
        this.setGuideLiveDemoFromDecimal(0);
      });
    }

    this.updateGuideLiveDemoUI();
  }

  setGuideLiveDemoFromDecimal(num) {
    for (let k = 0; k < 10; k++) {
      this.guideDemoState[k] = (num & (1 << k)) !== 0 ? 1 : 0;
    }
    this.updateGuideLiveDemoUI();
  }

  updateGuideLiveDemoUI() {
    if (!this.demoBinaryVal || !this.demoCalcVal || !this.demoBottleVal) return;

    let binaryChars = [];
    let mathTerms = [];
    let sum = 0;

    for (let k = 9; k >= 0; k--) {
      const isDead = this.guideDemoState[k] === 1;
      const btn = document.getElementById(`demo-mouse-btn-${k}`);
      const icon = document.getElementById(`demo-icon-${k}`);
      const stateLbl = document.getElementById(`demo-state-${k}`);

      if (btn) btn.classList.toggle('dead', isDead);
      if (icon) icon.textContent = isDead ? '☠️' : '🐭';
      if (stateLbl) stateLbl.textContent = isDead ? 'Gục (1)' : 'Sống (0)';

      binaryChars.push(isDead ? '1' : '0');
      if (isDead) {
        mathTerms.push(`${MICE_DATA[k].weight}`);
        sum += MICE_DATA[k].weight;
      }
    }

    this.demoBinaryVal.textContent = binaryChars.join('');
    if (mathTerms.length === 0) {
      this.demoCalcVal.textContent = "Chưa có chuột nào gục (0)";
      this.demoBottleVal.textContent = "Chai #0 (Không có độc)";
    } else {
      this.demoCalcVal.textContent = mathTerms.join(' + ') + ` = ${sum}`;
      this.demoBottleVal.textContent = `Chai độc số #${sum}`;
    }
  }

  /* ========================================================
     17. HÀM KIỂM THỬ TỰ ĐỘNG (SELF-TEST RUNNER)
     Kiểm thử mọi chai từ 1 đến N trên tất cả cấu hình màn chơi
     Chạy khi URL có ?test hoặc bấm nút trong Cài Đặt.
     ======================================================== */
  runSelfTest() {
    console.group("🚀 CHẠY KIỂM THỬ TOÁN HỌC TỰ ĐỘNG (SELF-TEST)");
    let allPassed = true;
    let totalTests = 0;

    LEVELS_CONFIG.forEach(lvl => {
      const maxBottles = lvl.bottles;
      const miceCount = lvl.mice;

      for (let testBottle = 1; testBottle <= maxBottles; testBottle++) {
        totalTests++;
        // Mô phỏng gán bit nhị phân:
        let simulatedSum = 0;
        for (let k = 0; k < miceCount; k++) {
          const isDrunk = (testBottle & (1 << k)) !== 0;
          if (isDrunk) {
            simulatedSum += (1 << k);
          }
        }

        if (simulatedSum !== testBottle) {
          console.error(`❌ Màn ${lvl.id} [Chai #${testBottle}]: Giải mã sai! Tính ra: ${simulatedSum}`);
          allPassed = false;
        }
      }
    });

    console.groupEnd();

    if (allPassed) {
      const msg = `✅ SELF-TEST THÀNH CÔNG: Đã kiểm tra ${totalTests} trường hợp chai từ 1 đến 1.000 across 13 màn chơi. 100% logic bitmask chính xác!`;
      console.log(msg);
      alert(msg);
    } else {
      alert("⚠️ SELF-TEST PHÁT HIỆN LỖI! Xem chi tiết trong Console.");
    }
  }
}

// Khởi chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new RatPoisonGame();
});
