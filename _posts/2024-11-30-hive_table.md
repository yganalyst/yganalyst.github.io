---
title: "[Hive] Hive Table 다루기 (DESCRIBE, CREATE, LOAD, INSERT, DROP, VIEW, CTAS)"
excerpt: "HIVE Table을 다루기 위한 다양한 HiveQL 코드 작성법에 대해 알아보자"
toc: true
toc_sticky: true
header:
  teaser: /assets/images/hadoop/hive_impala_logo.png

categories:
  - hadoop

tags:
  - hadoop
  - hdfs
  - hive
  - impala
  - create
  - table
  - database
  - drop
  - alter
  - partition
  - describe
  - show
  - formatted
  - load
  - inpath
  - insert
  - view
  - managed
  - external

use_math: true

last_modified_at: 2024-11-30T20:00-20:30
---

![png](/assets/images/hadoop/hive_impala_logo.png){: .align-center}{: width="80%" height="80%"}  

<br/>  

# 개요  

## Hive Table과 DataBase  

- Hive Table은 단일 directory에 맵핑되는 구조이며, 해당 directory에 여러 파일들이 포함될 수 있음  
    - 하위 directory는 허용되지 않음 (**Partition Table은 예외**)
- Meta Store는 이런 filesystem 구조를 Table 형식으로 맵핑하도록 도와줌
- 각 Table들은 DataBase에 속함  

1. Database List 확인
    
    ```sql
    SHOW DATABASES;
    ```
    
2. 특정 Database의 Metadata 확인
    
    ```sql
    DESCRIBE DATABASE yganalyst_db;
    ```
    
3. 특정 Table의 자세한 Metadata 확인 (`DESCRIBE FORMATTED`)  
    
    ```sql
    DESCRIBE FORMATTED order_details;
    ```
    

## Data Type

- 기본 Data Type 형태
    
    ![png](/assets/images/hadoop/hive_table/1.png)
    
    ![png](/assets/images/hadoop/hive_table/2.png)
    
    ![png](/assets/images/hadoop/hive_table/3.png)
    
- Data Type의 범위를 넘어선 값을 Casting 할때 (`+1.5` 연산 예시)
    
    ![png](/assets/images/hadoop/hive_table/4.png)
    
    - **Hive**: range를 넘어가면 NULL 값으로 저장
    - **Impala**: range를 넘어가면 “범위 내 최소/최대 값”으로 저장    

<br/>  

# Data Management

- HIVE의 Metastore와 RDB의 차이
    - RDB는 Table 자체에 정보가 들어가지만, Hive는 Meta data로 참조만 하는 것임

## Create Database

```sql
CREATE DATABASE yg_test;
```

- 아래 두 경로에 `.db` 폴더로 managed, external 두개가 생성됨
    
    ⇒ `s3a:// ~ /warehouse/tablespace/managed/hive/yg_test.db/` 
    
    ⇒ `s3a:// ~ /warehouse/tablespace/external/hive/yg_test.db/`
    
- 이렇게 하면 `yg_test`를 Database로 인식하고, 내부의 sub 폴더를 `tablename`으로 인식하며, 그 안에 실제 Data가 들어있어야 함
- 그리고 Location은 `/external/`을 자동으로 가리키고 있음  
    - `DESCRIBE DATABASE`을 통해 확인 가능

## Creating a Table

```sql
CREATE TABLE dbname.tablename (
    colname DATATYPE,
    …
) STORED AS
{TEXTFILE|SEQUENCEFILE|…};
```

- dbname을 지정하지 않을 경우
    - **Default** database: `s3a:// ~ /warehouse/tablespace/managed/hive/tablename`
- dbname을 지정할 경우
    - **Named** database: `s3a:// ~ /warehouse/tablespace/managed/hive/dbname.db/tablename`
    
    ***Default는 Managed table이기 때문에 managed 경로에만 생성되는 것임**
    
- Default Option
    
    (Manged Table)
    
    - Hive: STORED AS `ORC`
    - Impala: STORED AS `PARQUET`
    
    (External Table)
    
    - Hive: STORED AS `TEXTFILE`
    - Impala: STORED AS `PARQUET`

## Creating a Table (Options)  
    
```sql
CREATE EXTERNAL TABLE jobs (
    id INT,
    title STRING,
    salary INT,
    posted TIMESTAMP
)
ROW FORMAT DELIMITED
    FIELDS TERMINATED BY ','
    LINES TERMINATED BY '\n' 
STORED AS TEXTFILE
LOCATION 'analyst/dualcore/ad_data';
```

- ROW FORMAT DELIMTED: `TXTFILE` 구분자 지정
    - FIELDS TERMINATED BY: Column을 구분하는 기준
    - LINES TERMINATED: Row를 구분하는 기준
- LOCATION: `warehouse_dir` - external table이 바라볼 HDFS 경로 지정
- TBLPROPERTIES (Table Properties)
    - **HIVE에서 CRUD가 가능한 ACID table을 만들려면?**
        - Manged Table 이어야 함
        - `'transactional'='true'`
        - `'transactional_properties'='insert_only'`
        - `STORED AS ORC` : ORC 이어야 함
    - `'external.table.purge'='true'` : External Table을 drop시 참조 data도 함께 지우도록 설정

*기존 테이블로부터 새로운 테이블 만들기
    
```sql
CREATE TABLE jobs_archived LIKE jobs;
```

- Data는 가져오지 않고 Metastore의 스키마 정보만 가져옴  

## Load Data  

- HDFS의 데이터를 HIVE TABLE로 업로드

    ```sql
    LOAD DATA INPATH 'hdfs://hdpns1/tmp/hive/file.txt' INTO TABLE yg_db.tbl1
    ```
- LOCAL의 데이터를 HIVE TABLE로 업로드
    ```sql
    LOAD DATA LOCAL INPATH './file.txt' INTO TABLE yg_db.tbl
    ```

- 기존 테이블을 추가 업로드  

    ```sql
    INSERT INTO <table_name>
    PARTITION (pad_date)
    SELECT
            CRYM,
            BJD_CD,
            CRYM
    FROM temp1
    ```    

    - 빅데이터에서는 데이터가 너무 크니까 `INSERT` 문이 잘 맞지는 않음
    - `SELECT` 문의 **마지막 컬럼을 기준**으로 Partition을 구분함, 그래서 마지막에 partition으로 쓸 컬럼을 넣어줘야함  
      (기존 테이블의 Partition에 맞게 데이터를 insert하고 싶을때) 


## Drop Table
    
```sql
DROP TABLE yg_test;
```

- **테이블을 삭제할 경우**

    **(Managed)**
    
    - Metadata 삭제
    - HDFS data 삭제
    - rollback이나 undo 없음!!
    
    **(External)**
    
    - Metadata 삭제
    - HDFS data는 삭제되지 않음
        - `’external.table.purge’=’true` 옵션을 줬을 경우 삭제됨

## Alter Table

```sql
ALTER TABLE yg_db.tbl1 SET TBLPROPERTIES('EXTERNAL'='FALSE')
```

```sql
ALTER TABLE yg_db.tbl1 DROP PARTITION (pat_date<='202410') 
```

- `ALTER TABLE`로 여러가지 변경 명령을 내릴 수 있음
- `ALTER TABLE`을 하는 대상이 Column Type 등 데이터 속성과 관련된 경우, **실제 데이터는 바뀌지 않는 다는 사실을 주의**
    - 그냥 다시 데이터를 적재하는게 나음

## View Table
   
```sql
CREATE VIEW order_info AS
    SELECT o.order_id, order_date, p.prod_id, brand, name 
    FROM orders o
    JOIN order_details d 
        ON (o.order_id = d.order_id) 
    JOIN products p
        ON (d.prod_id = p.prod_id)
```

- **View Table은 언제??** 
    - 일부 데이터만 보여주고 싶은 경우  
    - 여러 데이터를 조인해서 보여주고 싶은 경우 등  
- Materialized View → **Hive만 가능!!! (Impala는 불가능)**
    - 원래 View는 매번 쿼리가 실행되는 구조임 (데이터를 저장하지 않음)
    - 매번 query를 실행하지 않고 Data Storage에 저장해 놓을 수 있음  

## CREATE TABLE AS (CTAS)

```sql
CREATE EXTERNAL TABLE ny_customers
ROW FORMAT DELIMITED FIELDS TERMINATED BY '\t' 
STORED AS TEXTFILE
LOCATION '/analyst/dualcore/ny_customers'
AS
SELECT cust_id, fname, lname FROM
customers
WHERE state = 'NY';
```
- 기존 데이터를 조회(`SELECT`)해서 경로(`LOCATION`)에 저장하고 Table을 생성(`CREATE EXTERNAL TABLE`)  
- 많이 사용하는 방식      

<br/>  

# Reference

