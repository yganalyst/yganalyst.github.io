---
title:  "[Python] itertools, 원소의 경우의 수(순열, 조합) 추출하기"
excerpt: "itertools 라이브러리를 활용해서 원소들의 경우의 수를 추출하는 방법을 배워보자.  "
toc: true
toc_sticky: true
header:
  teaser: /assets/images/python_logo.jpg

categories:
  - etc

tags:
  - python
  - 순열
  - 중복순열
  - 조합
  - 중복조합
  - factorial
  - 팩토리얼
  - 경우의 수
  - itertools
  - permutations
  - product
  - combinations
  - combinations_with_replacement
  - list
  - parameter tuning

last_modified_at: 2020-11-09T19:00-19:30
---

# 개요  

![jpg](/assets/images/python_logo.jpg){: .align-center}{: width="80%" height="80%"} 

<br/>
이번 포스팅에서는 `itertools`라는 파이썬 라이브러리를 활용해서, 원소들의 순열과 조합을 통해 경우의 수를 추출해내는 방법에 대해 알아보자.  

```python
import itertools
```

머신러닝, 딥러닝 프레임워크를 활용해 모델링을 수행할 때 하이퍼 파라미터 튜닝할때 원하는 파라미터 값의 다양한 조합을 만들어 학습을 돌려보고자 할 때 만들어서 사용했던 적이 있다.  
([grid search 방식](https://yganalyst.github.io/ml/ML_chap1/#6-1-%EA%B7%B8%EB%A6%AC%EB%93%9C-%ED%83%90%EC%83%89--gridsearchcv)이나, `keras-tuner` 등을 활용하면 이런 과정을 자동적으로 수행해주긴 한다)  


<br/>
# 경우의 수  
## 팩토리얼  

![png](/assets/images/memo/memo_18_f1.png)  

팩토리얼은 **서로 다른 n개의 원소를 나열하는 경우의 수**로 n부터 1까지 모든 수를 곱하면 된다.  

간단하므로 파이썬 내장함수로 아래와 같이 구현했다.  

```python
def factorial(x):
    n = 1
    for i in range(1,x+1):
        n = n*i 
    return n

factorial(6)
```

```
720
```

## 순열  

![png](/assets/images/memo/memo_18_p1.png)  

순열은 **서로 다른 n개 중에 r개를 나열하는 경우의 수(순서 O)**로 `permutations` 함수를 이용할 수 있다.  

```python
# n=4, r=2
result = list(itertools.permutations(["1","2","3","4"],2))
print("**경우의 수 : %s개" % len(result))
print(result)
```

```
**경우의 수 : 12개
[('1', '2'),
 ('1', '3'),
 ('1', '4'),
 ('2', '1'),
 ('2', '3'),
 ('2', '4'),
 ('3', '1'),
 ('3', '2'),
 ('3', '4'),
 ('4', '1'),
 ('4', '2'),
 ('4', '3')]
```
  
## 중복순열  

![png](/assets/images/memo/memo_18_p2.png)  

중복순열은 **중복 가능한 n개 중에 r개를 나열하는 경우의 수(순서 O)**로 `product` 함수에 `repeat`인자를 통해 이용할 수 있다.  

```python
result = list(itertools.product((["1","2","3","4"]), repeat=2))
print("**경우의 수 : %s개" % len(result))
print(result)
```

```
**경우의 수 : 16개
[('1', '1'),
 ('1', '2'),
 ('1', '3'),
 ('1', '4'),
 ('2', '1'),
 ('2', '2'),
 ('2', '3'),
 ('2', '4'),
 ('3', '1'),
 ('3', '2'),
 ('3', '3'),
 ('3', '4'),
 ('4', '1'),
 ('4', '2'),
 ('4', '3'),
 ('4', '4')]
```
  
  
## 조합  

![png](/assets/images/memo/memo_18_c1.png)  

조합은 **서로 다른 n개 중에 r개를 선택하는 경우의 수(순서 X)**로 `combinations` 함수를 통해 이용할 수 있다.  

```python
result = list(itertools.combinations((["1","2","3","4"]),2))
print("**경우의 수 : %s개" % len(result))
print(result)
```

```
**경우의 수 : 6개
[('1', '2'),
 ('1', '3'),
 ('1', '4'),
 ('2', '3'),
 ('2', '4'),
 ('3', '4')]
```
  
  
## 중복조합  

![png](/assets/images/memo/memo_18_c2.png)  

중복조합은 **중복 가능한 n개 중에 r개를 선택하는 경우의 수(순서 X)**로 `combinations_with_replacement` 함수를 통해 이용할 수 있다.  

```python
result = list(itertools.combinations_with_replacement((["1","2","3","4"]),2))
print("**경우의 수 : %s개" % len(result))
print(result)
```

```
**경우의 수 : 10개
[('1', '1'),
 ('1', '2'),
 ('1', '3'),
 ('1', '4'),
 ('2', '2'),
 ('2', '3'),
 ('2', '4'),
 ('3', '3'),
 ('3', '4'),
 ('4', '4')]
```
  
<br/>
# 리스트들 내 모든 원소 조합  

초반에 언급한 것 처럼 하이퍼 파라미터마다 돌려보고 싶은 값들을 설정하고 모든 경우의 수를 뽑는 것도 역시 `product`함수를 통해 가능하다.  
각 리스트를 개별적으로 넣어줘도 되지만, 리스트가 많을 경우를 생각해 `*` args 인자를 넣어 아래와 같이 표현하면 된다.  


```python
epoch_ = [500, 1000, 1500]
batch_size_ = [1000, 2000, 3000]
lr_ = [0.001, 0.002, 0.003]

result = list(itertools.product(*[epoch_,batch_size_,lr_]))
print("**경우의 수 : %s개" % len(result))
print(result)
```

```
**경우의 수 : 27개
[(500, 1000, 0.001), (500, 1000, 0.002), (500, 1000, 0.003), (500, 2000, 0.001), (500, 2000, 0.002), (500, 2000, 0.003), (500, 3000, 0.001), (500, 3000, 0.002), (500, 3000, 0.003), (1000, 1000, 0.001), (1000, 1000, 0.002), (1000, 1000, 0.003), (1000, 2000, 0.001), (1000, 2000, 0.002), (1000, 2000, 0.003), (1000, 3000, 0.001), (1000, 3000, 0.002), (1000, 3000, 0.003), (1500, 1000, 0.001), (1500, 1000, 0.002), (1500, 1000, 0.003), (1500, 2000, 0.001), (1500, 2000, 0.002), (1500, 2000, 0.003), (1500, 3000, 0.001), (1500, 3000, 0.002), (1500, 3000, 0.003)]
```


  
<br/>
# Reference  

https://ghwlchlaks.github.io/permutation-combination-python  

https://coding-factory.tistory.com/606  

https://stackoverflow.com/questions/798854/all-combinations-of-a-list-of-lists  
