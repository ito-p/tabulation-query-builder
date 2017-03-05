import squel from 'squel';

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

    return squel
      .select()
      .field(`${method}(${this.config.field})`, 'indexed_value')
      .field(aggregatingField)
      .from(table, 'matching_table')
      .group(aggregatingField);
  }
}
