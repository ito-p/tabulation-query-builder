export default function getDateFormatQuery(field, method) {
  switch (method) {
    case 'eachDay': return `DATE_FORMAT(${field}, "%Y-%m-%d")`;
  }
}
