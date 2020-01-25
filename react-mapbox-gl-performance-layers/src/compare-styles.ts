export function compareStyles(a: any, b: any): boolean {
    if (a === b) {
        return true;
    }
    if (typeof a === 'object' && typeof  b === 'object') {
        return compareObjects(a, b);
    }
    return false;
}

function compareObjects(a: object, b: object) {
    if (a === b) {
        return true;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length != bKeys.length) {
        return false;
    }
    for (const key of aKeys) {
        // @ts-ignore
        const aChild = a[key];
        // @ts-ignore
        const bChild = b[key];
        if (aChild === bChild) {
            continue;
        }
        if (typeof aChild !== 'object' || typeof bChild !== 'object') {
            return false;
        }
        if (!compareObjects(aChild, bChild)) {
            return false;
        }
    }
    return true;
}
