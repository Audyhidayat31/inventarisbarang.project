"use client"

import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface CategoryChartProps {
  data: { category: string; count: number }[]
}

const COLORS = [
  "hsl(175, 60%, 45%)",
  "hsl(280, 50%, 55%)",
  "hsl(85, 50%, 55%)",
  "hsl(25, 70%, 50%)",
  "hsl(320, 50%, 45%)",
]

export function CategoryChart({ data }: CategoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <p>Belum ada data kategori</p>
      </div>
    )
  }

  const chartData = data.map((item) => ({
    name: item.category,
    value: parseInt(item.count as unknown as string),
  }))

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            width={100}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
            formatter={(value: number) => [`${value} item`, "Jumlah"]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
