export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export const average = (values, fallback = 0) => {
  const numeric = values.filter((value) => Number.isFinite(Number(value))).map(Number);
  return numeric.length ? Math.round(numeric.reduce((sum, value) => sum + value, 0) / numeric.length) : fallback;
};
