import squel from 'squel';

export default class MatchingConfig {
  config;

  constructor(config) {
    this.config = config;
  }

  build(table, indexingField, aggregatingField, indexingFieldAs) {
    const query = squel
      .select()
      .field(indexingField, indexingFieldAs)
      .field(aggregatingField);

    if (this.config.segment && this.config.segment !== indexingField && this.config.segment !== aggregatingField) {
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
