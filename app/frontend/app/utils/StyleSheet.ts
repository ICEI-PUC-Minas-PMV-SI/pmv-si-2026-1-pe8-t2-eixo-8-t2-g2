import { type CSSProperties } from 'react';

type RestrictToCSSProperties<T> = T & {
  [K in Exclude<keyof T, keyof CSSProperties>]: never;
};

export class StyleSheet {
  static create<T extends Record<string, CSSProperties>>(styles: {
    [K in keyof T]: RestrictToCSSProperties<T[K]>;
  }): T {
    return styles;
  }
}

export default StyleSheet;
