export interface Category {
  id: number
  name: string
  description: string | null
  created_at: string
}

export interface Item {
  id: number
  name: string
  description: string | null
  category_id: number
  category_name?: string
  quantity: number
  unit: string
  min_stock: number
  location: string | null
  purchase_price: number
  sale_price: number
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
