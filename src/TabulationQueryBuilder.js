import MatchingConfig from './config/MatchingConfig';
import IndexingConfig from './config/IndexingConfig';
import AggregatingConfig from './config/AggregatingConfig';

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
    if (this.indexingConfig.method) {
      return this.buildWithIndexing();
    }

    const matchingTable = this.matchingConfig.build(this.table, this.indexingConfig.field, this.aggregatingConfig.field).toString();

    return this.aggregatingConfig.build(this.addParen(matchingTable), this.indexingConfig.field).toString();
  }

  buildWithIndexing() {
    const matchingTable = this.matchingConfig.build(this.table, this.indexingConfig.field, this.aggregatingConfig.field).toString();

    const indexingTable = this.indexingConfig.build(this.addParen(matchingTable), this.aggregatingConfig.field).toString();

    return this.aggregatingConfig.build(this.addParen(indexingTable), 'indexed_value').toString();
  }

  addParen(str) {
    return `(${str})`;
  }
}
