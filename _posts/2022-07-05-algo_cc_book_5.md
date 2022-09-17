---
title:  "[Algorithm] 이진 탐색 (Binary Search)"
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
  - 이진 탐색
  - 이분 탐색
  - binary search

use_math: true

last_modified_at: 2022-07-05T16:00-16:30
---


# 개요  

![jpg](/assets/images/post_logo/algorithm_logo.jpg){: .align-center}{: width="70%" height="70%"}  

이번 포스팅은 배열에서 특정 원소를 찾기 위한 탐색 알고리즘 중 이진 탐색(Binary search)에 대한 내용이다.


<br/>
  
# 이진 탐색  

이진 탐색은 배열의 **3가지 지점(시작점, 끝점, 중간점)에 대하여 찾으려는 데이터와 중간점의 데이터를 비교하고 다시 3가지 지점을 갱신하는 식**으로 탐색 범위를 좁혀나가는 방식이다.  

이 방식을 반복할때마다 **탐색해야할 데이터들이 절반으로 줄어드는 특징**이 있다.  

이렇게 크기비교가 들어가기 때문에, **이미 데이터가 정렬되어 있어야한다는 전제 조건이 필요**하다.  

이진 탐색은 Up and Down 게임을 생각하면 이해가 쉽다. 예를 들어, 0~10까지 숫자에서 확률적으로 빠르게 답을 찾으려면 0부터 차례로 불러보는것 보다는, 먼저 5를 부르고 Up이면, 6~10중 8을 
부르는 식으로 접근하면 보다 효율적일 것이다.  

## 동작 방식  

구체적인 동작 방식은 아래와 같다.

1. 배열의 시작점(첫 인덱스), 끝점(마지막 인덱스), 중간점((시작+끝) / 2, 소수점은 버림)을 지정한다.  
2. 목표 데이터와 중간 데이터를 비교한다.  
   - **목표 > 중간**이면, **시작점을 중간점의 다음 인덱스로** 옮기고 끝점과 중간점을 다시 갱신  
   - **목표 < 중간**이면, **끝점을 중간점의 이전 인덱스로** 옮기고 시작점과 중간점을 다시 갱신  
   - **목표 == 중간**이면, **탐색을 종료**한다.

  
![png](/assets/images/algorithm/concept_binary_1.png){: .align-center}{: width="70%" height="70%"}  

## 구현 코드

재귀함수를 이용한 방법  

```python
def binary_search_recur(array, target, start, end):
    if start > end:
        return None
    mid = (start+end)//2
    if array[mid]==target:
        return mid
    elif array[mid] > target:
        return binary_search_recur(array, target, start, mid-1)
    else:
        return binary_search_recur(array, target, mid+1, end)

n,target=10,7
array = [1,3,5,7,9,11,13,15,17,19]
result = binary_search_recur(array, target, 0,n-1)
if result==None:
    print("원소가 존재하지 않습니다.")
else:
    print(result+1)
```

반복문을 이용한 방법  

```python
def binary_search_iter(array, target, start, end):
    while start<=end:
        mid = (start+end)//2
        if array[mid]==target:
            return mid
        elif array[mid]>target:
            end = mid -1
        else:
            start = mid + 1
    return None

n,target=10,7
array = [1,3,5,7,9,11,13,15,17,19]
result = binary_search_iter(array, target, 0,n-1)
if result==None:
    print("원소가 존재하지 않습니다.")
else:
    print(result+1)
```

시작점, 끝점, 중간점을 갱신하는 아이디어를 잘 기억하자. 주의할 점은 종료조건에 찾을 원소가 배열에 존재하지 않을 경우를 추가하는 것이다.  
  
배열에 찾으려는 원소가 없다면, 탐색이 무한히 진행되거나 오류가 나버릴 수도 있다. 따라서 시작점이 끝점을 넘어가버리기 전까지만 하면 탐색을 하도록 구현해야한다.  


- 재귀함수의 방식 : 종료조건으로 `start > end` 추가  
- 반복문의 방식 : `start <= end`동안만 탐색하도록 함  



<br/>

# Reference  

[이것이 취업을 위한 코딩 테스트다 with 파이썬 - 나동빈](http://www.kyobobook.co.kr/product/detailViewKor.laf?barcode=9791162243077&gclid=Cj0KCQjwjbyYBhCdARIsAArC6LI29J8rzsG6M1BbbNrPKMtmtoAkJop3-UpMZw3SiWyhjpn7g0NWyJYaArMQEALw_wcB)  

