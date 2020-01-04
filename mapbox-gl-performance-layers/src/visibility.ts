export type Visibility = boolean | ((map: mapboxgl.Map) => boolean) | undefined | null;

export function resolveVisibility(visibility: Visibility, map: mapboxgl.Map | null | undefined): boolean {
    if (visibility == null) {
        return true;
    } else if (typeof visibility === 'boolean') {
        return visibility;
    } else if (map != null) {
        return visibility(map);
    } else {
        return true;
    }
}
