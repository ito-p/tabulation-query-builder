import test from 'ava';

import TabulationQueryBuilder from './TabulationQueryBuilder';

test('User count by payment amount', t => {
  const tqb = new TabulationQueryBuilder();

  tqb.setTable('payment_logs');

  tqb.setMatching({
    field: 'timestamp',
    range: [ '2017-01-01 00:00:00', '2017-01-03 23:59:59' ]
  });

  tqb.setAggregating({
    field: 'user_id',
    method: 'count',
    interval: 300
  });

  tqb.setIndexing({
    field: 'price',
    method: 'sum'
  });

  t.is(tqb.build(), 'SELECT COUNT(user_id) AS "value", FLOOR(indexed_value / 300) AS "category" FROM (SELECT SUM(price) AS "indexed_value", user_id FROM (SELECT price, user_id FROM payment_logs WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-03 23:59:59")) `matching_table` GROUP BY user_id) `indexing_table` GROUP BY FLOOR(indexed_value / 300)');
});

test('Total payment by user id', t => {
  const tqb = new TabulationQueryBuilder();

  tqb.setTable('payment_logs');

  tqb.setMatching({
    field: 'timestamp',
    range: [ '2017-01-01 00:00:00', '2017-01-07 23:59:59' ]
  });

  tqb.setAggregating({
    field: 'price',
    method: 'sum',
    interval: 1
  });

  tqb.setIndexing({
    field: 'user_id'
  });

  t.is(tqb.build(), 'SELECT SUM(price) AS "value", FLOOR(user_id / 1) AS "category" FROM (SELECT user_id, price FROM payment_logs WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-07 23:59:59")) `indexing_table` GROUP BY FLOOR(user_id / 1)');
});
