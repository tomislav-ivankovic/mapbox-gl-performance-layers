export interface BaseDataOperations<E> {
    add(element: E): void;
    removeFirst(): E | null;
    removeLast(): E | null;
    clear(): void;
    getArray(): ReadonlyArray<E>;
}

export interface DataOperations<E> extends BaseDataOperations<E> {
    addAll(elements: E[]): void;
    removeNFirst(n: number): E[];
    removeNLast(n: number): E[];
}

export class BaseDataOperationsComposer<E> implements BaseDataOperations<E> {
    constructor(
        protected sources: BaseDataOperations<E>[],
        protected onDataChange?: () => void
    ) {
    }

    add(element: E): void {
        for (const source of this.sources) {
            source.add(element);
        }
        if (this.onDataChange != null) {
            this.onDataChange();
        }
    }

    removeFirst(): E | null {
        let removed: E | null = null;
        for (const source of this.sources) {
            removed = source.removeFirst();
        }
        if (this.onDataChange != null) {
            this.onDataChange();
        }
        return removed;
    }

    removeLast(): E | null {
        let removed: E | null = null;
        for (const source of this.sources) {
            removed = source.removeLast();
        }
        if (this.onDataChange != null) {
            this.onDataChange();
        }
        return removed;
    }

    clear(): void {
        for (const source of this.sources) {
            source.clear();
        }
        if (this.onDataChange != null) {
            this.onDataChange();
        }
    }

    getArray(): ReadonlyArray<E> {
        if (this.sources.length == 0) {
            throw Error('No data sources provided.');
        }
        return this.sources[0].getArray();
    }
}

export class DataOperationsComposer<E> extends BaseDataOperationsComposer<E> implements DataOperations<E> {
    constructor(
        protected sources: DataOperations<E>[],
        onDataChange?: () => void
    ) {
        super(sources, onDataChange);
    }

    addAll(elements: E[]): void {
        for (const source of this.sources) {
            source.addAll(elements);
        }
        if (this.onDataChange != null) {
            this.onDataChange();
        }
    }

    removeNFirst(n: number): E[] {
        let removed: E[] | null = null;
        for (const source of this.sources) {
            removed = source.removeNFirst(n);
        }
        if (this.onDataChange != null) {
            this.onDataChange();
        }
        return removed != null ? removed : [];
    }

    removeNLast(n: number): E[] {
        let removed: E[] | null = null;
        for (const source of this.sources) {
            removed = source.removeNLast(n);
        }
        if (this.onDataChange != null) {
            this.onDataChange();
        }
        return removed != null ? removed : [];
    }
}

export class DataOperationsExtender<E> implements DataOperations<E> {
    constructor(
        protected source: BaseDataOperations<E>,
    ){
    }

    add(element: E): void {
        this.source.add(element);
    }

    removeFirst(): E | null {
        return this.source.removeFirst();
    }

    removeLast(): E | null {
        return this.source.removeLast();
    }

    clear(): void {
        this.source.clear();
    }

    getArray(): ReadonlyArray<E> {
        return this.source.getArray();
    }

    addAll(elements: E[]): void {
        for (const element of elements) {
            this.source.add(element);
        }
    }

    removeNFirst(n: number): E[] {
        let removed: E[] = [];
        for (let i = 0; i < n; i++) {
            const r = this.source.removeFirst();
            if (r != null) {
                removed.push(r);
            }
        }
        return removed;
    }

    removeNLast(n: number): E[] {
        let removed: E[] = [];
        for (let i = 0; i < n; i++) {
            const r = this.source.removeLast();
            if (r != null) {
                removed.unshift(r);
            }
        }
        return removed;
    }
}

