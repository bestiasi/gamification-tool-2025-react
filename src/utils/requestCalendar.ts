// 0-based month (8 = September). Scores and new requests only cover the academic year that is running.
export const ACADEMIC_YEAR_START_MONTH = 8;

export function academicYearStart(today = new Date()): string {
  const year = today.getMonth() < ACADEMIC_YEAR_START_MONTH ? today.getFullYear() - 1 : today.getFullYear();
  return `${year}-${String(ACADEMIC_YEAR_START_MONTH + 1).padStart(2, '0')}-01`;
}

const MONTH_NAMES = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie',
];

export function getRequestMonths(today = new Date()) {
  const year = today.getFullYear();
  const currentMonth = today.getMonth();
  const startYear = currentMonth < ACADEMIC_YEAR_START_MONTH ? year - 1 : year;
  const months: { value: number; name: string; year: number }[] = [];

  for (let dateYear = startYear; dateYear <= year; dateYear++) {
    const first = dateYear === startYear ? ACADEMIC_YEAR_START_MONTH : 0;
    const last = dateYear === year ? currentMonth : 11;
    for (let month = first; month <= last; month++) {
      months.push({ value: month, name: MONTH_NAMES[month], year: dateYear });
    }
  }
  return months;
}

export function getRequestDays(month: number, year: number, today = new Date()) {
  const lastDay = year === today.getFullYear() && month === today.getMonth()
    ? today.getDate()
    : new Date(year, month + 1, 0).getDate();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  return [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: lastDay }, (_, index) => index + 1),
  ];
}
