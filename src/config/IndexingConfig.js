import squel from 'squel';

import { addBacktick, getIndexedValue } from '../utils/StringDecorator';

export default class IndexingConfig {
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

  get interval() {
    return this.config.interval;
  }

  get categoryRange() {
    return this.config.categoryRange;
  }

  static build(table, aggregating, indexings, segment) {
    const aggregatingString = addBacktick(aggregating.field);

    const query = squel
      .select();

    let isAggregatingGrouping = false;

    indexings.forEach((indexing, index) => {
      const isNeedGrouping = (!indexing.method || (indexing.method && indexing.method.match(/each/))) && aggregating.method === 'count';

      const indexedField = addBacktick(getIndexedValue(index));

      if (indexing.method && !indexing.method.match(/each/)) {
        const method = indexing.method.toUpperCase();

        query.field(`${method}(${indexedField})`, getIndexedValue(index));
      } else {
        query.field(indexedField);
      }

      if (segment && isNeedGrouping && segment !== aggregating.field && !indexings.find(i => i.field === segment)) {
        query.field(`GROUP_CONCAT(${addBacktick(segment)})`, 'segment_ids');
      } else if (segment) {
        query.field(addBacktick(segment), 'segment_ids');
      }

      if (isNeedGrouping) {
        isAggregatingGrouping = true;

        query.group(addBacktick(getIndexedValue(index)));
      } else if (indexing.method) {
        isAggregatingGrouping = true;
      }
    });

    if (isAggregatingGrouping) {
      query.group(aggregatingString);
    }

    query.field(aggregatingString);

    query.from(table, 'matching_table');

    return query;
  }
}
