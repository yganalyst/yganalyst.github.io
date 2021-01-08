---
title:  "[Anaconda] 아나콘다 가상환경 IDE와 연동하기"
excerpt: "jupyter notebook, spyder에 가상환경을 연결시켜보자!"
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
  - activate
  - deactivate
  - conda install
  - 가상환경
  - 작업환경
  - virtual
  - environment
  - ide
  - 통합개발환경
  - 개발환경
  - jupyter notebook
  - pycharm
  - spyder
  - ipykernel
  - kernel
  - 커널
  - kernelspec
  - zmq
  - pyzmq
  - navigator


last_modified_at: 2021-01-08T20:00-20:30
---

# 개요  

![png](/assets/images/anaconda.png){: .align-center}{: width="80%" height="80%"}  

이번에는 [저번 포스팅](https://yganalyst.github.io/ml/anaconda_env_1/)에서 생성했던 가상환경을 IDE에 연동하여 작업환경을 만드는 것에 대해 알아보고자 한다.  

## IDE 란?  

간단하게 IDE가 무엇인지 알아보고 넘어가자.  
> 통합개발환경(Integerated Development Environment, IDE)이란 소위 말하는 개발 환경(또는 툴)을 말하며, GUI환경에서 코딩(텍스트 편집기), 디버깅, 컴파일, 배포 등 개발에 필요한 작업들을 하나의 프로그램에서 처리할 수 있도록 환경을 제공해주는 소프트웨어 라고 할 수 있다.  

2019년 기준 IDE의 순위는 아래와 같다(Python이 호환되지 않는 IDE도 포함).  

![png](/assets/images/anaconda/ide_rank.png){: .align-center}{: width="90%" height="90%"}  
*출처 : https://businessoverbroadway.com/2020/07/14/most-popular-integrated-development-environments-ides-used-by-data-scientists/  

나는 주로 Jupyter notebook과 Spyder를 사용한다. 개인적으로 Pycharm에 유용한 기능들이 많지만 무겁게 느껴져서 Spyder를 쓰는 편이다. Spyder가 R과 유사한 UI를 가져서 그런지 익숙하고 기능도 요즘엔 많이 개선되어 딱히 불편한 점 없이 사용하고 있다.  

  
<br/>
# 가상환경과 IDE 연동  

이제 다시 가상환경으로 돌아와서, 내가 주로 사용하는 Jupyter notebook과 Spyder를 중심으로 셋팅해 놓은 가상환경을 연동해보자.  
현재 가상환경은 아래와 같고 가상환경 `py37_test`를 각 IDE 연동해보자.  

![png](/assets/images/anaconda/set.PNG)  

  
<br/>
# Jupyter notebook에 가상환경 연결하기  

  
## 1. 가상환경에 Jupyter notebook 설치  

연동을 위해서는 해당 가상환경에 `jupyter notebook`을 설치해야 한다. `ipykernel`은 자동으로 다운 받아지지만 오류가 자주 생겨서 추가로 다운을 받아주도록 하자.  

```
$ conda activate py37_test
```

```
$ conda install jupyter notebook
```

```
$ conda install ipykernel
```

  
## 2. 가상환경에 Kernel 연결  

이제 아래와 같은 명령어를 통해 가상환경에 Kernel을 연결하여 Jupyter notebook과 연결할 수 있다.  

```
$ python -m ipykernel install --user --name 가상환경이름 --display-name "표시할이름"
```

나는 가상환경 `py37_test`를 `test_test`라는 이름으로 kerenel을 연결하였다.  

![png](/assets/images/anaconda/10.PNG)  

이제 Base 프롬프트에서 Jupyter notebook을 열어 잘 적용됐는지 확인해보자.  


![png](/assets/images/anaconda/11.PNG)  

![png](/assets/images/anaconda/kernel.PNG)  



  
## 3. Kernel 연결 해제하기  

연결한 kernel을 다시 해제하고 싶으면 다음과 같이 하면 된다.  

```
$ jupyter kernelspec unisnstall 가상환경이름
```

![png](/assets/images/anaconda/12.PNG)  

## 4. Kernel 연결 오류 해결  

연결하는 것 까지는 성공했는데, Jupyter notebook에서 실제로 이 Kerenel을 적용해서 작업을 하려고 했을때 다음과 같은 오류가 있었다.  

```
Traceback (most recent call last):
...중략
    import zmq
  File "D:\Anaconda3\envs\py37_test\lib\site-packages\zmq\__init__.py", line 55, in <module>
    from zmq import backend
  File "D:\Anaconda3\envs\py37_test\lib\site-packages\zmq\backend\__init__.py", line 40, in <module>
    reraise(*exc_info)
  File "D:\Anaconda3\envs\py37_test\lib\site-packages\zmq\utils\sixcerpt.py", line 34, in reraise
    raise value
  File "D:\Anaconda3\envs\py37_test\lib\site-packages\zmq\backend\__init__.py", line 27, in <module>
    _ns = select_backend(first)
  File "D:\Anaconda3\envs\py37_test\lib\site-packages\zmq\backend\select.py", line 28, in select_backend
    mod = __import__(name, fromlist=public_api)
  File "D:\Anaconda3\envs\py37_test\lib\site-packages\zmq\backend\cython\__init__.py", line 6, in <module>
    from . import (constants, error, message, context,
ImportError: DLL load failed: 지정된 모듈을 찾을 수 없습니다.
```

위 오류를 보면 `zmq`라이브러리를 import하는데서 오류가 생긴 것을 알 수 있다. 구글링을 하다보니 다음과 같이 `pyzmq`를 재설치해서 해결할 수 있었다.  
*출처 : [stack over flow Q&A](https://stackoverflow.com/questions/54224969/import-error-while-trying-to-run-jupyter-notebook)

먼저 가상환경 활성화하고  

```
$ conda activate py37_test
```

재설치  

```
$ pip uninstall pyzmq
```

```
$ pip install pyzmq
```


  
<br/>
# Spyder에 가상환경 연결하기  

Pycharm의 경우에는 가상한경을 연동하는 기능이 잘 되어있어서 클릭 몇번으로 가능하다. 하지만 Spyder는 아직 이런 기능이 미흡한 것 같다. 관련 논의들을 참고했을때([QA Stack](https://qastack.kr/programming/30170468/how-to-run-spyder-in-virtual-environment)), 크게는 3가지 방법이 있는 것 같다.  

- Anaconda Navigator 활용  
- Spyder 환경설정 활용  
- 프롬프트(cmd) 활용  

Navigator는 로딩시간이 너무 느린데, 이걸 매번하기는 번거로워서 패스하고 아래 2가지만 알아보자.  

  
## 1. Spyder 환결설정을 활용한 방법  


일단 **Spyder 환결설정을 활용**한 방법이 가장 편하겠으나, 내 경우에는 계속 오류가 발생했다.  

1. 먼저 가상환경에 `spyder-kernels`를 설치  
2. `spyder Tools` -> `preferences` -> `python Interpreter` -> `Use the following Python interpreter`  
3. 가상환경 Python 실행파일 선택 : `/ home / you / anaconda3 / envs / your_env / bin / python.exe`  

## 2. 프롬프트(cmd) 활용  

간단하다.  

1. 가상환경 활성화  
2. spyder 설치 (`$ conda install spyder`)  
3. 실행 (`$ spyder`)  

> 프롬프트(cmd)를 종료하면 spyder도 종료되므로 주의하자.  

spyder의 가상환경 연결과 관련해서는 개선되는 사항이 있다면 업데이트를 할 예정이다.  


  
<br/>
# Reference  

https://chancoding.tistory.com/86  





