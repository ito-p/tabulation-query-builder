import squel from 'squel';

import { addBacktick } from '../utils/StringDecorator';

import getDateFormatQuery from '../utils/getDateFormatQuery';

export default class AggregatingConfig {
  config;

  constructor(config) {
    this.config = config;
  }

  get field() {
    return this.config.field;
  }

  get method() {
    return this.config.method;
  }

  build(table, indexedValue, indexingMethod) {
    const method = this.config.method.toUpperCase();
    const indexedString = addBacktick(indexedValue);

    if (indexingMethod && indexingMethod.match(/each/)) {
      return this.parseWithEachDate(table, method, indexedString, getDateFormatQuery(this.config.db, indexedString, indexingMethod));
    }

    if (this.config.interval) {
      return this.parseWithInterval(table, method, indexedString);
    }

    if (this.config.categoryRange && this.config.categoryRange.length < 2) {
      throw new Error('Invalid categoryRange. categoryRange must be more than 2');
    }

    if (this.config.categoryRange) {
      return this.parseWithCategoryRange(table, method, indexedString);
    }

    return this.parse(table, method, indexedString);
  }

  parse(table, method, indexedValue) {
    return squel
      .select()
      .field(`${method}(${addBacktick(this.field)})`, 'value')
      .field(`${indexedValue}`, 'category')
      .from(table, 'indexing_table')
      .group(`${indexedValue}`);
  }

  parseWithEachDate(table, method, indexedValue, term) {
    return squel
      .select()
      .field(`${method}(${addBacktick(this.field)})`, 'value')
      .field(term, 'category')
      .from(table, 'indexing_table')
      .group(term);
  }

  parseWithInterval(table, method, indexedValue) {
    const intervalString = `FLOOR(${indexedValue} / ${this.config.interval})`;

    return squel
      .select()
      .field(`${method}(${addBacktick(this.field)})`, 'value')
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
      .field(`${method}(${addBacktick(this.field)})`, 'value')
      .field(categoryRangeQuery, 'category')
      .from(table, 'indexing_table')
      .group(categoryRangeQuery);
  }
}
