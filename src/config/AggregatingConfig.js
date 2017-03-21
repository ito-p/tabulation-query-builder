import squel from 'squel';

export default class AggregatingConfig {
  config;

  constructor(config) {
    this.config = config;
  }

  get field() {
    return this.config.field;
  }

  build(table, indexedValue) {
    const method = this.config.method.toUpperCase();

    if (this.config.interval) {
      return this.parseWithInterval(table, method, indexedValue);
    }

    if (this.config.categoryRange && this.config.categoryRange.length < 2) {
      throw new Error('Invalid categoryRange. categoryRange must be more than 2');
    }

    if (this.config.categoryRange) {
      return this.parseWithCategoryRange(table, method, indexedValue);
    }

    return this.parse(table, method, indexedValue);
  }

  parse(table, method, indexedValue) {
    return squel
      .select()
      .field(`${method}(${this.config.field})`, 'value')
      .field(indexedValue, 'category')
      .from(table, 'indexing_table')
      .group(indexedValue);
  }

  parseWithInterval(table, method, indexedValue) {
    const intervalString = `FLOOR(${indexedValue} / ${this.config.interval})`;

    return squel
      .select()
      .field(`${method}(${this.config.field})`, 'value')
      .field(intervalString, 'category')
      .from(table, 'indexing_table')
      .group(intervalString);
  }

  parseWithCategoryRange(table, method, indexedValue) {
    const categoryRange = this.config.categoryRange;
    const categoryRangeQuery = squel.case();

    categoryRange.forEach((category, index) => {
      if (index === categoryRange.length - 1) {
        return;
      }

      categoryRangeQuery
        .when(`${category} <= ${indexedValue} AND ${indexedValue} < ${categoryRange[index + 1]}`)
        .then(category);
    }, this);

    return squel
      .select()
      .field(`${method}(${this.config.field})`, 'value')
      .field(categoryRangeQuery, 'category')
      .from(table, 'indexing_table')
      .group(categoryRangeQuery);
  }
}
