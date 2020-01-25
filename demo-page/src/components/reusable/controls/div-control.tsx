import {ReactNode, CSSProperties, useEffect} from 'react';
import ReactDOM from 'react-dom';
import {MapControlPosition, useMapControl} from './map-control';
import {useLazyRef} from '../../../hooks/use-lazy-ref';

export interface DivControlProps {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    position?: MapControlPosition;
}

export function DivControl(props: DivControlProps) {
    const div = useLazyRef(() => document.createElement('div')).current;

    useEffect(() => {
        div.className = props.className != null ? props.className : '';
    }, [div, props.className]);

    useEffect(() => {
        div.style.cssText = '';
        if (props.style == null) {
            return;
        }
        Object.entries(props.style).forEach(([key, value]) => {
            div.style[key as any] = value;
        });
    }, [div, props.style]);

    const control = useLazyRef(() => ({
        onAdd: () => div,
        onRemove: () => {
            const parent = div.parentNode;
            if (parent != null) {
                parent.removeChild(div);
            }
        }
    })).current;

    useMapControl(control, props.position);

    return ReactDOM.createPortal(props.children, div);
}
