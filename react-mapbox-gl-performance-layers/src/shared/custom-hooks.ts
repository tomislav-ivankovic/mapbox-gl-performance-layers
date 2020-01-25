import {MutableRefObject} from 'react';
import {useRef} from 'react';
import {useEffect} from 'react';

const notInitialised = Symbol('notInitialised');

export function useLazyRef<T>(constructor: () => T): MutableRefObject<T> {
    const ref = useRef<T | typeof notInitialised>(notInitialised);
    if (ref.current === notInitialised) {
        ref.current = constructor();
    }
    return ref as MutableRefObject<T>;
}

export function usePrevious<T>(value: T): T | typeof notInitialised {
    const ref = useRef<T | typeof notInitialised>(notInitialised);
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export function useValueAsRef<T>(value: T): MutableRefObject<T> {
    const ref = useRef(value);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref;
}
