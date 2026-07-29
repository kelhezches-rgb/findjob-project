import { Category } from '@/types'

export interface CategoryGroup {
  group: string
  categories: Category[]
}

// Categories come back from GET /jobs/categories already ordered by
// group then name (see backend job.service.ts), so this just buckets
// consecutive items — no client-side re-sorting needed.
export function groupCategories(categories: Category[]): CategoryGroup[] {
  const groups: CategoryGroup[] = []
  const indexByGroup = new Map<string, number>()

  for (const cat of categories) {
    const key = cat.group || 'อื่นๆ'
    const existingIndex = indexByGroup.get(key)
    if (existingIndex === undefined) {
      indexByGroup.set(key, groups.length)
      groups.push({ group: key, categories: [cat] })
    } else {
      groups[existingIndex].categories.push(cat)
    }
  }

  return groups
}
