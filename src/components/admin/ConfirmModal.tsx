'use client'

import { X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  open: boolean
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ open, message, onConfirm, onCancel }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="mx-4 w-full max-w-sm rounded-2xl border bg-white p-6 shadow-xl"
            style={{ borderColor: '#E2E8F0' }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}>
            <p className="mb-6 text-center text-sm font-semibold" style={{ color: '#0F172A' }}>
              {message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
                style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
                <X size={15} />
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#EF4444' }}>
                <Check size={15} />
                Eliminar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
