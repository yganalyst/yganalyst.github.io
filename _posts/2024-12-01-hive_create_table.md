---
title: "[Hive] Hive CREATE TABLE 다양한 옵션 정리"
excerpt: "HIVE Table을 생성하기 위한 CREATE TABLE 구문에서 사용할 수 있는 다양한 옵션들에 대해 알아보자."
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
  - managed
  - external
  - comment
  - partitioned by
  - clustered by
  - row format
  - delimited
  - FIELDS TERMINATED
  - LINES TERMINATED
  - LOCATION
  - TBLPROPERTIES

use_math: true

last_modified_at: 2024-12-01T20:00-20:30
---

![png](/assets/images/hadoop/hive_impala_logo.png){: .align-center}{: width="80%" height="80%"}  

<br/>  

# HiveQL - CREATE TABLE 

## 기본 쿼리

```sql
CREATE [EXTERNAL] TABLE [IF NOT EXISTS] table_name (
    column1 data_type [COMMENT 'description'],
    column2 data_type [COMMENT 'description'],
    ...
)
[COMMENT 'table_description']
[PARTITIONED BY (columnX data_type, columnY data_type, ...)]
[CLUSTERED BY (columnZ) INTO num_buckets BUCKETS]
[ROW FORMAT DELIMITED
    FIELDS TERMINATED BY 'delimiter'
    LINES TERMINATED BY 'delimiter']
[STORED AS file_format]
[LOCATION 'hdfs_path']
[TBLPROPERTIES ('property_name'='property_value', ...)];
```


|옵션|설명|Default Value|
|:---:|:---|:---|
|`EXTERNAL`|외부 테이블 여부|내부 테이블 `Managed`|
|`IF NOT EXISTS`|동일한 테이블이 존재할 경우 오류 방지|중복 테이블 생성 시 오류 발생|
|`PARTITIONED BY`|특정 컬럼을 기준으로 데이터 저장 경로를 나눔|파티션 사용 X|
|`CLUSTERED BY`|특정 컬럼을 기준으로 데이터를 버킷에 저장하여 성능 최적화|사용 X|
|`ROW FORMAT`|행 저장 방식 지정|`ROW FORMAT DELIMITED`|
|`FIELDS TERMINATED BY`|컬럼 간 구분자|`','`, `'\t'`|  
|`LINES TERMINATED BY`|행 간 구분자|`'\n'`, `'\r\n'`, `'\r'`|
|`STORED AS`|파일 저장 형식 지정|`TEXTFILE`|
|`LOCATION`|데이터 저장 경로 (`EXTERNAL`시 필수)|HDFS 경로 (예: /user/hive/warehouse|
|`TBLPROPERTIES`|테이블 속성 설정| |

## STORED AS (파일 저장형식)  

- 데이터 저장 방식(파일 포맷)을 지정하는 옵션  

|옵션|설명|
|:---:|:---|
|`TEXTFILE`|일반 텍스트 파일 (Default)|
|`SEQUENCEFILE`|Hadoop SequenceFile 포맷 (압축 지원)|
|`ORC`|최적화된 컬럼 저장 포맷, 성능 및 압축 효율 높음|
|`PARQUET`|컬럼 기반 저장 포맷, 분석 및 쿼리 성능 우수|
|`AVRO`|JSON과 유사한 바이너리 저장 포맷, 스키마 지원|
|`RCFILE`|행 그룹을 컬럼 단위로 저장하는 포맷 (Hive 최적화)|


## ROW FORMAT (행 저장형식)

- 데이터 직렬화 및 역직렬화(SerDe)를 지정하는 옵션

|옵션|설명|
|:---|:---|
|`DELIMITED`|기본 구분자 기반 저장 (텍스트 데이터에 사용)|
|`SERDE 'org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe'`|기본 SerDe, 단순한 텍스트 데이터 처리|
|`SERDE 'org.apache.hadoop.hive.serde2.OpenCSVSerde'`|CSV 데이터 처리를 위한 SerDe|
|`SERDE 'org.apache.hadoop.hive.ql.io.orc.OrcSerde'`|ORC 파일 전용 SerDe|

	
## TBLPROPERTIES (테이블 속성)

- 테이블의 추가 속성을 지정하는 옵션  

|옵션|설명|
|:---|:---|
|`'transactional'='true'`|ACID 트랜잭션 활성화 (UPDATE/DELETE 지원)|
|`'parquet.compression'='SNAPPY'`|Parquet 파일의 압축 코덱을 Snappy로 지정|
|`'orc.compress'='ZLIB'`|ORC 파일의 압축 코덱을 ZLIB으로 설정|
|`'skip.header.line.count'='1'`|O첫 번째 줄을 헤더로 처리하여 무시|
|`'serialization.null.format'=''`|NULL 값을 특정 문자열로 변환 (예: `''`, `'NULL'`,`'null'`, `'\N'`)| 


**참고사항**
- Sqoop으로 Oracle 데이터를 Copy할 때, 결측값이 `null`로 들어온다.
- Hive Table 생성 시 해당 값을 결측치로 인식하도록 `'serialization.null.format'='null'` 설정이 필요하다.  


	
	
	
	
	

<br/>  

# Reference
