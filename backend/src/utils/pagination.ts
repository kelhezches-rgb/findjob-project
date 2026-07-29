export const paginate = (page: number, limit: number) => ({
  skip: (page - 1) * limit,
  take: limit,
})

export const paginationMeta = (total: number, page: number, limit: number) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
})
