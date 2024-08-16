---
title: "[Impala] Metadata Cache Invalidation"
excerpt: "Impala에서 Hive Metadata의 변동사항을 동기화하는 방법"
toc: true
toc_sticky: true
header:
  teaser: /assets/images/hadoop/impala_logo.jpg

categories:
  - hadoop

tags:
  - hadoop
  - ecosystem
  - HDFS
  - impala
  - hive
  - metadata
  - metastore
  - invalidate
  - refresh
  - catalog
  - cache

use_math: true

last_modified_at: 2024-03-17T20:00-20:30
---

# Impala Cache Invalidation

![jpg](/assets/images/hadoop/impala_logo.jpg){: .align-center}{: width="80%" height="80%"}  

[이전 포스팅](https://yganalyst.github.io/hadoop/hdp_ecosys/#impala)에서도 정리했던 적이 있지만, Hive와 Impala는 동일한 MetaStore를 공유하고 있다.  

그러나 Impala는 성능 관리를 위해 **Hive Metastore를 직접 참조하는게 아니라, Catalog Store로 부터 캐싱(Caching)하고 있는 상태에서 impala엔진을 실행**한다.  
그렇기 때문에 Metastore가 변경되는 것이 바로 업데이트 되지 않을 수 있다.
아래의 경우들이 대표적이다.  

1. Hive에서 Table을 새로 생성한 경우(`CREATE TABLE`)  
    - `Sqoop`에서 ETL한 경우도 마찬가지  
2. Table은 이미 존재하지만 새로운 Data File을 HDFS에 추가한 경우  


## invalidate metadata    

**1번 Hive에서 Table을 새로 생성한 경우(`CREATE TABLE`)**는 **테이블의 구조**에 변동사항이 생긴 경우로 아래와 같이 사용한다.  

`invalidate metadata`

```shell
# impala-shell
invalidate metadata <database_name>.<table_name>;
```

## refresh    

**2번 기존 Table에 새로운 Data File을 HDFS에 추가한 경우**는 **테이블의 데이터**에 변동사항이 생긴 경우로 아래와 같이 사용한다.  

```shell
# impala-shell
refresh <database_name>.<table_name>;
```





