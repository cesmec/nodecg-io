import { ObjectMap } from "nodecg-io-core/extension/service";

// There is no way we can get this function to pass the linter due to dynamic typing.
/* eslint-disable */

/**
 * Creates a deep copy of an object.
 * @param obj the copy of which a deep copy should be created.
 */
 export function objectDeepCopy<T extends Object>(obj: T | any): T {
  if (typeof obj === "object") {
      if (Array.isArray(obj)) {
        return Array.from({ length: obj.length }).map((_v, i) => objectDeepCopy(obj[i])) as any;
      } else {
        const copy = {} as any;
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = objectDeepCopy(obj[attr]);
        }
        return copy;
      }
  } else {
      return obj;
  }
}
/* eslint-enable */

/**
 * Filter an {@link ObjectMap} based on a filter predicate.
 * @param obj ObjectMap to filter
 * @param filter Filter predicate
 * @returns Filtered copy of the ObjectMap
 */
export function filterObjectMap<T>(obj: ObjectMap<T>, filter: (value: T, key: string) => boolean): ObjectMap<T> {
    const filtered: ObjectMap<T> = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && filter(obj[key], key)) {
            filtered[key] = obj[key];
        }
    }
    return filtered;
}
