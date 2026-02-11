import { useCallback, useState, type Dispatch, type SetStateAction } from 'react'

export const useLocalStorageState = <T,>(
  key: string,
  initialValue: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    const fallbackValue =
      typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue

    if (typeof window === 'undefined') {
      return fallbackValue
    }

    try {
      const raw = window.localStorage.getItem(key)
      if (raw === null) {
        return fallbackValue
      }
      return JSON.parse(raw) as T
    } catch {
      return fallbackValue
    }
  })

  const setPersistedValue = useCallback<Dispatch<SetStateAction<T>>>(
    (nextValue) => {
      setValue((previous) => {
        const resolved =
          typeof nextValue === 'function'
            ? (nextValue as (prev: T) => T)(previous)
            : nextValue

        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(key, JSON.stringify(resolved))
          } catch {
            // LocalStorage書き込み失敗時は状態更新のみ継続する
          }
        }

        return resolved
      })
    },
    [key],
  )

  return [value, setPersistedValue]
}
