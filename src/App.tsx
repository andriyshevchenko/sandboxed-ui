import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Secret, SecretCategory, SecretFormData } from '@/lib/types'
import { Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { SecretCard } from '@/components/SecretCard'
import { SecretDialog } from '@/components/SecretDialog'
import { EmptyState } from '@/components/EmptyState'
import { CategoryFilter } from '@/components/CategoryFilter'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

function App() {
  const [secrets, setSecrets] = useKV<Secret[]>('secrets', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<SecretCategory | 'all'>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSecret, setEditingSecret] = useState<Secret | null>(null)

  const handleAddSecret = (data: SecretFormData) => {
    const newSecret: Secret = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setSecrets((current) => [...(current || []), newSecret])
    toast.success('Secret added successfully')
    setIsDialogOpen(false)
  }

  const handleEditSecret = (data: SecretFormData) => {
    if (!editingSecret) return
    
    setSecrets((current) =>
      (current || []).map((secret) =>
        secret.id === editingSecret.id
          ? { ...secret, ...data, updatedAt: Date.now() }
          : secret
      )
    )
    toast.success('Secret updated successfully')
    setEditingSecret(null)
    setIsDialogOpen(false)
  }

  const handleDeleteSecret = (id: string) => {
    setSecrets((current) => (current || []).filter((secret) => secret.id !== id))
    toast.success('Secret deleted successfully')
  }

  const handleOpenEdit = (secret: Secret) => {
    setEditingSecret(secret)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingSecret(null)
  }

  const filteredSecrets = (secrets || []).filter((secret) => {
    const matchesSearch = 
      secret.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      secret.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || secret.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      <div className="relative">
        <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">SecureVault</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your secrets securely
                </p>
              </div>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20"
              >
                <Plus className="mr-2" weight="bold" />
                Add Secret
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search secrets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-card/50 border-border/50 focus:border-accent/50 transition-colors"
              />
            </div>
            <CategoryFilter
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>

          {filteredSecrets.length === 0 ? (
            <EmptyState 
              hasSecrets={(secrets || []).length > 0}
              onAddSecret={() => setIsDialogOpen(true)}
            />
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              layout
            >
              <AnimatePresence mode="popLayout">
                {filteredSecrets.map((secret, index) => (
                  <motion.div
                    key={secret.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    layout
                  >
                    <SecretCard
                      secret={secret}
                      onEdit={handleOpenEdit}
                      onDelete={handleDeleteSecret}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </main>
      </div>

      <SecretDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        onSubmit={editingSecret ? handleEditSecret : handleAddSecret}
        initialData={editingSecret || undefined}
        mode={editingSecret ? 'edit' : 'add'}
      />

      <Toaster position="top-right" />
    </div>
  )
}

export default App
