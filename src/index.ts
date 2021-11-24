import { requestNextFrame, tearDownNextFrame } from './rnf';
import { Frame } from "./frame";

export abstract class BaseThread {
  protected running: boolean = false;

  protected frame: Frame = new Frame();

  start() {
    if (!this.running) {
      this.running = true
      this.frame.increment()
      this.loop()
      return
    }
    this.frame.increment()
  }

  private shouldYield() {
    if (this.frame.count > 0) {
      this.frame.decrement();
      return false;
    }
    return true;
  }

  private async schedule() {
    for await (let task of this) {
    }
  }

  async *[Symbol.asyncIterator]() {
    let state = false
    while (this.running && (state = !this.shouldYield())) {
      yield await this.run();
    }
    if (!state) {
      this.stop();
      return
    }
  }

  private async loop() {
    if (this.running) {
      await this.schedule()
      requestNextFrame(() => this.loop())
    } else {
      tearDownNextFrame()
    }
  }

  abstract run(): void | Promise<void>;

  stop() {
    this.running = false
  }
}