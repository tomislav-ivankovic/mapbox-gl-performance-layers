import {useValueAsRef} from './custom-hooks';

export function useClickProxy<T extends (...args: any) => void>(onClick: T | undefined): T | undefined {
    const clickRef = useValueAsRef(onClick);
    if (onClick == null) {
        return undefined;
    }
    // @ts-ignore
    return (...args) => {
        if (clickRef.current != null) {
            clickRef.current(...args);
        }
    };
}
