export function calculateSeason(timestamp: string): string {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // January is 0

  // Football season: August to May (August = 8)
  return month >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}
