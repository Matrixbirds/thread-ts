export class Frame {

  private counter: number = 0;

  get count() {
    return this.counter;
  }

  increment() {
    this.counter++
  }

  decrement() {
    this.counter--
  }
}