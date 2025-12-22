import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["preview", "startButton", "stopButton", "video", "form", "videoInput"]
  static values = { mode: { type: String, default: "webcam" } }

  connect() {
    this.recorder = null
    this.recordedData = []

    this.webcamStream = null
    this.screenStream = null

    this.recordedBlob = null
  }

  disconnect() {
    if (this.webcamStream) this.webcamStream.getTracks().forEach(track => track.stop())
    if (this.screenStream) this.screenStream.getTracks().forEach(track => track.stop())
  }

  selectMode({ params: { mode } }) {
    this.modeValue = mode
  }

  async start() {
    this.recordedData = []
    const stream = await this.#mediaStream()

    this.#toggleButtons()

    this.#startPreview(stream)
    this.#setupRecorder(stream)

    this.recorder.start()
  }

  stop() {
    this.recorder.stop()

    this.#toggleButtons()
    this.#cleanupStreams()
  }

  save() {
    if (!this.recordedBlob) return

    const file = new File([this.recordedBlob], "recording.webm", { type: "video/webm" })
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)

    this.videoInputTarget.files = dataTransfer.files

    this.formTarget.requestSubmit()
  }

  // private

  async #mediaStream() {
    const streamMethods = {
      webcam: () => navigator.mediaDevices.getUserMedia({ video: true, audio: true }),
      screen: () => navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }),
      pip: async () => {
        this.screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        this.webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })

        return this.#combinedStream(this.screenStream, this.webcamStream)
      }
    }

    return await streamMethods[this.modeValue]()
  }

  #startPreview(stream) {
    this.previewTarget.srcObject = stream

    this.previewTarget.play()
  }

  #toggleButtons() {
    this.startButtonTarget.disabled = !this.startButtonTarget.disabled
    this.stopButtonTarget.disabled = !this.stopButtonTarget.disabled
  }

  #cleanupStreams() {
    if (this.webcamStream) {
      this.webcamStream.getTracks().forEach(track => track.stop())

      this.webcamStream = null
    }

    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop())

      this.screenStream = null
    }
  }

  #setupRecorder(stream) {
    this.recorder = new MediaRecorder(stream)
    this.recorder.ondataavailable = (event) => this.#dataAvailable(event)
    this.recorder.onstop = () => this.#recordingStopped()
  }

  #recordingStopped() {
    this.recordedBlob = new Blob(this.recordedData, { type: "video/webm" })
    this.videoTarget.src = URL.createObjectURL(this.recordedBlob)

    this.#clearPreview()
    this.#cleanupStreams()
  }

  #dataAvailable(event) {
    if (event.data.size > 0) this.recordedData.push(event.data)
  }

  #clearPreview() {
    this.previewTarget.srcObject = null
  }

  #combinedStream(screenStream, webcamStream) {
    const canvas = document.createElement("canvas")
    const canvasContext = canvas.getContext("2d")

    canvas.width = 1280
    canvas.height = 720

    const screenVideo = document.createElement("video")
    const webcamVideo = document.createElement("video")

    screenVideo.srcObject = screenStream
    webcamVideo.srcObject = webcamStream

    screenVideo.play()
    webcamVideo.play()

    const draw = () => {
      canvasContext.drawImage(screenVideo, 0, 0, canvas.width, canvas.height)
      canvasContext.drawImage(webcamVideo, canvas.width - 320, canvas.height - 240, 320, 240)

      requestAnimationFrame(draw)
    }

    draw()

    return canvas.captureStream(30)
  }
}
