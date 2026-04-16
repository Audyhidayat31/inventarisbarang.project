"use client"

import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Package, TrendingUp, TrendingDown, DollarSign, Loader2 } from "lucide-react"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  CartesianGrid,
} from "recharts"
import type { DashboardStats } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

const COLORS = [
  "hsl(175, 60%, 45%)",
  "hsl(280, 50%, 55%)",
  "hsl(85, 50%, 55%)",
  "hsl(25, 70%, 50%)",
  "hsl(320, 50%, 45%)",
]

export default function ReportsPage() {
  const { data: stats, isLoading } = useSWR<DashboardStats>("/api/stats", fetcher)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Gagal memuat data laporan</p>
      </div>
    )
  }

  const categoryData = stats.items_by_category.map((item) => ({
    name: item.category,
    value: parseInt(item.count as unknown as string),
  }))

  const totalStock = stats.recent_items.reduce((sum, item) => sum + (item.stock || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Laporan & Statistik</h1>
        <p className="text-muted-foreground">Analisis dan ringkasan inventaris Anda</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Jenis Barang</p>
                <p className="text-2xl font-bold text-foreground">{stats.total_items}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nilai Inventaris</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.total_value)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-chart-2/10">
                <TrendingUp className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stok Baik</p>
                <p className="text-2xl font-bold text-foreground">{stats.total_items - stats.low_stock_items}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-destructive/10">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stok Rendah</p>
                <p className="text-2xl font-bold text-foreground">{stats.low_stock_items}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar Chart - Items by Category */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Distribusi Barang per Kategori
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Jumlah jenis barang dalam setiap kategori
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>Belum ada data</p>
              </div>
            ) : (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" margin={{ top: 10, left: 0, right: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      type="number" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      width={100}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                    />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
                      }}
                      formatter={(value: number) => [`${value} item`, "Jumlah"]}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={40} animationDuration={1000}>
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart - Category Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-chart-2" />
              Proporsi Kategori
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Persentase distribusi barang per kategori
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>Belum ada data</p>
              </div>
            ) : (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      label={false}
                      animationDuration={1000}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="hsl(var(--card))" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
                      }}
                      formatter={(value: number) => [`${value} item`, "Jumlah"]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => <span style={{ color: "hsl(var(--foreground))", fontWeight: 500, marginLeft: '4px' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stock Status */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Ringkasan Stok</CardTitle>
            <CardDescription className="text-muted-foreground">
              Status stok per kategori
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.items_by_category.map((cat, index) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-foreground">{cat.category}</span>
                  </div>
                  <Badge variant="secondary">{cat.count} item</Badge>
                </div>
              ))}
              {stats.items_by_category.length === 0 && (
                <p className="text-muted-foreground text-center py-4">Belum ada data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              Barang Perlu Restok
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Daftar barang dengan stok di bawah minimum
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.low_stock_list.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
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
                      <p className="text-sm text-muted-foreground">{item.category_name}</p>
                    </div>
                    <Badge variant="outline" className="border-destructive/50 text-destructive">
                      {item.stock} {item.unit}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Statistik Cepat</CardTitle>
          <CardDescription className="text-muted-foreground">
            Ringkasan data inventaris
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-3xl font-bold text-primary">{stats.total_categories}</p>
              <p className="text-sm text-muted-foreground">Total Kategori</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-3xl font-bold text-success">{stats.total_items}</p>
              <p className="text-sm text-muted-foreground">Jenis Barang</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-3xl font-bold text-chart-2">
                {stats.total_items > 0 ? Math.round((1 - stats.low_stock_items / stats.total_items) * 100) : 100}%
              </p>
              <p className="text-sm text-muted-foreground">Kesehatan Stok</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
