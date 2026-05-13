'use client'

import * as React from 'react'
import type { ToastActionElement, ToastProps } from '@/components/ui/toast'

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 4000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

type State = {
  toasts: ToasterToast[]
}

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()
let listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }

function dispatch(action: { type: 'ADD' | 'UPDATE' | 'DISMISS' | 'REMOVE'; toast?: Partial<ToasterToast>; toastId?: string }) {
  switch (action.type) {
    case 'ADD':
      memoryState = {
        toasts: [action.toast as ToasterToast, ...memoryState.toasts].slice(0, TOAST_LIMIT),
      }
      break
    case 'UPDATE':
      memoryState = {
        toasts: memoryState.toasts.map((t) =>
          t.id === action.toast?.id ? { ...t, ...action.toast } : t,
        ),
      }
      break
    case 'DISMISS': {
      const { toastId } = action
      if (toastId) {
        if (!toastTimeouts.has(toastId)) {
          toastTimeouts.set(
            toastId,
            setTimeout(() => {
              toastTimeouts.delete(toastId)
              dispatch({ type: 'REMOVE', toastId })
            }, TOAST_REMOVE_DELAY),
          )
        }
      } else {
        memoryState.toasts.forEach((t) => dispatch({ type: 'DISMISS', toastId: t.id }))
      }
      memoryState = {
        toasts: memoryState.toasts.map((t) =>
          t.id === toastId || toastId === undefined ? { ...t, open: false } : t,
        ),
      }
      break
    }
    case 'REMOVE':
      memoryState = {
        toasts: memoryState.toasts.filter((t) => t.id !== action.toastId),
      }
      break
  }
  listeners.forEach((listener) => listener(memoryState))
}

function toast({ ...props }: Omit<ToasterToast, 'id'>) {
  const id = genId()
  const update = (props: ToasterToast) => dispatch({ type: 'UPDATE', toast: { ...props, id } })
  const dismiss = () => dispatch({ type: 'DISMISS', toastId: id })

  dispatch({
    type: 'ADD',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return { id, dismiss, update }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      listeners = listeners.filter((l) => l !== setState)
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS', toastId }),
  }
}

export { useToast, toast }
