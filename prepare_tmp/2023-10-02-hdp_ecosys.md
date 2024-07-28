---
title: "[Bigdata] 하둡 에코시스템(Hadoop Ecosystem)에 대한 이해"
excerpt: "빅데이터 활용을 위한 시스템 및 플랫폼인 Hadoop에 대해 전반적으로 알아보자"
toc: true
toc_sticky: true
header:
  teaser: /assets/images/hadoop/ecosys/hdp_logo.png

categories:
  - hdp

tags:
  - hadoop
  - ecosystem

use_math: true

last_modified_at: 2023-10-02T20:00-20:30
---

# 개요

![png](/assets/images/hadoop/ecosys/hdp_logo.png){: .align-center}{: width="100%" height="100%"}  
출처: https://1004jonghee.tistory.com/

이번 포스팅에서는 [Hadoop](https://hadoop.apache.org/)이란 무엇인지, 이를 둘러싼 Ecosystem에 포함되는 서브프로젝트들이 어떤 배경에서 만들어졌고 어디에 쓰이게 되는지 전반적으로 정리해보려고 한다. 이후 포스팅들에서는 각 서브 프로젝트에 대해 세부 내용을 정리하는 시간이 있을 것 같다.

<br/>

# BigData

![png](/assets/images/hadoop/ecosys/hdp_2.png){: .align-center}{: width="50%" height="50%"}  
출처: 도서-빅데이터를 지탱하는 기술

먼저 Hadoop이 왜 필요해졌을까? 벌써 20년도 전이긴 하지만 모바일 및 인터넷의 보급으로 전세계적으로 접근 가능한 시스템이 증가함에 따라, 기존 RDB로는 취급할 수 없는 수준으로 대량의 데이터가 쌓이게 된다.

기업들은 꽤 많은 문제에 봉착하게 되는데.  

1. 기존 RDB Storage 자체가 빅데이터에 비해 작음
2. 통합 시스템(Centralized)이기 때문에 확장이 어려움
3. RDB에 적합하지 않은 비정형 데이터(이미지, 영상, 텍스트 등)들의 증가
4. 빅데이터의 생산 가속도가 월등히 높기 때문에 위 1~3에 대한 대응이 지속가능하지 않음

이를 위해 하나의 통합 시스템의 사양을 계속 업그레이드하기 보다는 **여러 대의 컴퓨터에게 작업을 분산시켜(Distributed Prallel Processing) 효율성을 높이고자**하는 필요성이 대두되었고, 이게 하둡(Hadoop)의 간단한 개발 배경이 된다고 할 수 있다.  

분산 병렬 처리(Distributed Prallel Processing) 기술이란? 다음의 특징을 가진다.  

- `Distributed` : 실행 주체가 분산되어 있다.  
  - Hadoop 소프트웨어를 실행하는 각 서버들을 Cluster라고 부른다.
- `Scale-Out`: 확장이 가능하다.
- `Fault-tolerant`: 결함(fault), 고장(failure)이 발생해도 정상/부분적으로 기능을 수행할 수 있다.  
- `여러 데이터 형태의 처리`가 가능해야 하다.  

## 스몰데이터와 빅데이터

![png](/assets/images/hadoop/ecosys/hdp_3.png){: .align-center}{: width="50%" height="50%"}  
출처: 도서-빅데이터를 지탱하는 기술

그럼 빅데이터 시스템인 Hadoop이 언제나 좋은 것일까?  
**꼭 그런 것은 아니다.**

분산 처리 기술 없이 개인 노트북이나 서버에서 처리할 수 있는 GB 수준의 데이터를 스몰데이터라고 할 때, 위 그림처럼 스몰 데이터에서 빅데이터 기술의 효율은 오히려 떨어진다.  

간단하게는 **분산 처리 기술에서 최소한의 실행 준비 시간이 필요**(ex. 대표기술인 MapReduce 실행을 위해 태스크 스케쥴을 잡고 데이터를 우선 blcok 단위로 나누는 등)하기 때문에, 일정 규모 이상의 빅데이터에서 부터 효율이 발생한다.  

그러므로 우리는 필요한 상황에 필요한 기술을 인지하고 적재적소에 활용할 필요가 있다.  

<br/>

# Hadoop  

먼저 **하둡(Hadoop)**은 위에서 살펴본 바와 같이 여러 대의 컴퓨터에게 작업을 분산시켜 처리 효율성을 높이고자 하는 목적에서 개발된 **분산 처리 오픈소스 프레임워크**이다.  
초기 Hadoop은 아래 2가지 코어 프로젝트로 구성되어 있었다.  

1. **HDFS(Hadoop Distributed File System)**
    - 데이터를 분산 저장하는 역할(e.g. Data Storage)  
2. **MapReduce**  
    - 분산 저장된 데이터를 처리하는 역할(e.g. Execution Engine)  

## HDFS  

![png](/assets/images/hadoop/ecosys/hdp_4.png){: .align-center}{: width="80%" height="80%"}  
출처: https://phoenixnap.com/kb/apache-hadoop-architecture-explained  

HDFS는 위 그림처럼 FIle System의 **Metadata(파일명, 파일경로, 권한 등)을 포함하고 있는 NameNode**와 **실제 데이터들이 Block단위로 분산 및 복제 저장되어 있는 DataNode**로 구성되어 있다.  

HDFS는 파일을 Block이라는 단위로 나누어 관리하는데, 1개 파일은 여러 block으로 나뉘고 여러 DataNode에 복제(Replication) 저장된다(나눠진 block 파일들은 `blk_xxxxxx` 라는 명칭으로 저장된다).  

위와 같이 데이터를 분산 및 복제 저장에는 아래와 같은 특징이 있다.  

1. **Block Unit**  
    - 대용량 데이터를 효율적이고 병렬처리가 가능하도록 분산 저장
    - Block의 기본 Size는 128MB이므로 이보다 작은 데이터를 HDFS에 저장하는것은 비효율적임
2. **Replication**  
    - 특정 DataNode에 장애(Failure)가 생기더라도 안정성 유지 가능  
    - DataNode를 추가하면 디스크 용량이 증가하므로 유연한 확장도 가능  
    - 기본적으로 3개 Node에 복제하므로 데이터의 3배에 해당하는 디스크 용량이 필요  

## MapReduce  

![png](/assets/images/hadoop/ecosys/hdp_5.png){: .align-center}{: width="80%" height="80%"}  

Hadoop은 위와 같이 HDFS에 분산 저장된 데이터를 처리하기 위해 기본적으로 구글에서 발표한 MapReduce 엔진을 사용한다. **MapReduce는 병렬 컴퓨팅 환경에서의 데이터 처리 엔진**으로, **각 Block에 대해 Map Task와 Reduce Task를 통해 원하는 데이터를 추출**하는 작업을 수행한다.  

1. **Map Task-Transformation**
    - (Input) HDFS에 Block 단위로 저장된 데이터를 Input으로 입력받음   
    - (Splitting) Block 내의 텍스트 파일을 line별로 분리함  
    - (Mapping) line의 구분자를 기준으로 (Key, Value)쌍 형태로 맵핑함  
2. **Reduce Task-Aggregation**   
    - (Shuffling) 같은 Key를 가지는 쌍별로 분류 및 정렬   
    - (Reducing) 최종적으로 분산되어 있는 연산 결과를 병합    

<br/>

# Hadoop Ecosystem?

![png](/assets/images/hadoop/ecosys/hdp_1.png){: .align-center}{: width="80%" height="80%"}  
출처: https://1004jonghee.tistory.com/  

이후에는 Hadoop의 코어 기술만으로는 활용이 어렵거나 개선이 필요한 부분들을 보완하는 다양한 서브 프로젝트들이 등장하기 시작했다. 이러한 기술들은 Hadoop의 각 기술 도메인 파트에 붙어서 편의성을 향상시키고 있으며, 각 프로젝트들을 통틀어 **Hadoop Ecosystem**이라고 부른다.  

1. Data Processing
    - `Hive`, `Impala`, `Spark`, `Pig`, `MapReduce`
2. Data Ingestion  
    - `Kafka`, `Flume`, `Sqoop`
3. Data Storage  
    - `Hbase`, `Kudu`, `HDFS`
4. Resource Management
    - `YARN`, `Mesos`
5. Scheduling
    - `Oozie`, `Airflow`
6. Visualization & UI  
    - `HUE`, `Zeppelin`

## YARN    

YARN은 Yet Another Resource Negotiator의 약자로, CPU나 메모리 등의 계산 리소스를 관리하는 리소스 매니저이다. 초기 버전에는 포함되지 않았으나 Hadoop ver2가 나오면서 YARN이 추가되었다.  



- 컨테이너(CPU코어, 메모리) 단위로 관리하며, 비어있는 호스트(컴퓨터)부터 컨테이너를 할당함  


## Hive  

## Impala




<br/>

# Reference

- https://inkkim.github.io/hadoop/Hadoop-Ecosystem%EC%9D%B4%EB%9E%80/   
- https://mangkyu.tistory.com/129  
- https://velog.io/@spdlqjfire/%ED%95%98%EB%91%A1-%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8D-MapReduce
- 


