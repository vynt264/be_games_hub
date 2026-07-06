export const parseDateString = (dateString: string): Date => {
  if (
    dateString.includes("T") &&
    (dateString.includes("+") || dateString.includes("Z"))
  ) {
    return new Date(dateString);
  }

  const year = parseInt(dateString.substring(0, 4));
  const month = parseInt(dateString.substring(4, 6)) - 1;
  const day = parseInt(dateString.substring(6, 8));
  return new Date(year, month, day);
};

export const formatDateToGMT7 = (date: Date): string => {
  if (!date) return "";

  const gmt7Date = new Date(date.getTime() + 7 * 60 * 60 * 1000);

  const year = gmt7Date.getUTCFullYear();
  const month = String(gmt7Date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(gmt7Date.getUTCDate()).padStart(2, "0");
  const hours = String(gmt7Date.getUTCHours()).padStart(2, "0");
  const minutes = String(gmt7Date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(gmt7Date.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
