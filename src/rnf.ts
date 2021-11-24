type ChannelType = MessageChannel | null

let channel: ChannelType = new MessageChannel()
const port2 = channel.port2
let state = 'idle';

const isPromise = (p: unknown): boolean => p instanceof Promise ? true : false

type requestNextFrameCallbackType = (...args: any) => any | Promise<any>

const nextFrame = (channel: ChannelType) => {
  if (channel && channel.port2 && state !== 'idle') {
    port2.postMessage(null)
  }
}

export const requestNextFrame = (callback: requestNextFrameCallbackType) => {
  if (channel) {
    state = 'created'
    channel.port1.onmessage = () => {
      const res = callback()
      if (isPromise(res)) {
        res.finally(() => {
          nextFrame(channel)
        })
      } else {
        nextFrame(channel)
      }
    }
    nextFrame(channel)
  }
}

export const tearDownNextFrame = () => {
  state = 'stopping'
  if (channel) {
    channel.port1.close()
  }
  port2.close()
  state = 'idle'
  channel = null;
}