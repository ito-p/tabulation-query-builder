import test from 'ava';

import IndexingConfig from './IndexingConfig';

test('Sum with Number', t => {
  const config = new IndexingConfig({
    field: 'price',
    method: 'sum'
  });

  t.is(
    config.build('payment_logs', 'user_id').toString(),
    'SELECT SUM(price) AS "indexed_value", user_id FROM payment_logs `matching_table` GROUP BY user_id'
  );
});
