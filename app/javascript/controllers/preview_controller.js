import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    segments: { type: Number, default: 3 },
    interval: { type: Number, default: 1000 },
    minDuration: { type: Number, default: 5 }
  }

  connect() {
    this.originalTime = 0
    this.wasPlaying = false
    this.previewTimer = null
    this.currentIndex = 0
    this.isReady = false
    this.timestamps = []

    this.element.addEventListener("loadedmetadata", () => {
      this.#calculateTimestamps()

      this.isReady = true
    })
  }

  disconnect() {
    this.#clearTimer()
  }

  play() {
    if (!this.isReady || this.timestamps.length === 0) return

    this.originalTime = this.element.currentTime
    this.wasPlaying = !this.element.paused
    this.currentIndex = 0

    this.element.muted = true
    this.#showNextTimestamp()

    if (this.timestamps.length > 1) {
      this.previewTimer = setInterval(() => {
        this.#showNextTimestamp()
      }, this.intervalValue)
    }
  }

  pause() {
    this.#clearTimer()
    this.element.pause()

    this.element.currentTime = this.originalTime
    this.element.muted = false

    if (this.wasPlaying) this.element.play()
  }

  // private

  #calculateTimestamps() {
    const duration = this.element.duration

    if (duration < this.minDurationValue) {
      this.timestamps = [0]

      return
    }

    this.timestamps = []
    for (let i = 1; i <= this.segmentsValue; i++) {
      this.timestamps.push((duration / (this.segmentsValue + 1)) * i)
    }
  }

  #showNextTimestamp() {
    this.element.currentTime = this.timestamps[this.currentIndex]
    this.element.play()

    this.currentIndex = (this.currentIndex + 1) % this.timestamps.length
  }

  #clearTimer() {
    if (this.previewTimer) {
      clearInterval(this.previewTimer)

      this.previewTimer = null
    }
  }
}
