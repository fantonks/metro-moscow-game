let audioContext: AudioContext | null = null
let audioResumed = false

function resumeAudioContext(): void {
  if (typeof window === "undefined" || audioResumed) return
  const ctx = getAudioContext()
  if (ctx?.state === "suspended") {
    ctx.resume().then(() => { audioResumed = true }).catch((e) => console.warn("[sound] AudioContext resume failed:", e))
  } else if (ctx) {
    audioResumed = true
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!audioContext) {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (Ctx) audioContext = new Ctx()
    } catch (e) {
      console.warn("[sound] AudioContext creation failed:", e)
      return null
    }
  }
  return audioContext
}

/** Call once on first user interaction so audio works on all devices. */
export function initAudioOnFirstInteraction(): void {
  if (typeof window === "undefined") return
  const run = () => {
    resumeAudioContext()
    window.removeEventListener("click", run, true)
    window.removeEventListener("touchstart", run, true)
    window.removeEventListener("keydown", run, true)
  }
  window.addEventListener("click", run, true)
  window.addEventListener("touchstart", run, true)
  window.addEventListener("keydown", run, true)
}

export function playClickSound() {
  resumeAudioContext()
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.frequency.value = 600
    oscillator.type = "sine"
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.05)
  } catch (e) {
    console.warn("[sound] playClickSound failed:", e)
  }
}

/** Звук ножа — резкий «свинг» при появлении/исчезновении заставки */
export function playKnifeSound() {
  resumeAudioContext()
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const bufferSize = ctx.sampleRate * 0.15
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15))
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = "bandpass"
    filter.frequency.value = 1200
    filter.Q.value = 2
    const gainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(0.25, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
    noise.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)
    noise.start(ctx.currentTime)
    noise.stop(ctx.currentTime + 0.15)
  } catch (e) {
    console.warn("[sound] playKnifeSound failed:", e)
  }
}
