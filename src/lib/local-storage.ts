import { AsyncLocalStorage } from 'node:async_hooks';

const asyncLocalStorage = new AsyncLocalStorage<AsyncScope>();

export interface AsyncScope {
    [key: symbol]: unknown;
}

export class AsyncScope {
    static get() {
        const scope = asyncLocalStorage.getStore();
        if (!scope) {
            throw new Error('Scope not found');
        }

        return scope;
    }

    constructor(callback: () => void) {
        const parentScope = asyncLocalStorage.getStore();
        if (parentScope) {
            Object.setPrototypeOf(this, parentScope);
        }

        asyncLocalStorage.run(this, callback);
    }
}

export class AsyncVar<T> {
    private readonly symbol = Symbol(this.name);

    constructor(readonly name: string) {}

    set(value: T) {
        const scope = AsyncScope.get();

        scope[this.symbol] = value;
    }

    get() {
        if (!this.exists()) {
            throw new Error(`Variable "${this.name}" not found`);
        }

        const scope = AsyncScope.get();

        return scope[this.symbol] as T;
    }

    exists() {
        const scope = AsyncScope.get();

        return this.symbol in scope;
    }
}
