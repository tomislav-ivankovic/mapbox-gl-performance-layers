import {MutableRefObject, useRef} from 'react';

const notInitialised = Symbol('notInitialised');

export function useLazyRef<T>(constructor: () => T): MutableRefObject<T> {
    const ref = useRef<T | typeof notInitialised>(notInitialised);
    if (ref.current === notInitialised) {
        ref.current = constructor();
    }
    return ref as MutableRefObject<T>;
}
