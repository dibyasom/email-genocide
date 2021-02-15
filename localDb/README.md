# EMAILER database configuration!

## Docker image for local dev, use..

```bash
docker run --name my-postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d --rm postgres:13.0

docker exec -it -u postgres my-postgres psql
```

## Create a Database

> CREATE DATABSE emailer;

## Switch to Database

> \c emailer

## Create 'users' table.

```sql
CREATE TABLE users(
user_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
userName VARCHAR (20) UNIQUE NOT NULL,
loginPassword VARCHAR (60) NOT NULL,
fullName VARCHAR (20) NOT NULL,
phoneNo VARCHAR (10) UNIQUE NOT NULL,
userType BOOLEAN NOT NULL
);
```

## Create 'emailStored' table.

```sql
CREATE TABLE emailStored(
email_id VARCHAR (50) PRIMARY KEY,
user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
credentialFile VARCHAR (10) NOT NULL,
tokenFile VARCHAR (10) NOT NULL
);
```

## Create 'emailInfo' table.

```sql
CREATE TABLE emailInfo (
    emailNo INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email_id varchar(50) REFERENCES emailStored(email_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id),
    timeSent TIMESTAMP NOT NULL,
    emailToFile varchar(10),
    contentFile varchar(10),
    emailStatus BOOLEAN
);
```

## Create 'approval' table.

```sql
CREATE TABLE approval(
    approvalNo INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    emailId VARCHAR (50) REFERENCES emailStored(email_id) ON DELETE CASCADE,
    approvedBy INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    approvedTo INTEGER REFERENCES users(user_id) ON DELETE CASCADE
);
```

## Insert Data into `users`

```sql
INSERT INTO users (username, loginpassword, fullname, phoneno, usertype)
VALUES
('Necromacer_', '1234', 'Dibyasom Puhan', '9668766409', true),
('Kylo-Ren', '1234', 'Nakul Chawla', '989654995', true),
('Baby-yoda', '1234', 'Dev Das', '8287453976', false);
```

## Insert Data into `emailStored`

```sql
insert into emailstored(email_id, user_id, credentialFile, tokenFile)
values
('dibya.secret@gmail.com', 1, 'creds.json', 'tok.json'),
('nakul.chawla1352@gmail.com', 2, 'cred1.json', 'tok1.json'),
('dev.bawla@gmail.com', 3, 'cred2.json', 'tok.json');
```

## Insert Data into `emailStored`

```sql
insert into emailinfo(email_id, user_id, timesent, emailtofile, contentfile, emailstatus) values
('dibya.secret@gmail.com', 1, NOW(), 'list.excel', 'body.txt', true),
('dibya.secret@gmail.com', 1, NOW(), 'list.excel', 'body.txt', false),
('nakul.chawla1352@gmail.com', 2, NOW(), 'list.excel', 'body.txt', true),
('nakul.chawla1352@gmail.com', 2, NOW(), 'list.excel', 'body.txt', false),
('dev.bawla@gmail.com', 3, NOW(), 'list.excel', 'body.txt', true),
('dev.bawla@gmail.com', 3, NOW(), 'list.excel', 'body.txt', false),
('dibya.secret@gmail.com', 1, NOW(), 'list.excel', 'body.txt', true),
('dibya.secret@gmail.com', 1, NOW(), 'list.excel', 'body.txt', false);
```
