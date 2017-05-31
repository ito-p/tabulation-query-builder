import test from 'ava';

import IndexingConfig from './IndexingConfig';

test('Sum with Number', t => {
  const config = new IndexingConfig({
    field: 'price',
    method: 'sum'
  });

  t.is(
    IndexingConfig.build('payment_logs', { field: 'user_id' }, [ config ]).toString(),
    'SELECT SUM(`indexed_value_0`) AS "indexed_value_0", `user_id` FROM payment_logs `matching_table` GROUP BY `user_id`'
  );
});
