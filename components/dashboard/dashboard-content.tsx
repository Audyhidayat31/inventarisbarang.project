"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, FolderOpen, AlertTriangle, DollarSign, TrendingUp } from "lucide-react"
import type { User } from "@/lib/auth"
import type { DashboardStats } from "@/lib/types"
import { CategoryChart } from "./category-chart"

interface DashboardContentProps {
  user: User
  stats: DashboardStats
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

export function DashboardContent({ user, stats }: DashboardContentProps) {
  const statCards = [
    {
      title: "Total Barang",
      value: stats.total_items.toString(),
      description: "Item dalam inventaris",
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Kategori",
      value: stats.total_categories.toString(),
      description: "Kategori aktif",
      icon: FolderOpen,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Stok Rendah",
      value: stats.low_stock_items.toString(),
      description: "Perlu restok",
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Nilai Inventaris",
      value: formatCurrency(stats.total_value),
      description: "Total aset",
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang kembali, {user.full_name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Barang per Kategori
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Distribusi barang berdasarkan kategori
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryChart data={stats.items_by_category} />
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Peringatan Stok Rendah
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Barang yang perlu segera direstok
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.low_stock_list.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Semua stok dalam kondisi baik</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.low_stock_list.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.category_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className="border-destructive/50 text-destructive"
                      >
                        {item.stock} {item.unit}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Items */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Barang Terbaru
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Barang yang baru ditambahkan ke inventaris
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recent_items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Belum ada barang dalam inventaris</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Nama Barang
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Kategori
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Stok
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      SKU
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Lokasi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_items.map((item) => (
                    <tr key={item.id} className="border-b border-border/50">
                      <td className="py-3 px-4 text-foreground">{item.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{item.category_name}</Badge>
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        {item.stock} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        {item.sku}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {item.location_name || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
