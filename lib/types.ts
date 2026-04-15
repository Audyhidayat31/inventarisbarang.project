export interface Category {
  id: string
  name: string
  description: string | null
  item_count?: number
  created_at: string
  updated_at: string
}

export interface Item {
  id: string
  name: string
  description: string | null
  sku: string
  stock: number
  unit: string
  categoryId: string
  category_name?: string
  locationId: string | null
  location_name?: string | null
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  total_items: number
  total_categories: number
  low_stock_items: number
  total_value: number
  items_by_category: { category: string; count: number }[]
  recent_items: Item[]
  low_stock_list: Item[]
}
