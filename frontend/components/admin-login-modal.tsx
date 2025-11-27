"use client"

import { useState } from "react"
import { validateAdminPassword, getAdminPasswordHint } from "@/lib/auth"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"

interface AdminLoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoginSuccess: () => void
}

export function AdminLoginModal({ open, onOpenChange, onLoginSuccess }: AdminLoginModalProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showHint, setShowHint] = useState(false)

  const handleLogin = () => {
    if (validateAdminPassword(password)) {
      setPassword("")
      setError("")
      setShowHint(false)
      onLoginSuccess()
    } else {
      setError("Invalid password")
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setPassword("")
      setError("")
      setShowHint(false)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Iniciar Sesión Admin</DialogTitle>
          <DialogDescription>
            Ingresa la contraseña de administrador para acceder a la gestión de inventario
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Contraseña</label>
            <Input
              type="password"
              placeholder="Ingresa la contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError("")
              }}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button onClick={() => setShowHint(!showHint)} className="text-xs text-muted-foreground hover:underline">
            ¿Necesitas una pista?
          </button>

          {showHint && <div className="p-3 bg-muted rounded-lg text-sm">{getAdminPasswordHint()}</div>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleLogin}>Iniciar Sesión</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
