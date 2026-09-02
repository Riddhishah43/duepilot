const { paginate, paginationMeta } = require("../utils/paginate");

describe("paginate utility", () => {
  const createMockQuery = () => ({
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  });

  it("returns query with default pagination (page=1, limit=20)", () => {
    const query = createMockQuery();
    paginate(query);
    expect(query.skip).toHaveBeenCalledWith(0);
    expect(query.limit).toHaveBeenCalledWith(20);
  });

  it("applies correct skip/limit for page 2, limit 10", () => {
    const query = createMockQuery();
    paginate(query, 2, 10);
    expect(query.skip).toHaveBeenCalledWith(10);
    expect(query.limit).toHaveBeenCalledWith(10);
  });

  it("clamps limit to max 100", () => {
    const query = createMockQuery();
    paginate(query, 1, 200);
    expect(query.limit).toHaveBeenCalledWith(100);
  });

  it("clamps limit to min 1 for negative values", () => {
    const query = createMockQuery();
    paginate(query, 1, -5);
    expect(query.limit).toHaveBeenCalledWith(1);
  });

  it("clamps page to min 1", () => {
    const query = createMockQuery();
    paginate(query, -5, 10);
    expect(query.skip).toHaveBeenCalledWith(0);
  });

  it("handles non-numeric inputs gracefully", () => {
    const query = createMockQuery();
    paginate(query, "abc", "xyz");
    expect(query.skip).toHaveBeenCalledWith(0);
    expect(query.limit).toHaveBeenCalledWith(20);
  });
});

describe("paginationMeta", () => {
  it("returns correct metadata for page 1, limit 10, total 55", () => {
    const meta = paginationMeta(55, 1, 10);
    expect(meta).toEqual({
      page: 1,
      limit: 10,
      total: 55,
      pages: 6,
      hasNext: true,
      hasPrev: false,
    });
  });

  it("returns correct metadata for last page", () => {
    const meta = paginationMeta(55, 6, 10);
    expect(meta).toEqual({
      page: 6,
      limit: 10,
      total: 55,
      pages: 6,
      hasNext: false,
      hasPrev: true,
    });
  });

  it("returns correct metadata for empty results", () => {
    const meta = paginationMeta(0, 1, 20);
    expect(meta).toEqual({
      page: 1,
      limit: 20,
      total: 0,
      pages: 0,
      hasNext: false,
      hasPrev: false,
    });
  });

  it("handles default parameters", () => {
    const meta = paginationMeta(100);
    expect(meta.page).toBe(1);
    expect(meta.limit).toBe(20);
    expect(meta.pages).toBe(5);
  });
});
