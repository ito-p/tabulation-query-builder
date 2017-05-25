import test from 'ava';

import MatchingConfig from './MatchingConfig';

test('Date range expression', t => {
  const config = new MatchingConfig({
    field: 'timestamp',
    range: [ '2017-01-01 00:00:00', '2017-01-03 23:59:59' ]
  });

  t.is(
    config.build('payment_logs', 'user_id', 'price').toString(),
    'SELECT user_id, price FROM payment_logs WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-03 23:59:59")'
  );
});

test('Date range or expression', t => {
  const config = new MatchingConfig({
    or: [
      {
        field: 'timestamp',
        range: [ '2017-01-01 00:00:00', '2017-01-01 23:59:59' ]
      },{
        field: 'timestamp',
        range: [ '2017-01-03 00:00:00', '2017-01-03 23:59:59' ]
      }
    ]
  });

  t.is(
    config.build('payment_logs', 'user_id', 'price').toString(),
    'SELECT user_id, price FROM payment_logs WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-01 23:59:59" OR "2017-01-03 00:00:00" <= timestamp AND timestamp <= "2017-01-03 23:59:59")'
  );
});

test('String in expression', t => {
  const config = new MatchingConfig({
    and: [
      {
        field: 'user_id',
        in: [ 1, 2, 3 ]
      },
      {
        or: [
          {
            field: 'timestamp',
            range: [ '2017-01-01 00:00:00', '2017-01-01 23:59:59' ]
          },{
            field: 'timestamp',
            range: [ '2017-01-03 00:00:00', '2017-01-03 23:59:59' ]
          }
        ]
      }
    ]
  });

  t.is(
    config.build('payment_logs', 'user_id', 'price').toString(),
    'SELECT user_id, price FROM payment_logs WHERE (user_id IN ("1","2","3") AND ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-01 23:59:59" OR "2017-01-03 00:00:00" <= timestamp AND timestamp <= "2017-01-03 23:59:59"))'
  );
});

test('operator and value in expression', t => {
  const config = new MatchingConfig({
    and: [
      {
        field: 'user_id',
        in: [ 1, 2, 3 ]
      },
      {
        and: [
          {
            field: 'timestamp',
            operator: '>=',
            value: '2017-01-01 00:00:00'
          },{
            field: 'timestamp',
            operator: '<',
            value: '2017-01-03 23:59:59'
          }
        ]
      }
    ]
  });

  t.is(
    config.build('payment_logs', 'user_id', 'price').toString(),
    'SELECT user_id, price FROM payment_logs WHERE (user_id IN ("1","2","3") AND (timestamp >= "2017-01-01 00:00:00" AND timestamp < "2017-01-03 23:59:59"))'
  );
});
