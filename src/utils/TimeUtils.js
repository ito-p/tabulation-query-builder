export function getDateFormatQuery(db, field, method, timezone) {
  const isSqlite = db === 'sqlite';

  const timeField = getTimezoneConvertedDatetime(field, timezone);

  switch (method) {
    case 'eachDays':
      return isSqlite ?
        `strftime("%Y-%m-%d", ${timeField})` :
        `DATE_FORMAT(${timeField}, "%Y-%m-%d")`;
    case 'eachWeeks':
      return isSqlite ?
        `strftime("%Y%W", ${timeField})` :
        `YEARWEEK(${timeField},3)`;
    case 'eachMonths':
      return isSqlite ?
        `strftime("%Y-%m", ${timeField})` :
        `DATE_FORMAT(${timeField}, "%Y-%m")`;
    case 'eachYears':
      return isSqlite ?
        `strftime("%Y", ${timeField})` :
        `DATE_FORMAT(${timeField}, "%Y")`;
    case 'eachDayOfWeek':
      return isSqlite ?
        `strftime("%w", ${timeField})` :
        `DATE_FORMAT(${timeField}, "%w")`;
    case 'eachTimeOfHour':
      return isSqlite ?
        `strftime("%H", ${timeField})` :
        `DATE_FORMAT(${timeField}, "%H")`;
  }
}

export function getTimezoneConvertedDatetime(field, timezone) {
  if (timezone) {
    return `CONVERT_TZ(${field}, "${timezone.from}", "${timezone.to}")`;
  }

  return field;
}
