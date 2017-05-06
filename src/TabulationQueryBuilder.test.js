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

  t.is(tqb.build(), 'SELECT COUNT(`user_id`) AS "value", FLOOR(`indexed_value` / 300) AS "category" FROM (SELECT SUM(`price`) AS "indexed_value", `user_id` FROM (SELECT price, user_id FROM payment_logs WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-03 23:59:59")) `matching_table` GROUP BY `user_id`) `indexing_table` GROUP BY FLOOR(`indexed_value` / 300)');
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

  t.is(tqb.build(), 'SELECT SUM(`price`) AS "value", FLOOR(`user_id` / 1) AS "category" FROM (SELECT user_id, price FROM payment_logs WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-07 23:59:59")) `indexing_table` GROUP BY FLOOR(`user_id` / 1)');
});

test('Total user count by item name', t => {
  const tqb = new TabulationQueryBuilder();

  tqb.setTable('payment_logs');

  tqb.setMatching({
    field: 'timestamp',
    range: [ '2017-01-01 00:00:00', '2017-01-07 23:59:59' ]
  });

  tqb.setAggregating({
    field: 'user_id',
    method: 'count'
  });

  tqb.setIndexing({
    field: 'item'
  });

  t.is(tqb.build(), 'SELECT COUNT(`user_id`) AS "value", `indexed_value` AS "category" FROM (SELECT `item` AS "indexed_value", `user_id` FROM (SELECT item, user_id FROM payment_logs WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-07 23:59:59")) `matching_table` GROUP BY `user_id`, item) `indexing_table` GROUP BY `indexed_value`');
});

test('Total price by item name', t => {
  const tqb = new TabulationQueryBuilder();

  tqb.setTable('payment_logs');

  tqb.setMatching({
    field: 'timestamp',
    range: [ '2017-01-01 00:00:00', '2017-01-07 23:59:59' ]
  });

  tqb.setAggregating({
    field: 'price',
    method: 'sum'
  });

  tqb.setIndexing({
    field: 'item'
  });

  t.is(tqb.build(), 'SELECT SUM(`price`) AS "value", `item` AS "category" FROM (SELECT item, price FROM payment_logs WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-07 23:59:59")) `indexing_table` GROUP BY `item`');
});

test('Total user count for each day', t => {
  const tqb = new TabulationQueryBuilder();

  tqb.setTable('payment_logs');

  tqb.setMatching({
    field: 'timestamp',
    range: [ '2017-01-01 00:00:00', '2017-01-07 23:59:59' ]
  });

  tqb.setAggregating({
    field: 'user_id',
    method: 'count'
  });

  tqb.setIndexing({
    field: 'timestamp',
    method: 'eachDays'
  });

  t.is(tqb.build(), 'SELECT COUNT(`user_id`) AS "value", `indexed_value` AS "category" FROM (SELECT `timestamp` AS "indexed_value", `user_id` FROM (SELECT DATE_FORMAT(`timestamp`, "%Y-%m-%d") AS "timestamp", user_id FROM payment_logs WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-07 23:59:59")) `matching_table` GROUP BY `user_id`, timestamp) `indexing_table` GROUP BY `indexed_value`');
});

test('Average price for each day', t => {
  const tqb = new TabulationQueryBuilder();

  tqb.setTable('payment_logs');

  tqb.setMatching({
    field: 'timestamp',
    range: [ '2017-01-01 00:00:00', '2017-01-07 23:59:59' ]
  });

  tqb.setAggregating({
    field: 'price',
    method: 'avg'
  });

  tqb.setIndexing({
    field: 'timestamp',
    method: 'eachDays'
  });

  t.is(tqb.build(), 'SELECT AVG(`price`) AS "value", DATE_FORMAT(`timestamp`, "%Y-%m-%d") AS "category" FROM (SELECT timestamp, price FROM payment_logs WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-07 23:59:59")) `indexing_table` GROUP BY DATE_FORMAT(`timestamp`, "%Y-%m-%d")');
});
