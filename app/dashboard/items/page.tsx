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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

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
    category_id: "",
    quantity: "",
    unit: "",
    min_stock: "",
    location: "",
    purchase_price: "",
    sale_price: "",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category_id: "",
      quantity: "",
      unit: "",
      min_stock: "",
      location: "",
      purchase_price: "",
      sale_price: "",
    })
    setError("")
  }

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        description: editingItem.description || "",
        category_id: editingItem.category_id.toString(),
        quantity: editingItem.quantity.toString(),
        unit: editingItem.unit,
        min_stock: editingItem.min_stock.toString(),
        location: editingItem.location || "",
        purchase_price: editingItem.purchase_price.toString(),
        sale_price: editingItem.sale_price.toString(),
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
      category_id: parseInt(formData.category_id),
      quantity: parseInt(formData.quantity),
      unit: formData.unit,
      min_stock: parseInt(formData.min_stock) || 0,
      location: formData.location || null,
      purchase_price: parseFloat(formData.purchase_price) || 0,
      sale_price: parseFloat(formData.sale_price) || 0,
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
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Nama Barang *</FieldLabel>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-input border-border"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="category">Kategori *</FieldLabel>
                  <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="quantity">Jumlah *</FieldLabel>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                      min="0"
                      className="bg-input border-border"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="unit">Satuan *</FieldLabel>
                    <Input
                      id="unit"
                      placeholder="pcs, kg, dll"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      required
                      className="bg-input border-border"
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="min_stock">Stok Minimum</FieldLabel>
                  <Input
                    id="min_stock"
                    type="number"
                    value={formData.min_stock}
                    onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                    min="0"
                    className="bg-input border-border"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="purchase_price">Harga Beli</FieldLabel>
                    <Input
                      id="purchase_price"
                      type="number"
                      value={formData.purchase_price}
                      onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                      min="0"
                      className="bg-input border-border"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="sale_price">Harga Jual</FieldLabel>
                    <Input
                      id="sale_price"
                      type="number"
                      value={formData.sale_price}
                      onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                      min="0"
                      className="bg-input border-border"
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="location">Lokasi Penyimpanan</FieldLabel>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="bg-input border-border"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-input border-border"
                    rows={3}
                  />
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-input border-border">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Kategori</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
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
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Kategori</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Stok</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Harga Beli</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Harga Jual</th>
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
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{item.category_name}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={
                            item.quantity <= item.min_stock
                              ? "border-destructive/50 text-destructive"
                              : "border-success/50 text-success"
                          }
                        >
                          {item.quantity} {item.unit}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-foreground">{formatCurrency(item.purchase_price)}</td>
                      <td className="py-3 px-4 text-foreground">{formatCurrency(item.sale_price)}</td>
                      <td className="py-3 px-4 text-muted-foreground">{item.location || "-"}</td>
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
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="edit-name">Nama Barang *</FieldLabel>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-input border-border"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-category">Kategori *</FieldLabel>
                <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="edit-quantity">Jumlah *</FieldLabel>
                  <Input
                    id="edit-quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    min="0"
                    className="bg-input border-border"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-unit">Satuan *</FieldLabel>
                  <Input
                    id="edit-unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    required
                    className="bg-input border-border"
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="edit-min_stock">Stok Minimum</FieldLabel>
                <Input
                  id="edit-min_stock"
                  type="number"
                  value={formData.min_stock}
                  onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                  min="0"
                  className="bg-input border-border"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="edit-purchase_price">Harga Beli</FieldLabel>
                  <Input
                    id="edit-purchase_price"
                    type="number"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                    min="0"
                    className="bg-input border-border"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-sale_price">Harga Jual</FieldLabel>
                  <Input
                    id="edit-sale_price"
                    type="number"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                    min="0"
                    className="bg-input border-border"
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="edit-location">Lokasi Penyimpanan</FieldLabel>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-input border-border"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-description">Deskripsi</FieldLabel>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-input border-border"
                  rows={3}
                />
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
