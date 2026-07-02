function paginate(query, page = 1, limit = 20) {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 20));
  return query.skip((p - 1) * l).limit(l);
}

function paginationMeta(total, page = 1, limit = 20) {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 20));
  return {
    page: p,
    limit: l,
    total,
    pages: Math.ceil(total / l),
    hasNext: p * l < total,
    hasPrev: p > 1,
  };
}

module.exports = { paginate, paginationMeta };
