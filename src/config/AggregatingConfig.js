import squel from 'squel';

import { addBacktick, getIndexedValue } from '../utils/StringDecorator';

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

  getCategoryField(length, index) {
    if (length > 1) {
      return `category_${index}`;
    }

    return 'category';
  }

  addSegmentField(query) {
    if (!this.config.segment) {
      return query;
    }

    if (this.config.method === 'count') {
      query.field(`GROUP_CONCAT(DISTINCT ${addBacktick('segment_ids')})`, 'segment_ids');
    } else {
      query.field(`GROUP_CONCAT(DISTINCT ${addBacktick(this.config.segment)})`, 'segment_ids');
    }

    return query;
  }

  build(table, indexings) {
    const method = this.config.method.toUpperCase();

    const query = squel.select()
      .field(`${method}(${addBacktick(this.field)})`, 'value');

    indexings.forEach((indexing, index) => {
      if (indexing.method && indexing.method.match(/each/)) {
        return this.parseWithEachDate(query, table, method, indexing, index, indexings.length);
      }

      if (indexing.interval) {
        return this.parseWithInterval(query, table, method, indexing, index, indexings.length);
      }

      if (indexing.categoryRange && indexing.categoryRange.length < 2) {
        throw new Error('Invalid categoryRange. categoryRange must be more than 2');
      }

      if (indexing.categoryRange) {
        return this.parseWithCategoryRange(query, table, method, indexing, index, indexings.length);
      }

      this.parse(query, table, method, indexing, index, indexings.length);
    });

    this.addSegmentField(query);

    query.from(table, 'indexing_table');

    return query;
  }

  parse(query, table, method, indexingConfig, index, indexingsLength) {
    const indexedValue = addBacktick(getIndexedValue(index));

    query.field(indexedValue, this.getCategoryField(indexingsLength, index));

    query.group(`${indexedValue}`);

    return query;
  }

  parseWithEachDate(query, table, method, indexingConfig, index, indexingsLength) {
    const indexedValue = addBacktick(getIndexedValue(index));

    const term = getDateFormatQuery(this.config.db, indexedValue, indexingConfig.method);

    query.field(term, this.getCategoryField(indexingsLength, index));

    query.group(term);

    return query;
  }

  parseWithInterval(query, table, method, indexingConfig, index, indexingsLength) {
    const indexedValue = addBacktick(getIndexedValue(index));

    const intervalString = `FLOOR(${indexedValue} / ${indexingConfig.interval})`;

    query.field(intervalString, this.getCategoryField(indexingsLength, index));

    query.group(intervalString);

    return query;
  }

  parseWithCategoryRange(query, table, method, indexingConfig, index, indexingsLength) {
    const indexedValue = addBacktick(getIndexedValue(index));

    const categoryRange = indexingConfig.categoryRange;

    const categoryRangeQuery = squel.case();

    categoryRange.forEach((category, i) => {
      if (i === categoryRange.length - 1) {
        return;
      }

      categoryRangeQuery
        .when(`${category} <= ${indexedValue} AND ${indexedValue} < ${categoryRange[i + 1]}`)
        .then(category);
    });

    query.field(categoryRangeQuery, this.getCategoryField(indexingsLength, index));

    query.group(categoryRangeQuery);

    return query;
  }
}
