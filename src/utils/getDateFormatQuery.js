export default function getDateFormatQuery(db, field, method) {
  const isSqlite = db === 'sqlite';

  switch (method) {
    case 'eachDays':
      return isSqlite ?
        `strftime("%Y-%m-%d", ${field})` :
        `DATE_FORMAT(${field}, "%Y-%m-%d")`;
    case 'eachWeeks':
      return isSqlite ?
        `strftime("%Y%W", ${field})` :
        `YEARWEEK(${field},3)`;
    case 'eachMonths':
      return isSqlite ?
        `strftime("%Y-%m", ${field})` :
        `DATE_FORMAT(${field}, "%Y-%m")`;
    case 'eachYears':
      return isSqlite ?
        `strftime("%Y", ${field})` :
        `DATE_FORMAT(${field}, "%Y")`;
    case 'eachDayOfWeek':
      return isSqlite ?
        `strftime("%w", ${field})` :
        `DATE_FORMAT(${field}, "%w")`;
  }
}
