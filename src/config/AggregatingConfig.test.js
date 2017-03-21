import test from 'ava';

import AggregatingConfig from './AggregatingConfig';

test('Aggregate user count by indexed_value', t => {
  const config = new AggregatingConfig({
    field: 'user_id',
    method: 'count'
  });

  t.is(
    config.build('table', 'indexed_value').toString(),
    'SELECT COUNT(`user_id`) AS "value", `indexed_value` AS "category" FROM table `indexing_table` GROUP BY `indexed_value`'
  );
});

test('Aggregate user count by 300 interval', t => {
  const config = new AggregatingConfig({
    field: 'user_id',
    method: 'count',
    interval: 300
  });

  t.is(
    config.build('table', 'indexed_value').toString(),
    'SELECT COUNT(`user_id`) AS "value", FLOOR(`indexed_value` / 300) AS "category" FROM table `indexing_table` GROUP BY FLOOR(`indexed_value` / 300)'
  );
});

test('Aggregate user count by 0-99, 100-199, 200-299, 300-399', t => {
  const config = new AggregatingConfig({
    field: 'user_id',
    method: 'count',
    categoryRange: [ 0, 100, 200, 300 ]
  });

  t.is(
    config.build('table', 'indexed_value').toString(),
    'SELECT COUNT(`user_id`) AS "value", CASE WHEN (200 <= `indexed_value` AND `indexed_value` < 300) THEN 200 WHEN (100 <= `indexed_value` AND `indexed_value` < 200) THEN 100 WHEN (0 <= `indexed_value` AND `indexed_value` < 100) THEN 0 ELSE NULL END AS "category" FROM table `indexing_table` GROUP BY CASE WHEN (200 <= `indexed_value` AND `indexed_value` < 300) THEN 200 WHEN (100 <= `indexed_value` AND `indexed_value` < 200) THEN 100 WHEN (0 <= `indexed_value` AND `indexed_value` < 100) THEN 0 ELSE NULL END'
  );
});
