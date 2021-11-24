window.MessageChannel = require('worker_threads').MessageChannel;
import { BaseThread } from "../src";
import { EventEmitter } from 'events';

class FakeVM {

  array: any[] = []
  bus: EventEmitter = new EventEmitter()

  constructor() {
    this.bus.on('call', (v: number) => {
      typeof FakeVM.handleCall === 'function' && FakeVM.handleCall(v)
    })
  }

  call(v: number) {
    this.bus.emit('call', v)
    this.array.push(v)
  }

  static handleCall: ((v: number) => void) | undefined
}

const vm = new FakeVM();

class AThread extends BaseThread {

  constructor() {
    super();
  }

  async run() {
    await Promise.resolve(vm.call(10))
    await Promise.resolve(vm.call(20))
    await Promise.resolve(vm.call(21))
  }
}

class BThread extends BaseThread {
  constructor() {
    super();
  }

  async run() {
    await Promise.resolve(vm.call(100))
    await Promise.resolve(vm.call(200))
    await Promise.resolve(vm.call(210))
  }
}

describe('AThread', () => {
  it('case one, call sequence', () => {
    const threadA = new AThread();
    const threadB = new BThread();
    let count = 0
    const res = [10, 100, 20, 200, 21, 210]
    const newArray: any[] = []
    FakeVM.handleCall = (v: number) => {
      newArray.push(v)
      expect(v).toBe(res[count])
      expect(newArray).toStrictEqual(res.slice(0, count+1))
      ++count
    }
    threadA.start()
    threadB.start()
  })
})