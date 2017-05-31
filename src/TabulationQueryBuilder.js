import MatchingConfig from './config/MatchingConfig';

import IndexingConfig from './config/IndexingConfig';

import AggregatingConfig from './config/AggregatingConfig';

export default class TabulationQueryBuilder {
  config = {};
  table;
  matchingConfig;
  indexingConfigList = [];
  aggregatingConfig;

  constructor(config = {}) {
    this.config = config;
  }

  setTable(table) {
    this.table = table;
  }

  setMatching(config) {
    this.matchingConfig = new MatchingConfig({ ...config, ...this.config});
  }

  setIndexing(config) {
    this.indexingConfigList[0] = new IndexingConfig({ ...config, ...this.config});
  }

  setIndexings(configs) {
    this.indexingConfigList = configs.map((config, index) => {
      return new IndexingConfig({ ...config, ...this.config, index});
    });
  }

  setAggregating(config) {
    this.aggregatingConfig = new AggregatingConfig({ ...config, ...this.config});
  }

  build() {
    if (this.aggregatingConfig.method === 'count') {
      return this.buildWithIndexing();
    }

    const matchingTable = this.matchingConfig.build(this.table, this.indexingConfigList, this.aggregatingConfig).toString();

    return this.aggregatingConfig.build(this.addParen(matchingTable), this.indexingConfigList).toString();
  }

  buildWithIndexing() {
    const matchingTable = this.matchingConfig.build(this.table, this.indexingConfigList, this.aggregatingConfig).toString();

    const indexingTable = IndexingConfig.build(this.addParen(matchingTable), this.aggregatingConfig, this.indexingConfigList, this.config.segment).toString();

    return this.aggregatingConfig.build(this.addParen(indexingTable), this.indexingConfigList.map(config => {
      return {
        field: config.field,
        interval: config.interval,
        categoryRange: config.categoryRange
      };
    })).toString();
  }

  addParen(str) {
    return `(${str})`;
  }
}
