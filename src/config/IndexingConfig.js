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

  build(table, aggregatingField) {
    const method = this.config.method.toUpperCase();
    const aggregatingString = addBacktick(aggregatingField);

    return squel
      .select()
      .field(`${method}(${addBacktick(this.field)})`, 'indexed_value')
      .field(aggregatingString)
      .from(table, 'matching_table')
      .group(aggregatingString);
  }
}
