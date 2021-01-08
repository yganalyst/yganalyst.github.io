---
title:  "[Anaconda] 아나콘다 가상환경의 개념 및 활용방법"
excerpt: "가상환경이 도대체 뭘까? 그리고 어떻게 쓰는 걸까?"
toc: true
toc_sticky: true
header:
  teaser: /assets/images/anaconda.png

categories:
  - pythonic

tags:
  - python
  - 데이터
  - 기초
  - 데이터 분석
  - 머신러닝
  - 아나콘다
  - anaconda
  - conda
  - pip
  - env
  - envs
  - list
  - create
  - info
  - activate
  - deactivate
  - conda install
  - requirements
  - 가상환경
  - 버전관리
  - git
  - 작업환경
  - virtual
  - environment


last_modified_at: 2021-01-07T20:00-20:30
---

# 개요  

![png](/assets/images/anaconda.png){: .align-center}{: width="80%" height="80%"}  

이번 포스팅에서는 가상환경(virtual environment)에 대해 알아보려고 한다.  
파이썬을 처음 설치하고 배우기 시작할때 접하게 되는 개념이지만, 처음이라 그런지 무슨 말인지도 모르겠고 그냥 넘어갔던 기억이 난다. 컴퓨터와 파이썬이라는 언어와 꽤 친해지고 여러 오류들을 만난 뒤에서야 가상환경의 필요성을 느꼈고, 이번 기회에 제대로 개념을 알고 활용방법을 익히는 시간을 가지면 좋을 것 같다.  

## 가상환경이란?  

> 독립적인 작업환경에서 패키지 및 버전관리를 하기 위한 가상의 환경  

아무것도 모른채 필요한 라이브러리를 계속 Base에 설치하다보면, 시간이 지남에 따라 [경고(warning)문구](https://yganalyst.github.io/etc/memo_15/)나 각 라이브러리들의 의존성(dependancy) 문제로 인해 다양한 오류들을 만나 삽질한 기억이 있을 것이다.  

또한 프로젝트마다 활용하는 다양한 라이브러리(특히 tensorflow 같은 경우)끼리 호환문제도 적지 않다. 다른 환경(컴퓨터, 서버 등)에서 동일한 작업을 하려면 이 환경을 똑같이 언제 다 만들까?  

![png](/assets/images/anaconda/env_structure.png){: .align-center}{: width="80%" height="80%"}  
*출처 : https://django-easy-tutorial.blogspot.com/2015/08/python-virtual-environment-setup-in-ubuntu.html  

이런 작업 환경들을 프로젝트별로 관리하고(like 폴더 개념) 공유도 할 수 있도록 도와주는 것이 바로 가상환경이다.  

  
<br/>
# 가상환경 다루기  

가상환경은 `virtualenv`와 `conda`를 사용하는데, 내가 사용하는 Anaconda 환경에서의 `conda`명령어를 통해 활용하는 방법을 알아볼 것이다.  

Anaconda 설치 완료된 이후부터의 설명이므로, Anaconda 설치를 먼저 하고 참고해야 한다.  

![png](/assets/images/anaconda/first_view.PNG)  

설치 후 Anaconda Prompt 실행화면.  

  
## 1. 가상환경 생성하기  

가상환경을 생성할때는 생성할 환경의 이름과 Python버전 등을 설정해 줄 수 있다.  

```
$ conda create -n 가상환경이름 python=버전
```

나는 현재 아나콘다는 3.8로 받았기 때문에, Python 3.7 버전으로 `py37_test`라는 이름의 가상환경을 생성했다.  

![png](/assets/images/anaconda/1.PNG)  

가상환경 설정이 완료되고 나면, `Anaconda3/envs/`경로에 들어가면 생성한 `py37_test`폴더를 볼 수 있다(나의 경우 Anaconda를 D드라이브에 설치했다).  

![png](/assets/images/anaconda/2.PNG)  

## 2. 가상환경 확인하기  

현재 내가 만들어 놓은 가상환경들을 확인해보자.  

```
$ conda info --envs
```

![png](/assets/images/anaconda/3.PNG)  


## 3. 가상환경 활성화하기  

이제 생성한 가상환경으로 들어가보자.  

```
$ conda activate 가상환경이름
```

![png](/assets/images/anaconda/4.PNG)  

앞의 환경을 보여주는 괄호`()`가 base에서 `py37_test`로 변경된 것을 알 수 있다.  


## 4. 가상환경 비활성화하기  

다시 가상환경을 나와 base로 돌아와 보자.  

```
$ conda deactivate
```

![png](/assets/images/anaconda/5.PNG)  


## 5. 가상환경에 라이브러리 설치하기  

다시 가상환경으로 들어가서 [Geopandas 라이브러리](https://yganalyst.github.io/spatial_analysis/spatial_analysis_1/)를 설치해보자(Geopandas는 Base에 그냥 설치할때 의존성문제로 항상 이슈가 많다.).  
설치는 똑같이 하면 된다.  

```
$ conda activate 가상환경이름 
```

```
$ conda install geopandas
```

여기서 아래와 같이 하면 가상환경으로 들어가지 않고도 설치할 수 있다.  

```
$ conda install -n 가상환경이름 geopandas
```


## 6. 가상환경 라이브러리 확인하기  

방금 설치한 라이브러리가 잘 설치됐는지 확인해보자. 

먼저 가상환경을 활성화 하고,  

```
$ conda activate 가상환경이름
```

확인!  

```
$ conda list
```

![png](/assets/images/anaconda/6.PNG)  

Geopandas가 잘 설치된 것을 확인할 수 있다.  

> Geopandas 설치 시, Pandas나 numpy같은 기본 라이브러리가 같이 설치되므로 Geopandas를 먼저 설치하여 충돌되지 않도록 하는 것이 좋은 것 같다.  


## 7. 가상환경 복사하기  

기존 가상환경과 똑같은 환경을 복제해보자.  

```
$ conda create -n 복사된_가상환경이름 --clone 복사할_가상환경이름
```

기존 가상환경인 `py37_test`를 복사해 `py37_copy`라는 환경을 만들어보았다.  

복사가 완료 된 후 아까 배운 `conda info --envs`를 통해 가상환경을 확인해보면,  

![png](/assets/images/anaconda/7.PNG)  

`py37_copy`가 새로 생긴 것을 알 수 있다.  


## 8. 가상환경 삭제하기  

복사한 `py37_copy` 가상환경을 다시 제거해보자.  

```
$ conda remove -n 가상환경이름 --all
```

  
<br/>
# 라이브러리(패키지) 관리  

가상환경을 쓰는 가장 큰 이유라고도 할 수 있는 라이브러리(패키지) 관리이다. 가상환경에 설치된 패키지들은 목록으로 저장해두었다가, 언제 어디서든 다시 설치하여 동일한 환경으로 만들 수 있다.  
```
$ pip freeze > requirements.txt
```

가상환경을 활성화 시킨 상태에서 위 명령어를 통해 패키지의 목록과 버전 정보들을 `requirements.txt` 파일에 저장한다. 특히 git 등으로 버전 관리를 할때 이 `requirements.txt`파일만 관리를 해주면 된다. git의 오픈소스나 프로젝트들을 염탐하다보면 이 파일을 종종 볼 수 있다.  

아까 만든 `py37_test` 가상환경의 패키지 목록을 내보내보자.  

![png](/assets/images/anaconda/8.PNG)  

`requirments.txt`파일은 프롬프트의 경로에 저장된다(여기서는 `C:\Users\user`).  

![png](/assets/images/anaconda/9.PNG)  

아까 설치했던 Geopandas 라이브러리도 보인다!  

이제 다시 새로운 가상환경에서 동일한 라이브러리(패키지)를 구성해야 된다고 가정해보자.  

```
$ pip install -r requirements.txt
```

위 명령을 통해 새로운 가상환경에서도 `requirements.txt` 목록을 불러와 똑같은 환경에 맞게 설치할 수 있다.  

```
$ pip uninstall -r requirements.txt
```

위 명령어로는 `requirements.txt` 목록에 해당하는 패키지들을 삭제한다.  



  
<br/>
# Reference  

https://dandyrilla.github.io/2018-10-01/conda-env/  

https://chancoding.tistory.com/85  







