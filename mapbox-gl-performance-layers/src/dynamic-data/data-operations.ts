export interface BaseDataOperations<E> {
    add(element: E): void;
    removeFirst(): void;
    removeLast(): void;
    clear(): void;
    getSize(): number;
}

export interface DataOperations<E> extends BaseDataOperations<E> {
    addAll(elements: E[]): void;
    removeNFirst(n: number): void;
    removeNLast(n: number): void;
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

    removeFirst(): void {
        for (const source of this.sources) {
            source.removeFirst();
        }
        if (this.onDataChange != null) {
            this.onDataChange();
        }
    }

    removeLast(): void {
        for (const source of this.sources) {
            source.removeLast();
        }
        if (this.onDataChange != null) {
            this.onDataChange();
        }
    }

    clear(): void {
        for (const source of this.sources) {
            source.clear();
        }
        if (this.onDataChange != null) {
            this.onDataChange();
        }
    }

    getSize(): number {
        if (this.sources.length == 0) {
            throw Error('No data sources provided.');
        }
        return this.sources[0].getSize();
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

    removeNFirst(n: number): void {
        for (const source of this.sources) {
            source.removeNFirst(n);
        }
        if (this.onDataChange != null) {
            this.onDataChange();
        }
    }

    removeNLast(n: number): void {
        for (const source of this.sources) {
            source.removeNLast(n);
        }
        if (this.onDataChange != null) {
            this.onDataChange();
        }
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

    removeFirst(): void {
        this.source.removeFirst();
    }

    removeLast(): void {
        this.source.removeLast();
    }

    clear(): void {
        this.source.clear();
    }

    getSize(): number {
        return this.source.getSize();
    }

    addAll(elements: E[]): void {
        for (const element of elements) {
            this.source.add(element);
        }
    }

    removeNFirst(n: number): void {
        for (let i = 0; i < n; i++) {
            this.source.removeFirst();
        }
    }

    removeNLast(n: number): void {
        for (let i = 0; i < n; i++) {
            this.source.removeLast();
        }
    }
}

