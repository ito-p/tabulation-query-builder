import MatchingConfig from './config/MatchingConfig';

import IndexingConfig from './config/IndexingConfig';

import AggregatingConfig from './config/AggregatingConfig';

import { addBacktick } from './utils/StringDecorator';

import getDateFormatQuery from './utils/getDateFormatQuery';

export default class TabulationQueryBuilder {
  table;
  matchingConfig;
  indexingConfig;
  aggregatingConfig;

  setTable(table) {
    this.table = table;
  }

  setMatching(config) {
    this.matchingConfig = new MatchingConfig(config);
  }

  setIndexing(config) {
    this.indexingConfig = new IndexingConfig(config);
  }

  setAggregating(config) {
    this.aggregatingConfig = new AggregatingConfig(config);
  }

  build() {
    if (this.aggregatingConfig.method === 'count') {
      return this.buildWithIndexing();
    }

    const matchingTable = this.matchingConfig.build(this.table, this.indexingConfig.field, this.aggregatingConfig.field).toString();

    return this.aggregatingConfig.build(this.addParen(matchingTable), this.indexingConfig.field, this.indexingConfig.method).toString();
  }

  buildWithIndexing() {
    let indexingField;
    let indexingFieldAs = null;

    if (this.indexingConfig.method && this.indexingConfig.method.match(/each/)) {
      indexingField = getDateFormatQuery(addBacktick(this.indexingConfig.field), this.indexingConfig.method);
      indexingFieldAs = this.indexingConfig.field;
    } else {
      indexingField = this.indexingConfig.field;
    }

    const matchingTable = this.matchingConfig.build(this.table, indexingField, this.aggregatingConfig.field, indexingFieldAs).toString();

    const indexingTable = this.indexingConfig.build(this.addParen(matchingTable), this.aggregatingConfig.field, this.aggregatingConfig.method).toString();

    return this.aggregatingConfig.build(this.addParen(indexingTable), 'indexed_value').toString();
  }

  addParen(str) {
    return `(${str})`;
  }
}
