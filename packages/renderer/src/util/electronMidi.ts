/// <reference types="webmidi" />

export type MidiOptions = {
  debug?: boolean
}

export type DecodedMidiMessage = {
  note: number
  channel: number
}

export type onMidiInputFn = (event: WebMidi.MIDIMessageEvent) => void
export type onMidiOnMsgFn = (msg: DecodedMidiMessage) => void

function debugMessages(event: WebMidi.MIDIMessageEvent) {
  // let str = ''
  const data: Uint8Array = event.data
  const status = data[0]
  const note = data[1]
  const command = status >>> 4
  const channel = status & 0xf
  // event.data.forEach((data) => {
  //   str += '0x' + data.toString(16) + ' '
  // })
  // console.log(
  //   `note: ${note}, status: ${status}, command: ${command}, channel: ${channel}`
  // )
  // console.log(event)
  if (command === 0x9) {
    console.log(`note ${note} on for channel ${channel}}`)
  }
  // console.log(
  //   // @ts-expect-error
  //   `${event.srcElement?.name}:${event.srcElement?.type} [${event.data.length} bytes] - ${str}`
  // )
}

function debugMidiOnMessage(msg: DecodedMidiMessage) {
  console.log(`MIDI on: note ${msg.note} on for channel ${msg.channel}}`)
}

export const ElectronMidi = class {
  #debug: boolean
  #midiAccess: WebMidi.MIDIAccess | undefined
  #onInputMessage: onMidiInputFn
  #oldOnInputMessage: onMidiInputFn | undefined
  #onMidiOnMessage: onMidiOnMsgFn
  #oldMidiOnMessage: onMidiOnMsgFn | undefined
  #onReady: () => void

  constructor(options?: MidiOptions) {
    this.#midiAccess = undefined
    this.#onMidiOnMessage = debugMidiOnMessage
    if (options?.debug) {
      this.#debug = true
    } else {
      this.#debug = false
    }
    this.#onReady = () => {
      if (this.#debug) {
        console.log('ElectronMidi ready.')
      }
    }
    this.#onInputMessage = (msg) => {
      if (this.#debug) {
        debugMessages(msg)
      }
    }
    this.init()
  }

  init() {
    navigator.requestMIDIAccess().then(
      (access) => {
        this.#midiAccess = access
        this.#midiAccessChanged()
        this.#initMidiInputs()
        this.#onReady()
      },
      (error) => {
        console.error(error)
      }
    )
  }

  learn() {
    this.#oldOnInputMessage = this.#onInputMessage
    return new Promise<WebMidi.MIDIMessageEvent>((resolve) => {
      this.#onInputMessage = (event) => {
        this.#onInputMessage = this.#oldOnInputMessage!
        resolve(event)
      }
    })
  }

  learnMidiOn() {
    this.#oldMidiOnMessage = this.#onMidiOnMessage
    return new Promise<DecodedMidiMessage>((resolve) => {
      this.#onMidiOnMessage = (msg) => {
        this.#onMidiOnMessage = this.#oldMidiOnMessage!
        resolve(msg)
      }
    })
  }

  #midiAccessChanged() {
    if (this.#midiAccess !== undefined) {
      this.#midiAccess.onstatechange = () => {
        this.#initMidiInputs()
        // this._onHardwareChange(e)
      }
    }
  }

  #initMidiInputs() {
    const inputs = this.#midiAccess?.inputs.values()
    if (inputs !== undefined) {
      for (
        let input = inputs.next();
        input && !input.done;
        input = inputs.next()
      ) {
        console.log('initing')
        input.value.onmidimessage = (event) => {
          this.#onInputMessage(event)
          const data = event.data
          const status = data[0]
          const note = data[1]
          const command = status >>> 4
          const channel = status & 0xf
          if (command === 0x9) {
            this.#onMidiOnMessage({
              note,
              channel,
            })
          }
          // this.#onOutputMessage(e)
        }
      }
    }
  }

  // eslint-disable-next-line
  set onInputMessage(fn: onMidiInputFn) {
    this.#onInputMessage = (event: WebMidi.MIDIMessageEvent) => {
      // debugMessages(event)
      fn(event)
    }
  }

  // eslint-disable-next-line
  set onMidiOnMessage(fn: onMidiOnMsgFn) {
    this.#onMidiOnMessage = (msg) => {
      fn(msg)
    }
  }

  get midiAccess() {
    return this.#midiAccess
  }

  get inputs() {
    return this.#midiAccess?.inputs || []
  }

  get outputs() {
    return this.#midiAccess?.outputs || []
  }
}
