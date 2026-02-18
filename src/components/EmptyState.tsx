import { Button } from '@/components/ui/button'
import { LockKey, Plus, MagnifyingGlass } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  hasSecrets: boolean
  onAddSecret: () => void
}

export function EmptyState({ hasSecrets, onAddSecret }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        {hasSecrets ? (
          <MagnifyingGlass
            size={80}
            weight="thin"
            className="text-muted-foreground"
          />
        ) : (
          <LockKey size={80} weight="thin" className="text-accent/50" />
        )}
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="max-w-md"
      >
        <h3 className="text-2xl font-semibold mb-2">
          {hasSecrets ? 'No secrets found' : 'No secrets yet'}
        </h3>
        <p className="text-muted-foreground mb-6">
          {hasSecrets
            ? 'Try adjusting your search or filter criteria.'
            : 'Get started by adding your first secret to the vault.'}
        </p>

        {!hasSecrets && (
          <Button
            onClick={onAddSecret}
            className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20"
          >
            <Plus className="mr-2" weight="bold" />
            Add Your First Secret
          </Button>
        )}
      </motion.div>
    </div>
  )
}
