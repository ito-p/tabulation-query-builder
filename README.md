> Easy tabulation with generated SQL.

# Introduction

When I come up with a hypothesis, I want to confirm it soon.
And based on that, if you come up with the next hypothesis, I'd like to confirm it soon too.
I think that what is important is the speed of this cycle.
Responsive analytical methods lead to efficient learning on your marketing.

# How to know your service?

In order to know the user, I think that it is necessary to analyze the user's behavior history.
At that time, you will prepare two axes and analyze user's behavior from different indicaters.
Due to this operation called Tabulation, we used Excel, introduced BI tools, or wrote SQL every time.
Since I was troublesome to do whichever, I created a module that generates SQL from several input items.

# Usage

Generate SQL for analyzing with some inputs.

## User count by total payment within term.

```es6
const tqb = new TabulationQueryBuilder();

tqb.setTable('payment_logs');

/**
*
* Matching
*   We narrow down the logs matching the conditions
*   by specifying the period and user ID.
*
*   e.g) Term range
*
*/

tqb.setMatching({
  field: 'timestamp',
  range: ['2017-01-01 00:00:00', '2017-01-03 23:59:59']
});

/**
*
* Indexing
*   Specify what kind of index you want to summarize data.
*
*   e.g) User count
*
*/

tqb.setIndexing({
  field: 'user_id',
  method: 'count'
});

/**
*
* Aggregating
*   Specify the item you want to classify the indexed group.
*
*   e.g) Group by total payment amount
*
*/

tqb.setAggregating({
  field: 'price',
  method: 'sum'
});

const query = tqb.build();
```
## Generated SQL

```sql
SELECT COUNT(user_id) AS "value", FLOOR(indexed_value / 300) AS "category" FROM (SELECT SUM(price) AS "indexed_value", user_id FROM (SELECT price, user_id FROM payment_logs WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-03 23:59:59")) `matching_table` GROUP BY user_id) `indexing_table` GROUP BY FLOOR(indexed_value / 300);
```

## Query result

```mysql
mysql> select * from payment_logs;
+----+---------+-------+---------------------+
| id | user_id | price | timestamp           |
+----+---------+-------+---------------------+
|  1 |       1 |   100 | 2017-01-01 12:00:00 |
|  2 |       2 |   200 | 2017-01-01 12:00:00 |
|  3 |       1 |   300 | 2017-01-02 12:00:00 |
|  4 |       4 |    10 | 2017-01-02 15:00:00 |
|  5 |       4 |    50 | 2017-01-02 16:00:00 |
|  6 |       4 |   100 | 2017-01-03 18:00:00 |
|  7 |       5 |  1000 | 2017-01-04 19:00:00 |
|  8 |       1 |   500 | 2017-01-04 10:00:00 |
|  9 |       1 |   600 | 2017-01-05 11:00:00 |
| 10 |       3 |   800 | 2017-01-06 12:00:00 |
| 11 |       1 |   100 | 2017-01-06 13:00:00 |
+----+---------+-------+---------------------+
11 rows in set (0.06 sec)

mysql> SELECT COUNT(user_id) AS "value", FLOOR(indexed_value / 300) AS "category" FROM (SELECT SUM(price) AS "indexed_value", user_id FROM (SELECT price, user_id FROM payment_logs WHERE ("2017-01-01 00:00:00" <= timestamp AND timestamp <= "2017-01-03 23:59:59")) `matching_table` GROUP BY user_id) `indexing_table` GROUP BY FLOOR(indexed_value / 300);
+-------+----------+
| value | category |
+-------+----------+
|     2 |        0 |
|     1 |        1 |
+-------+----------+
2 rows in set (0.01 sec)
```

## In this case

- There are two users in range of 0-299 payment group.
- There is one user in range of 300- payment group.
