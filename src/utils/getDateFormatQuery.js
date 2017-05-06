export default function getDateFormatQuery(field, method) {
  switch (method) {
    case 'eachDays': return `DATE_FORMAT(${field}, "%Y-%m-%d")`;
    case 'eachMonths': return `DATE_FORMAT(${field}, "%Y-%m")`;
    case 'eachYears': return `DATE_FORMAT(${field}, "%Y")`;
    case 'eachDayOfWeek': return `DATE_FORMAT(${field}, "%w")`;
  }
}
