import { ObjectMap } from "./types";

/**
 * Creates a deep copy of an object.
 * @param obj the object of which a deep copy should be created.
 */
export function objectDeepCopy<T>(obj: T): T {
    if (typeof obj === "object" && obj !== null) {
        if (Array.isArray(obj)) {
            return Array.prototype.map.call(obj, (entry) => objectDeepCopy(entry)) as unknown as T;
        } else {
            const copy = {} as T;
            for (const key of ownKeysOf(obj as T & object)) {
                copy[key] = objectDeepCopy(obj[key]);
            }
            return copy;
        }
    } else {
        return obj;
    }
}

/**
 * Filter an {@link ObjectMap} based on a filter predicate.
 * @param obj ObjectMap to filter
 * @param filter Filter predicate
 * @returns Filtered copy of the ObjectMap
 */
export function filterObjectMap<T>(obj: ObjectMap<T>, filter: (value: T, key: string) => boolean): ObjectMap<T> {
    const filtered: ObjectMap<T> = {};
    for (const key of ownKeysOf(obj)) {
        if (filter(obj[key], key)) {
            filtered[key] = obj[key];
        }
    }
    return filtered;
}

function ownKeysOf<T extends object>(object: T): (keyof T)[] {
    return Reflect.ownKeys(object) as (keyof T)[];
}
