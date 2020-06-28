---
title:  "[Python] 병렬처리(Multiprocessing)를 통한 연산속도 개선"
excerpt: "Pandas dataframe의 연산속도 개선을 위해 병렬처리를 활용해보자"
toc: true
toc_sticky: true
header:
  teaser: /assets/images/python_logo.jpg

categories:
  - data_handling

tags:
  - python
  - multiprocessing
  - pool
  - map
  - split
  - process
  - cpu_count
  - pool.join
  - pool.close

last_modified_at: 2020-06-28T13:00-14:30
---


# 개요  

대용량 데이터를 다루기 위해서는 병렬처리 활용 방식을 필수적으로 알아두는게 필요하다. 데이터 전처리 방식들도 중요하지만 그 방식에 대한 연산속도 및 메모리 관리도 같이 해주는게 필요하다.  
머신러닝/딥러닝 프레임워크를 활용하게 되면 학습 과정에서 function내 병렬처리 되도록 기능을 제공하지만, 데이터 가공 과정에서 주로 활용하는 Pandas에서는 따로 제공하지 않는다.  
- 추가로 가상메모리에서 작업을 도와주는 Dask 라이브러리도 업로드할 예정이다.

  
# Multiprocessing  

파이썬 `multiprocessing`라이브러리의 `Pool`과 `Process`를 활용하여 병렬구조로 연산을 처리할 수 있다.  

  
## 1. Pool  
`Pool`은 입력 받은 job을 `process`에 분배하여 함수 실행의 병렬처리를 도와준다.  

먼저 어떤 값을 5제곱해주는 `work_func`을 정의하고, 1~12의 12개 값을 map함수를 통해 연산을 시도해보자.  
또한 각 실행마다 1초간 멈추며(`sleep`) `os.getpid()`로 현재 프로세스를 나타낸다.  

> 일반적 연산  

```python
# parallelize_test.py

import time, os

def work_func(x):
    print("value %s is in PID : %s" % (x, os.getpid()))
    time.sleep(1)
    return x**5

def main():
    start = int(time.time())
    print(list(map(work_func, range(0,12))))
    print("***run time(sec) :", int(time.time()) - start)

if __name__ == "__main__":
    main()
```

```python
>>> command line  

value 0 is in PID : 15832
value 1 is in PID : 15832
value 2 is in PID : 15832
value 3 is in PID : 15832
value 4 is in PID : 15832
value 5 is in PID : 15832
value 6 is in PID : 15832
value 7 is in PID : 15832
value 8 is in PID : 15832
value 9 is in PID : 15832
value 10 is in PID : 15832
value 11 is in PID : 15832
[0, 1, 32, 243, 1024, 3125, 7776, 16807, 32768, 59049, 100000, 161051]
***run time(sec) : 12
```

결과를 보면 1개의 피드(PID : 12448)가 작업을 처리하고, 1초간 멈추라고 했으므로 작업 수행까지 12초가 걸린 것을 확인 할 수 있다.  

> 병렬처리 Pool  

```python
# parallelize_test.py

import time, os
from multiprocessing import Pool

def work_func(x):
    print("value %s is in PID : %s" % (x, os.getpid()))
    time.sleep(1)
    return x**5

def main():
    start = int(time.time())
    num_cores = 4
    pool = Pool(num_cores)
    print(pool.map(work_func, range(1,13)))
    print("***run time(sec) :", int(time.time()) - start)

if __name__ == "__main__":
    main()
    
```

```python
>>> command line

value 1 is in PID : 25672
value 2 is in PID : 34824
value 3 is in PID : 34000
value 4 is in PID : 21904
value 5 is in PID : 25672
value 6 is in PID : 34824
value 7 is in PID : 34000
value 8 is in PID : 21904
value 9 is in PID : 25672
value 10 is in PID : 34824
value 11 is in PID : 34000
value 12 is in PID : 21904
[1, 32, 243, 1024, 3125, 7776, 16807, 32768, 59049, 100000, 161051, 248832]
***run time(sec) : 3
```

`Pool`안의 값으로 job을 할당받을 Process의 수를 의미한다. 위와 같이 4개의 Process에 할당하고 동일하게 map함수를 전달해본 결과, 4개의 피드(PID : 32764,16280,18488,19528)가 12개의 수를 3개씩 할당받아 작업을 수행했고 수행시간도 3초로 감소했음을 알 수 있다.  

또한 내 로컬컴퓨터에서 활용할 수 있는 CPU 및 프로세스를 확인하려면 다음과 같이 할 수 있다.  

```python
import multiprocessing as mp
mp.cpu_count()
```
```python
8
```

이처럼 대용량 데이터의 경우 `Pool`을 활용해 더 빠른 처리가 가능하다.  

  
## 1-1. 데이터프레임 병렬처리하기  

위에서 알아본 `Pool`함수를 활용해 데이터프레임 전처리를 병렬적으로 처리해보자.  

```python
import time, os
import numpy as np
import pandas as pd
from multiprocessing import Pool

def work_func(data):
    print('PID :', os.getpid())
    data['length_str'] = data['Name'].apply(lambda x : len(x))
    return data

def parallel_dataframe(df, func, num_cores):
    df_split = np.array_split(df, num_cores)
    pool = Pool(num_cores)
    df = pd.concat(pool.map(func, df_split))
    pool.close()
    pool.join()
    return df

def main():
    start = int(time.time())
    my_dir = r"D:\Python\kaggle\titanic\\"
    df = pd.read_csv(my_dir + "train.csv", dtype=str)
    num_cores = 4
    df = parallel_dataframe(df,work_func, num_cores)
    print("***run time(sec) :", int(time.time()) - start)

if __name__ == "__main__":
    main()
```
```python
>>> command line

PID : 35312
PID : 16280
PID : 35312
PID : 16280
***run time(sec) : 1
```

위의 `paralell_dataframe` 함수를 보자.  

1. dataframe을 인자로 받아 프로세스(num_cores)만큼 데이터를 분리해준다(`np.array_spliat`).  
2. `pool.map`을 활용해 병렬처리 명령을 내리고 다시 `pd.concat`으로 합쳐준다.  
3. 작업이 완료되면 pool을 종료해 준다.  

3번의 경우 `pool.close()`, `pool.join()`를 사용하게 되는데, 이는 작업 완료 후에도 메모리를 계속적으로 잡아먹는 것을 방지하기 위해 활용한다.  
([관련 스택오버플로 내용 참고](https://stackoverflow.com/questions/38271547/when-should-we-call-multiprocessing-pool-join))

  
## 2. Process  

`Process`는 하나의 프로세스를 하나의 함수에 할당하여 실행하게 된다.  

```python
# parallelize_test.py

import time, os
from multiprocessing import Process

def work_func(x):
    print("value %s is in PID : %s" % (x, os.getpid()))
    return x**5

def main():
    start = int(time.time())
    procs = []    
    for num in range(1,10):
        proc = Process(target=work_func, args=(num,))
        procs.append(proc)
        proc.start()
        
    for proc in procs:
        proc.join()
    print("***run time(sec) :", int(time.time()) - start)

if __name__ == "__main__":
    main()
```

```python
>>> command line

value 2 is in PID : 19676
value 3 is in PID : 21344
value 1 is in PID : 11528
value 4 is in PID : 21992
value 6 is in PID : 35212
value 5 is in PID : 11984
value 7 is in PID : 24540
value 9 is in PID : 32868
value 8 is in PID : 32832
***run time(sec) : 0
```

`Process`함수는 `target=`인자에 작업을 할당하고, `args=(agr1,)`에 인자를 할당하여 프로세스 객체를 생성한다. 그리고 `start()`로 시작하여 `join()`으로 프로세스의 종료를 기다린다. 
확인해보면 각 값들이 모두 다른 프로세스(PID)에 할당되었음을 알 수 있다.  


  
## Reference  

https://inma.tistory.com/104  

https://swalloow.github.io/pandas-parallel/  

https://docs.python.org/ko/3/library/multiprocessing.html  

