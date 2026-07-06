export function getRewardByRank(
  rank: number | null | undefined,
  rewards: Record<string, number>,
) {
  if (!rank || rank < 1 || rank > 10) return 0;
  const key = `TOP${rank}`;
  return rewards?.[key] ?? 0;
}
