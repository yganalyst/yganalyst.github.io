---
title:  "[Algorithm] 깊이 우선 탐색(DFS)과 너비 우선 탐색(BFS)"
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
  - 그래프
  - graph
  - node
  - edge
  - adjacent
  - matrix
  - list
  - dfs
  - 깊이 우선 탐색
  - depth first search
  - 너비 우선 탐색
  - Breadth first Search
  - 스택
  - stack
  - 큐
  - queue
  - deque
  - collections
  - 


last_modified_at: 2022-05-10T16:00-16:30
---


# 개요  

![jpg](/assets/images/post_logo/algorithm_logo.jpg){: .align-center}{: width="70%" height="70%"}  

이번 포스팅은 탐색(원하는 데이터를 찾는 과정) 알고리즘인 깊이 우선 탐색(DFS, Depth-First Search)과 너비 우선 탐색(BFS, Breadth-First Search)에 대한 글이다.  

## 그래프  

DFS와 BFS를 배우기 전에 먼저 그래프의 개념부터 가볍게 짚고 넘어가자.  

아래 그림과 같이 그래프는 노드(node)와 링크(link or edge)로 구성되어 있다.  

![png](/assets/images/algorithm/concept_DFSBFS_1.png){: .align-center}{: width="40%" height="40%"}  

여기서 두 노드가 연결되어 있으면 링크로 연결되며 이를 "인접하다(Adjacent)"라고 표현한다. 이와 같이 그래프는 도시의 도로망이나 인간관계(like 일촌) 등 다양한 관계를 표현하는데 활용된다.  
  
이와 같은 그래프를 표현할 때, 파이썬에서는 행렬(matrix)이나 리스트(list)로 구현할 수 있다(연결되어 있지 않은 경우는 무한대로 표현한다). 

- 인접 행렬(Adjacent matrix) 방식  

```python 
INF = 999999999

graph = [[0,7,5],
         [7,0,INF],
         [5,INF,0]]

print(graph)
```
```
[[0,7,5], [7,0,999999999], [5,999999999,0]]
```

- 인접 리스트(Adjacent list) 방식  

```python
graph = [[] for _ in range(3)]

graph[0].append((1,7))
graph[0].append((2,5))

graph[1].append((0,7))

graph[2].append((0,5))

print(graph)
```
```
[[(1,7),(2,5)],[(0,7)],[(0,5)]]
```

**인접 행렬 방식**은 연결되어 있지 않은 노드도 저장해야 하므로 노드가 많을 수록 저장 메모리가 크다. 그러나 정보를 얻는 속도는 빠르다. **인접 리스트 방식**은 그 반대이다.  
  
이제 아래 그래프를 예시로 DFS와 BFS 방식을 알아보자.  

![png](/assets/images/algorithm/concept_DFSBFS_2.png){: .align-center}{: width="50%" height="50%"}  


<br/>
  
# 깊이 우선 탐색(DFS, Depth-First Search)  

DFS란 정의와 같이 그래프에서 깊은 부분을 우선적으로 탐색하는 알고리즘이다. 즉, 그래프를 탐색 할때 특정한 경로로 쭉 타고 밑바닥까지 내려간 후 막다른 길에 도착하면 다시 돌아와 다른 경로로 탐색하는 것이다.  

## 동작 방식  

구체적인 동작 방식은 아래와 같다. [스택 자료구조](https://yganalyst.github.io/concept/algo_cc_book_2/#%EC%8A%A4%ED%83%9Dstack)를 이용하여 표현(FILO 방식)된다.

1. 탐색 시작 노드를 스택에 삽입하고 방문 처리를 한다.  
2. 스택의 최상단 노드에 방문하지 않은 인접 노드가 있으면 그 노드를 스택에 넣고 방문처리를 한다.  
   - 인접노드가 여러 개 있으면 번호가 낮은 순서부터 처리
   - 방문하지 않은 인접 노드가 없으면 스택에서 최상단 노드를 꺼낸다.  
3. 2번의 과정을 더 이상 수행할 수 없을 때까지 반복한다.  
  
![png](/assets/images/algorithm/concept_DFSBFS_3.png){: .align-center}{: width="60%" height="60%"}  
  
- Step 1 : 탐색시작 노드인 1번 노드 방문처리 `[1]`  
- Step 2 : 1번 노드의 인접 노드(2) 방문처리 `[1,2]`  
- Step 3 : 2번 노드의 인접 노드(3) 방문처리 `[1,2,3]`  
- Step 4 : 3번 노드의 인접 노드가 없으므로 꺼냄 `[1,2]`  
- Step 5 : 2번 노드의 인접 노드가 없으므로 꺼냄 `[1]`  
- Step 6 : 1번 노드의 인접 노드(4) 방문처리 `[1,4]`  
- Step 7 : 4번 노드의 인접 노드(5) 방문처리 `[1,4,5]`  
- Step 8 : 5번 노드의 인접 노드가 없으므로 꺼냄 `[1,4]`  
- Step 9 : 5번 노드의 인접 노드가 없으므로 꺼냄 `[1]`  
- Step 10 : 1번 노드의 인접 노드(6) 방문처리 `[1,6]`  
- Step 11 : 6번 노드의 인접 노드가 없으므로 꺼냄 `[1]`  
- Step 12 : 1번 노드의 인접 노드가 없으므로 꺼냄 `[]`  



## 코드  

```python
def dfs(graph, v, visited):
    # 현재 노드를 방문 처리
    visited[v] = True
    print(v,end=' ')
    
    # 현재 노드와 연결된 다른 노드를 재귀적으로 방문
    for i in graph[v]:
        if not visited[i]:
            dfs(graph, i, visited)
            
# 각 노드(index)가 연결된 다른 노드 정보를 리스트로 표현
graph = [
         [],
         [2,4,6], # 1번 노드는 2,4,6에 연결되어 있음
         [1,3],
         [2],
         [1,5],
         [4],
         [1],
         ]
visited = [False]*7
dfs(graph, 1, visited)
```
```
1 2 3 4 5 6 
```


<br/> 
  
# 너비 우선 탐색(BFS, Breadth-First Search)   

BFS란 쉽게 말해 가까운 노드부터 탐색하는 알고리즘이다. 즉, 그래프를 탐색 할때 가까운 노드들을 우선적으로 방문하고 멀리있는 노드를 나중에 방문한다.  

## 동작 방식  

구체적인 동작 방식은 아래와 같다. [큐(Queue) 자료구조](https://yganalyst.github.io/concept/algo_cc_book_2/#%ED%81%90queue)를 이용하여 표현(FIFO 방식)된다.

1. 탐색 시작 노드를 큐에 삽입하고 방문 처리를 한다.  
2. 큐에서 노드를 꺼내 해당 노드의 인접 노드 중에서 방문하지 않은 노드를 모두 큐에 삽입하고 방문처리를 한다.  
3. 2번의 과정을 더 이상 수행할 수 없을 때까지 반복한다.  
  
![png](/assets/images/algorithm/concept_DFSBFS_4.png){: .align-center}{: width="60%" height="60%"}  
  
- Step 1 : 탐색시작 노드인 1번 노드 방문처리 `[1]`  
- Step 2 : 1번 노드를 꺼내고 모든 인접 노드(2,4,6) 방문처리 `[2,4,6]`  
- Step 3 : 2번 노드를 꺼내고 모든 인접 노드(3) 방문처리 `[4,6,3]`  
- Step 4 : 4번 노드를 꺼내고 모든 인접 노드(5) 방문처리 `[6,3,5]`  
- Step 5 : 6번 노드를 꺼내고 인접 노드가 없어 Pass `[3,5]`    
- Step 6 : 3번 노드를 꺼내고 인접 노드가 없어 Pass `[5]`  
- Step 7 : 5번 노드를 꺼내고 인접 노드가 없어 Pass `[]`  


## 코드  

```python
from collections import deque

def bfs(graph, start, visited):
    queue = deque([start])
    visited[start]=True
    
    while queue:
        v=queue.popleft()
        print(v, end=' ')
        for i in graph[v]:
            if not visited[i]:
                queue.append(i)
                visited[i]=True
            
# 각 노드(index)가 연결된 다른 노드 정보를 리스트로 표현
graph = [
         [],
         [2,4,6], # 1번 노드는 2,4,6에 연결되어 있음
         [1,3],
         [2],
         [1,5],
         [4],
         [1],
         ]
visited = [False]*7
bfs(graph, 1, visited)
```
```
1 2 4 6 3 5
```

<br/> 
  
# DFS와 BFS 비교  

**깊이 우선 탐색(DFS)**  

 - 동작원리 : 스택    
 - 구현방법 : 재귀 함수 이용    
 - 장단점 :  
   - 그래프의 깊이(depth)가 깊을 수록 빠름    
   - 메모리가 적음  
 - 적용 :   
   - 경로의 특징을 저장해야 하는 경우  
   - 길 찾기  
   - 미로 문제  

  
**너비 우선 탐색(BFS)**  

  - 동작원리 : 큐  
  - 구현방법 : 큐 자료구조 이용  
  - 장단점 : 
    - 찾는 노드가 인접할 때 유리
    - 노드가 많을 수록 메모리를 많이 소비  
  - 적용 : 
    - 길 찾기, 라우팅
    - 웹 크롤러
    - 소셜 네트워크에서 멀리 떨어진 사람 찾기
    - 그래프에서 주변 위치 찾기

두 방식은 모두 그래프의 모든 노드를 탐색한다는 공통점이 있습니다.  


<br/>

# Reference  

[이것이 취업을 위한 코딩 테스트다 with 파이썬 - 나동빈](http://www.kyobobook.co.kr/product/detailViewKor.laf?barcode=9791162243077&gclid=Cj0KCQjwjbyYBhCdARIsAArC6LI29J8rzsG6M1BbbNrPKMtmtoAkJop3-UpMZw3SiWyhjpn7g0NWyJYaArMQEALw_wcB)  

https://devuna.tistory.com/32  

https://kimmaadata.tistory.com/84  
