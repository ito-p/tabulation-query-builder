import squel from 'squel';

import getDateFormatQuery from '../utils/getDateFormatQuery';

import { addBacktick, getIndexedValue } from '../utils/StringDecorator';

export default class MatchingConfig {
  config;

  constructor(config) {
    this.config = config;
  }

  build(table, indexings, aggregating) {
    const query = squel.select();

    indexings.forEach((indexing, index) => {
      if (indexing.method && indexing.method.match(/each/) && aggregating.method === 'count') {
        const dateFormatField = getDateFormatQuery(this.config.db, addBacktick(indexing.field), indexing.method);

        query.field(dateFormatField, getIndexedValue(index));
      } else {
        query.field(indexing.field, getIndexedValue(index));
      }
    });

    query.field(aggregating.field);

    if (this.config.segment && this.config.segment !== aggregating.field) {
      query.field(this.config.segment);
    }

    query
      .from(table)
      .where(this.parse(squel, this.config));

    return query;
  }

  parse(builder, conf) {
    if (conf.field === undefined) {
      return this.parseTerm(builder, conf);
    }

    if (conf.range) {
      return this.parseRange(conf.field, conf.range);
    }

    if (conf.in) {
      return this.parseIn(conf.field, conf.in);
    }

    if (conf.operator) {
      return this.parseOperator(conf.field, conf.operator, conf.value);
    }
  }

  parseIn(field, inStatement) {
    return `${field} IN (${inStatement.map(statement => `"${statement}"`).join(',')})`;
  }

  parseRange(field, range) {
    return `"${range[0]}" <= ${field} AND ${field} <= "${range[1]}"`;
  }

  parseOperator(field, operator, value) {
    return `${field} ${operator} "${value}"`;
  }

  parseTerm(builder, conf) {
    const operator = conf.and ? 'and' : 'or';

    if (!conf[operator]) {
      throw new Error(`Invalid matching config. No field 'and', 'or'. ${JSON.stringify(conf)}`);
    }

    return builder.expr()[operator](
        this.parse(builder, conf[operator][0])
      )[operator](
        this.parse(builder, conf[operator][1])
      );
  }
}
