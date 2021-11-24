"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
window.MessageChannel = require('worker_threads').MessageChannel;
const src_1 = require("../src");
const events_1 = require("events");
class FakeVM {
    constructor() {
        this.array = [];
        this.bus = new events_1.EventEmitter();
        this.bus.on('call', (v) => {
            typeof FakeVM.handleCall === 'function' && FakeVM.handleCall(v);
        });
    }
    call(v) {
        this.bus.emit('call', v);
        this.array.push(v);
    }
}
const vm = new FakeVM();
class AThread extends src_1.BaseThread {
    constructor() {
        super();
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.resolve(vm.call(10));
            yield Promise.resolve(vm.call(20));
            yield Promise.resolve(vm.call(21));
        });
    }
}
class BThread extends src_1.BaseThread {
    constructor() {
        super();
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.resolve(vm.call(100));
            yield Promise.resolve(vm.call(200));
            yield Promise.resolve(vm.call(210));
        });
    }
}
describe('AThread', () => {
    it('case one, call sequence', () => {
        const threadA = new AThread();
        const threadB = new BThread();
        let count = 0;
        const res = [10, 100, 20, 200, 21, 210];
        const newArray = [];
        FakeVM.handleCall = (v) => {
            newArray.push(v);
            expect(v).toBe(res[count]);
            ++count;
            if (count === res.length) {
                threadA.stop();
                threadB.stop();
                expect(newArray).toStrictEqual(res);
                return;
            }
        };
        threadA.start();
        threadB.start();
    });
});
