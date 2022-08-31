---
title:  "[Algorithm] 탐색을 위한 스택(Stack), 큐(Queue), 재귀함수(Recursive function)"
excerpt: "매일매일 알고리즘 공부하기"
toc: true
toc_sticky: true
header:
  teaser: /assets/images/post_logo/algorithm_logo.jpg

categories:
  - concept

tags:
  - python
  - 파이썬
  - 코딩테스트
  - 코테
  - 알고리즘
  - algorithm
  - 탐색
  - search
  - 재귀
  - 재귀함수
  - 재귀호출
  - recursive
  - 스택
  - stack
  - 큐
  - queue
  - collections
  - deque
  - 자료구조
  - DFS
  - BFS
  - 깊이 우선
  - 너비 우선

last_modified_at: 2022-05-06T16:00-16:30
---


# 개요  

![jpg](/assets/images/post_logo/algorithm_logo.jpg){: .align-center}{: width="70%" height="70%"}  

이번 포스팅은 탐색(원하는 데이터를 찾는 과정)을 위해 이해해야할 자료구조인 스택(stack)과 큐(queue) 그리고 재귀함수(recursive function)에 대한 것이다.  

<br/>
  
# 스택(Stack)  

스택은 기본적으로 선입후출(FILO, First In Last Out) 구조로, 먼저 들어온 원소가 제일 나중에 빠져나가는 특징이 있다. 간단한 예시로 엘리베이터를 탈 때 처럼 먼저 들어온 사람들이 뒷 공간으로 밀리고 마지막에 탄 사람이 문 앞에 있으므로, 내릴때는 반대로 마지막에 탄 사람이 먼저 내리는 경우를 들 수가 있다.  

## 구조  

아래 예시로 구체적인 단계를 이해할 수 있다. 

- step 1 : 삽입(5)  

```
[5]
```
- step 2 : 삽입(5) - **삽입(2)**  

```
[5,2]
```

- step 3 : 삽입(5) - 삽입(2) - **삽입(3)**  

```
[5,2,3]
```

- step 4 : 삽입(5) - 삽입(2) - 삽입(3) - **삽입(7)**  

```
[5,2,3,7]
```

- step 5 : 삽입(5) - 삽입(2) - 삽입(3) - 삽입(7) - **삭제()**

```
[5,2,3]
```

- step 6 : 삽입(5) - 삽입(2) - 삽입(3) - 삽입(7) - 삭제() - **삽입(8)**

```
[5,2,3,8]
```

- step 7 : 삽입(5) - 삽입(2) - 삽입(3) - 삽입(7) - 삭제() - 삽입(8) - **삭제()**

```
[5,2,3]
```

이와 같이 삭제를 하면 제일 마지막으로 삽입되었던 원소(우측)부터 삭제된다.  

## 코드  

파이썬에서는 `list`의 `append`(삽입)과 `pop`(삭제)로 구현할 수 있다. `append`는 list의 뒤쪽부터 삽입하고, `pop`은 뒤쪽부터 삭제한다.  

```python
stack = []
stack.append(5)
stack.append(2)
stack.append(3)
stack.append(7)
stack.pop()
stack.append(8)
stack.pop()
print(stack)
print(stack[::-1]) # reverse
```
```
[5,2,3]
[3,2,5]
```


<br/> 
  
# 큐(Queue)

큐는 말그대로 대기열을 의미한다. 우리가 평소에 줄을 서는 것과 동일하게 먼저 줄을 선 사람이 먼저 처리된다. 따라서 스택과 반대로 선입선출(FIFO, First In First Out)의 구조이다.  

## 구조  

- step 1 : 삽입(5)  

```
[5]
```
- step 2 : 삽입(5) - **삽입(2)**  

```
[5,2]
```

- step 3 : 삽입(5) - 삽입(2) - **삽입(3)**  

```
[5,2,3]
```

- step 4 : 삽입(5) - 삽입(2) - 삽입(3) - **삽입(7)**  

```
[5,2,3,7]
```

- step 5 : 삽입(5) - 삽입(2) - 삽입(3) - 삽입(7) - **삭제()**

```
[2,3,7]
```

- step 6 : 삽입(5) - 삽입(2) - 삽입(3) - 삽입(7) - 삭제() - **삽입(8)**

```
[2,3,7,8]
```

- step 7 : 삽입(5) - 삽입(2) - 삽입(3) - 삽입(7) - 삭제() - 삽입(8) - **삭제()**

```
[3,7,8]
```

이와 같이 삭제를 하면 제일 먼저으로 삽입되었던 원소(좌측)부터 삭제된다.  

## 코드(deque)    

파이썬에서는 `collections`모듈의 `deque` 자료구조를 활용할 수 있다. 여기서 `popleft`를 통해 가장 좌측(먼저 들어온) 원소를 꺼낼 수 있다.  
  
*`list` 자료구조에서 `pop(0)`으로도 꺼낼 수 있지만, 시간복잡도가 원소의 개수만큼(`O(n)`) 걸리며, `deque`에서는 `O(1)`밖에 걸리지 않아 효율적이라고 한다([참고](https://stackoverflow.com/questions/32543608/deque-popleft-and-list-pop0-is-there-performance-difference)).

또한 `deque`에 `list`만 씌우면 리스트로 자료구조를 변경할 수 있다.  



```python
from collections import deque
queue = deque()

queue.append(5)
queue.append(2)
queue.append(3)
queue.append(7)
queue.popleft()
queue.append(1)
queue.append(4)
queue.popleft()

print(queue)
queue.reverse()
print(queue)

list(queue) # list로 변경
```
```
[3,7,8]
[8,7,3]
```

<br/>

# 재귀함수(Recursive function)  

재귀함수는 [이전 포스팅](https://yganalyst.github.io/basic/Py_study11/)에서도 다루었으니 간단하게만 복습하고 넘어간다.  
  
재귀함수는 자기자신을 다시 호출하는 함수로, 처음에 이해하기가 어려울 수 있지만 잘 이해하면 효율적인 코딩이 가능해진다.  

여기서 이전 포스팅과 다른 포인트는 재귀함수의 수행은 **스택** 자료 구조를 이용한다는 것이다. 함수를 계속 호출했을 때 가장 마지막에 호출한 함수가 먼저 끝나야 그 앞의 호출이 끝나는 식으로 다시 거슬러 올라온다.  
즉, **함수의 호출을 거듭 -> 마지막(종료 조건)에 도달 -> 다시 거슬러 올라옴**  
  
이후에 포스팅할 깊이 우선 탐색(DFS, Depth-First Search)과도 관련이 있다.  


## 종료 조건  

재귀 함수를 사용할 때는 본인이 정의한 함수에 종료 조건이 있는지를 꼭 점검해야한다. 종료 조건이 없을 경우 무한히 반복실행이 되고, 파이썬에서는 재귀함수의 호출 횟수 제한(1,000,000 정도)에 걸리게 된다.  
  
불가피하게 호출이 많이 필요할 때는 아래 코드를 통해 이 횟수 제한을 임의로 늘릴 수 있긴 하다.  

```
import sys
sys.setrecursionlimit(10**6)
```

대표적인 재귀함수의 예제들로는 [피보나치 수열](https://yganalyst.github.io/basic/Py_study11/#%EC%98%88%EC%A0%9C-1---%ED%94%BC%EB%B3%B4%EB%82%98%EC%B9%98-%EC%88%98%EC%97%B4-%EB%A7%8C%EB%93%A4%EA%B8%B0), [팩토리얼](https://yganalyst.github.io/basic/Py_study11/#%EC%98%88%EC%A0%9C-3---%ED%8C%A9%ED%86%A0%EB%A6%AC%EC%96%BCfactiorial) 등의 구현이 있으니 이전 포스팅을 참고하자.  


<br/>

# Reference  

[이것이 취업을 위한 코딩 테스트다 with 파이썬 - 나동빈](http://www.kyobobook.co.kr/product/detailViewKor.laf?barcode=9791162243077&gclid=Cj0KCQjwjbyYBhCdARIsAArC6LI29J8rzsG6M1BbbNrPKMtmtoAkJop3-UpMZw3SiWyhjpn7g0NWyJYaArMQEALw_wcB)  


