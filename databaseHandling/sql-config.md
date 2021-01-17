## Creating Database

> CREATE DATABSE emailer;

## Switch to Database

> \c emailer

## Create 'users' table.

```sql
CREATE TABLE users(
user_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
userName VARCHAR (20) UNIQUE NOT NULL,
loginPassword VARCHAR (15) NOT NULL,
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
