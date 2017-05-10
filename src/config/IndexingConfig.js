import squel from 'squel';

import { addBacktick } from '../utils/StringDecorator';

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

  build(table, aggregatingField, aggregatingMethod) {
    const aggregatingString = addBacktick(aggregatingField);

    const isDoubleGrouping = (!this.method || (this.method && this.method.match(/each/))) && aggregatingMethod === 'count';

    const query = squel
      .select();

    if (this.config.method && !this.config.method.match(/each/)) {
      const method = this.config.method.toUpperCase();
      query.field(`${method}(${addBacktick(this.field)})`, 'indexed_value');
    } else {
      query.field(addBacktick(this.field), 'indexed_value');
    }

    query.field(aggregatingString);

    if (this.config.segment && isDoubleGrouping && this.config.segment !== aggregatingField && this.config.segment !== this.field) {
      query.field(`GROUP_CONCAT(${addBacktick(this.config.segment)})`, 'segment_ids');
    } else if (this.config.segment) {
      query.field(addBacktick(this.config.segment), 'segment_ids');
    }

    query.from(table, 'matching_table');

    if (isDoubleGrouping) {
      query
        .group(aggregatingString)
        .group(this.field);
    } else if (this.method) {
      query.group(aggregatingString);
    }

    return query;
  }
}
