"use client"

import { useState, useEffect } from "react"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Users, Plus, Pencil, Trash2, Loader2, Shield, User as UserIcon } from "lucide-react"

interface UserAcc {
  id: string
  username: string
  name: string
  email: string
  role: "ADMIN" | "STAFF"
  createdAt: string
}

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Gagal mengambil data")
  return res.json()
})

export default function UsersPage() {
  const { data: users, isLoading } = useSWR<UserAcc[]>("/api/users", fetcher)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deleteUser, setDeleteUser] = useState<UserAcc | null>(null)
  const [editingUser, setEditingUser] = useState<UserAcc | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "STAFF",
  })

  const resetForm = () => {
    setFormData({ name: "", username: "", email: "", password: "", role: "STAFF" })
    setError("")
  }

  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name,
        username: editingUser.username,
        email: editingUser.email,
        password: "", // Jangan tampilkan password lama
        role: editingUser.role,
      })
    }
  }, [editingUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users"
      const method = editingUser ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan")
        setLoading(false)
        return
      }

      await mutate("/api/users")
      setIsAddOpen(false)
      setIsEditOpen(false)
      setEditingUser(null)
      resetForm()
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteUser) return

    try {
      const res = await fetch(`/api/users/${deleteUser.id}`, { method: "DELETE" })
      
      if (!res.ok && res.status !== 204) {
        const data = await res.json()
        setError(data.error || "Gagal menghapus pengguna")
        setDeleteUser(null)
        return
      }

      await mutate("/api/users")
      setDeleteUser(null)
    } catch {
      console.error("Delete error")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kelola Pengguna</h1>
          <p className="text-muted-foreground">Kelola akun dan peran pengguna sistem</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pengguna
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-foreground">Tambah Pengguna Baru</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Buat akun baru untuk staf atau admin
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Nama Lengkap *</FieldLabel>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-input border-border"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="username">Username *</FieldLabel>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="bg-input border-border"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email *</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-input border-border"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password *</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="bg-input border-border"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="role">Role *</FieldLabel>
                  <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STAFF">Staff</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
              {error && <p className="text-destructive text-sm mt-4">{error}</p>}
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Simpan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !users || users.length === 0 ? (
          <Card className="col-span-full bg-card border-border">
            <CardContent className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Belum ada pengguna</p>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id} className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {user.role === "ADMIN" ? (
                        <Shield className="h-5 w-5 text-primary" />
                      ) : (
                        <UserIcon className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground">{user.name}</CardTitle>
                      <CardDescription className="text-muted-foreground truncate w-32 sm:w-48">
                        {user.email}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4">
                  <p>Username: {user.username}</p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingUser(user)
                      setIsEditOpen(true)
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteUser(user)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) { setEditingUser(null); resetForm() } }}>
        <DialogContent className="bg-card border-border sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Pengguna</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Perbarui informasi atau role pengguna
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="edit-name">Nama Lengkap *</FieldLabel>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-input border-border"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-username">Username</FieldLabel>
                <Input
                  id="edit-username"
                  value={formData.username}
                  disabled
                  className="bg-muted text-muted-foreground border-border cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">Username tidak dapat diubah.</p>
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-email">Email *</FieldLabel>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-input border-border"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-password">Password Baru (Opsional)</FieldLabel>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-input border-border"
                  placeholder="Kosongkan jika tidak ingin mengubah"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-role">Role *</FieldLabel>
                <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            {error && <p className="text-destructive text-sm mt-4">{error}</p>}
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Perbarui
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Hapus Pengguna</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Apakah Anda yakin ingin menghapus akun &quot;{deleteUser?.name}&quot;? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
