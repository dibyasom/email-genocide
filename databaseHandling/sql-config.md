/_Users Table_/

## Creating Database

> CREATE DATABSE emailer;

## Switch to Database

> \c emailer

## Create 'users' table.

```sql
CREATE TABLE users(
user_id INTEGER GENERATED ALWAYS AS IDENTITY,
username VARCHAR (20) UNIQUE NOT NULL,
password VARCHAR (15) NOT NULL,
name VARCHAR (20) NOT NULL,
phone_no VARCHAR (10) UNIQUE NOT NULL
);
```
