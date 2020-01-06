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

export class BaseDataOperationsForwarder<E> implements BaseDataOperations<E> {
    constructor(
        protected base: BaseDataOperations<E>,
        protected onDataChange?: () => void
    ) {
    }

    add(element: E): void {
        this.base.add(element);
        if (this.onDataChange != null) {
            this.onDataChange();
        }
    }

    removeFirst(): void {
        this.base.removeFirst();
        if (this.onDataChange != null) {
            this.onDataChange();
        }
    }

    removeLast(): void {
        this.base.removeLast();
        if (this.onDataChange != null) {
            this.onDataChange();
        }
    }

    clear(): void {
        this.base.clear();
        if (this.onDataChange != null) {
            this.onDataChange();
        }
    }

    getSize(): number {
        return this.base.getSize();
    }
}

export class DataOperationsForwarder<E> extends BaseDataOperationsForwarder<E> implements DataOperations<E> {
    constructor(
        protected base: DataOperations<E>,
        onDataChange?: () => void
    ) {
        super(base, onDataChange);
    }

    addAll(elements: E[]): void {
        this.base.addAll(elements);
        if (this.onDataChange != null) {
            this.onDataChange();
        }
    }

    removeNFirst(n: number): void {
        this.base.removeNFirst(n);
        if (this.onDataChange != null) {
            this.onDataChange();
        }
    }

    removeNLast(n: number): void {
        this.base.removeNLast(n);
        if (this.onDataChange != null) {
            this.onDataChange();
        }
    }
}

export class DataOperationsExtender<E> extends BaseDataOperationsForwarder<E> implements DataOperations<E> {
    addAll(elements: E[]): void {
        for (const element of elements) {
            this.base.add(element);
        }
    }

    removeNFirst(n: number): void {
        for (let i = 0; i < n; i++) {
            this.base.removeFirst();
        }
    }

    removeNLast(n: number): void {
        for (let i = 0; i < n; i++) {
            this.base.removeLast();
        }
    }
}

