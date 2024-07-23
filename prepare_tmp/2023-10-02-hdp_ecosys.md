---
title: "Hadoop Ecosystem에 대한 전반적인 이해"
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

이를 위해 하나의 통합 시스템의 사양을 계속 업그레이드하기 보다는 **여러 대의 컴퓨터에게 작업을 분산시켜(Distributed Prallel Processing) 효율성을 높이고자**하는 필요성이 대두되었고, 이게 Hadoop의 간단한 개발 배경이 된다고 할 수 있다.  

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

# Hadoop Ecosystem  

![png](/assets/images/hadoop/ecosys/hdp_1.png){: .align-center}{: width="80%" height="80%"}  
출처: https://1004jonghee.tistory.com/  

## HDFS

## MapReduce

## YARN

## Hive  

## Impala

<br/>

# Reference
