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
    method: 'count'
  });

  tqb.setIndexing({
    field: 'price',
    method: 'sum',
    interval: 300
  });

  t.is(tqb.build(), 'SELECT COUNT(`user_id`) AS "value", FLOOR(`indexed_value_0` / 300) AS "category" FROM (SELECT SUM(`indexed_value_0`) AS "indexed_value_0", `user_id` FROM (SELECT price AS "indexed_value_0", user_id FROM payment_logs WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-03 23:59:59")) `matching_table` GROUP BY `user_id`) `indexing_table` GROUP BY FLOOR(`indexed_value_0` / 300)');
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
    method: 'sum'
  });

  tqb.setIndexing({
    field: 'user_id',
    interval: 1
  });

  t.is(tqb.build(), 'SELECT SUM(`price`) AS "value", FLOOR(`indexed_value_0` / 1) AS "category" FROM (SELECT user_id AS "indexed_value_0", price FROM payment_logs WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-07 23:59:59")) `indexing_table` GROUP BY FLOOR(`indexed_value_0` / 1)');
});

test('Total payment by user id without interval', t => {
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
    field: 'user_id'
  });

  t.is(tqb.build(), 'SELECT SUM(`price`) AS "value", `indexed_value_0` AS "category" FROM (SELECT user_id AS "indexed_value_0", price FROM payment_logs WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-07 23:59:59")) `indexing_table` GROUP BY `indexed_value_0`');
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

  t.is(tqb.build(), 'SELECT COUNT(`user_id`) AS "value", `indexed_value_0` AS "category" FROM (SELECT `indexed_value_0`, `user_id` FROM (SELECT item AS "indexed_value_0", user_id FROM payment_logs WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-07 23:59:59")) `matching_table` GROUP BY `indexed_value_0`, `user_id`) `indexing_table` GROUP BY `indexed_value_0`');
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

  t.is(tqb.build(), 'SELECT SUM(`price`) AS "value", `indexed_value_0` AS "category" FROM (SELECT item AS "indexed_value_0", price FROM payment_logs WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-07 23:59:59")) `indexing_table` GROUP BY `indexed_value_0`');
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

  t.is(tqb.build(), 'SELECT COUNT(`user_id`) AS "value", `indexed_value_0` AS "category" FROM (SELECT `indexed_value_0`, `user_id` FROM (SELECT DATE_FORMAT(`timestamp`, "%Y-%m-%d") AS "indexed_value_0", user_id FROM payment_logs WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-07 23:59:59")) `matching_table` GROUP BY `indexed_value_0`, `user_id`) `indexing_table` GROUP BY `indexed_value_0`');
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
    method: 'eachWeeks'
  });

  t.is(tqb.build(), 'SELECT AVG(`price`) AS "value", YEARWEEK(`indexed_value_0`,3) AS "category" FROM (SELECT timestamp AS "indexed_value_0", price FROM payment_logs WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-07 23:59:59")) `indexing_table` GROUP BY YEARWEEK(`indexed_value_0`,3)');
});

test('Average price for each day with sqlite', t => {
  const tqb = new TabulationQueryBuilder({ db: 'sqlite' });

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

  t.is(tqb.build(), 'SELECT AVG(`price`) AS "value", strftime("%Y-%m-%d", `indexed_value_0`) AS "category" FROM (SELECT timestamp AS "indexed_value_0", price FROM payment_logs WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-07 23:59:59")) `indexing_table` GROUP BY strftime("%Y-%m-%d", `indexed_value_0`)');
});

test('Aggregating field is segment field and Counting user by days', t => {
  const tqb = new TabulationQueryBuilder({ segment: 'user_id' });

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

  t.is(tqb.build(), 'SELECT COUNT(`user_id`) AS "value", `indexed_value_0` AS "category", GROUP_CONCAT(DISTINCT `segment_ids`) AS "segment_ids" FROM (SELECT `indexed_value_0`, `user_id` AS "segment_ids", `user_id` FROM (SELECT DATE_FORMAT(`timestamp`, "%Y-%m-%d") AS "indexed_value_0", user_id FROM payment_logs WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-07 23:59:59")) `matching_table` GROUP BY `indexed_value_0`, `user_id`) `indexing_table` GROUP BY `indexed_value_0`');
});

test('Indexing field is segment field and Total price by user_id', t => {
  const tqb = new TabulationQueryBuilder({ segment: 'user_id' });

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
    field: 'user_id'
  });

  t.is(tqb.build(), 'SELECT SUM(`price`) AS "value", `indexed_value_0` AS "category", GROUP_CONCAT(DISTINCT `user_id`) AS "segment_ids" FROM (SELECT user_id AS "indexed_value_0", price, user_id FROM payment_logs WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-07 23:59:59")) `indexing_table` GROUP BY `indexed_value_0`');
});

test('Segment field is not aggregating and indexing fields, and Counting item by days', t => {
  const tqb = new TabulationQueryBuilder({ segment: 'user_id' });

  tqb.setTable('payment_logs');

  tqb.setMatching({
    field: 'timestamp',
    range: [ '2017-01-01 00:00:00', '2017-01-07 23:59:59' ]
  });

  tqb.setAggregating({
    field: 'item',
    method: 'count'
  });

  tqb.setIndexing({
    field: 'timestamp',
    method: 'eachDays'
  });

  t.is(tqb.build(), 'SELECT COUNT(`item`) AS "value", `indexed_value_0` AS "category", GROUP_CONCAT(DISTINCT `segment_ids`) AS "segment_ids" FROM (SELECT `indexed_value_0`, GROUP_CONCAT(`user_id`) AS "segment_ids", `item` FROM (SELECT DATE_FORMAT(`timestamp`, "%Y-%m-%d") AS "indexed_value_0", item, user_id FROM payment_logs WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-07 23:59:59")) `matching_table` GROUP BY `indexed_value_0`, `item`) `indexing_table` GROUP BY `indexed_value_0`');
});

test('Segment field is not aggregating and indexing fields, and Counting item by time of hour', t => {
  const tqb = new TabulationQueryBuilder({ segment: 'user_id' });

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
    method: 'eachTimeOfHour'
  });

  t.is(tqb.build(), 'SELECT AVG(`price`) AS "value", DATE_FORMAT(`indexed_value_0`, "%H") AS "category", GROUP_CONCAT(DISTINCT `user_id`) AS "segment_ids" FROM (SELECT timestamp AS "indexed_value_0", price, user_id FROM payment_logs WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-07 23:59:59")) `indexing_table` GROUP BY DATE_FORMAT(`indexed_value_0`, "%H")');
});

test('Json item grouping', t => {
  const tqb = new TabulationQueryBuilder();

  tqb.setTable('actions');

  tqb.setMatching({
    field: 'timestamp',
    range: [ '2017-01-01 00:00:00', '2017-01-07 23:59:59' ]
  });

  tqb.setAggregating({
    field: 'user_id',
    method: 'count'
  });

  tqb.setIndexing({
    field: 'detail->"$.view"'
  });

  t.is(tqb.build(), 'SELECT COUNT(`user_id`) AS "value", `indexed_value_0` AS "category" FROM (SELECT `indexed_value_0`, `user_id` FROM (SELECT detail->"$.view" AS "indexed_value_0", user_id FROM actions WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-07 23:59:59")) `matching_table` GROUP BY `indexed_value_0`, `user_id`) `indexing_table` GROUP BY `indexed_value_0`');
});

test('Unique User by day and hours', t => {
  const tqb = new TabulationQueryBuilder();

  tqb.setTable('actions');

  tqb.setMatching({
    field: 'timestamp',
    range: [ '2017-01-01 00:00:00', '2017-01-07 23:59:59' ]
  });

  tqb.setAggregating({
    field: 'user_id',
    method: 'count'
  });

  tqb.setIndexings([
    {
      field: 'timestamp',
      method: 'eachTimeOfHour'
    },
    {
      field: 'timestamp',
      method: 'eachDays'
    },
  ]);

  t.is(tqb.build(), 'SELECT COUNT(`user_id`) AS "value", `indexed_value_0` AS "category_0", `indexed_value_1` AS "category_1" FROM (SELECT `indexed_value_0`, `indexed_value_1`, `user_id` FROM (SELECT DATE_FORMAT(`timestamp`, "%H") AS "indexed_value_0", DATE_FORMAT(`timestamp`, "%Y-%m-%d") AS "indexed_value_1", user_id FROM actions WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-07 23:59:59")) `matching_table` GROUP BY `indexed_value_0`, `indexed_value_1`, `user_id`) `indexing_table` GROUP BY `indexed_value_0`, `indexed_value_1`');
});
