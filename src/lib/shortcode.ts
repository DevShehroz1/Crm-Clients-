export async function nextShortCode(
  prefix: string,
  getLast: () => Promise<string | null>
): Promise<string> {
  const last = await getLast();
  if (!last) return `${prefix}-1`;
  const match = last.match(/-(\d+)$/);
  const num = match ? parseInt(match[1], 10) + 1 : 1;
  return `${prefix}-${num}`;
}
