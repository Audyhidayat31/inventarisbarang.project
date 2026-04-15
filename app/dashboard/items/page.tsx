"use client"

import { useState, useEffect, useCallback } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Package, Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react"
import type { Item, Category } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function ItemsPage() {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<Item | null>(null)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (categoryFilter) params.set("category", categoryFilter)
    return `/api/items?${params.toString()}`
  }, [search, categoryFilter])

  const { data: items, isLoading: itemsLoading } = useSWR<Item[]>(buildUrl(), fetcher)
  const { data: categories } = useSWR<Category[]>("/api/categories", fetcher)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    categoryId: "",
    stock: "",
    unit: "",
    locationId: "",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      sku: "",
      categoryId: "",
      stock: "",
      unit: "",
      locationId: "",
    })
    setError("")
  }

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        description: editingItem.description || "",
        sku: editingItem.sku,
        categoryId: editingItem.categoryId,
        stock: editingItem.stock.toString(),
        unit: editingItem.unit,
        locationId: editingItem.locationId || "",
      })
    }
  }, [editingItem])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const payload = {
      name: formData.name,
      description: formData.description || null,
      sku: formData.sku,
      categoryId: formData.categoryId,
      stock: parseInt(formData.stock),
      unit: formData.unit,
      locationId: formData.locationId || null,
    }

    try {
      const url = editingItem ? `/api/items/${editingItem.id}` : "/api/items"
      const method = editingItem ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan")
        setLoading(false)
        return
      }

      await mutate(buildUrl())
      setIsAddOpen(false)
      setIsEditOpen(false)
      setEditingItem(null)
      resetForm()
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return

    try {
      await fetch(`/api/items/${deleteItem.id}`, { method: "DELETE" })
      await mutate(buildUrl())
      setDeleteItem(null)
    } catch {
      console.error("Delete error")
    }
  }

  const ItemForm = ({ idPrefix = "" }: { idPrefix?: string }) => (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}name`}>Nama Barang *</FieldLabel>
        <Input
          id={`${idPrefix}name`}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="bg-input border-border"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}sku`}>Kode Barang (SKU) *</FieldLabel>
        <Input
          id={`${idPrefix}sku`}
          placeholder="Contoh: BRG-001"
          value={formData.sku}
          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          required
          className="bg-input border-border"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}category`}>Kategori *</FieldLabel>
        <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
          <SelectTrigger className="bg-input border-border">
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor={`${idPrefix}stock`}>Stok *</FieldLabel>
          <Input
            id={`${idPrefix}stock`}
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            required
            min="0"
            className="bg-input border-border"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${idPrefix}unit`}>Satuan *</FieldLabel>
          <Input
            id={`${idPrefix}unit`}
            placeholder="pcs, kg, dll"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            required
            className="bg-input border-border"
          />
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}description`}>Deskripsi</FieldLabel>
        <Textarea
          id={`${idPrefix}description`}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-input border-border"
          rows={3}
        />
      </Field>
    </FieldGroup>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daftar Barang</h1>
          <p className="text-muted-foreground">Kelola inventaris barang Anda</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Barang
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">Tambah Barang Baru</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Isi informasi barang yang akan ditambahkan
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <ItemForm />
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

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari barang..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-input border-border"
              />
            </div>
            <Select 
              value={categoryFilter || "all"} 
              onValueChange={(v) => setCategoryFilter(v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-full sm:w-48 bg-input border-border">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Daftar Barang
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {items?.length || 0} barang ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {itemsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !items || items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Belum ada barang dalam inventaris</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nama</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">SKU</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Kategori</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Stok</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Lokasi</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-border/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-xs">{item.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-mono text-sm">{item.sku}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{item.category_name}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={
                            item.stock <= 5
                              ? "border-destructive/50 text-destructive"
                              : "border-success/50 text-success"
                          }
                        >
                          {item.stock} {item.unit}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{item.location_name || "-"}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingItem(item)
                              setIsEditOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteItem(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) { setEditingItem(null); resetForm() } }}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Barang</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Perbarui informasi barang
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <ItemForm idPrefix="edit-" />
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
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Hapus Barang</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Apakah Anda yakin ingin menghapus &quot;{deleteItem?.name}&quot;? Tindakan ini tidak dapat dibatalkan.
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
