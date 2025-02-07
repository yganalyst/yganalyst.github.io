---
title: "[Linux] Linux 기본 명령어 정리"
excerpt: "Linux 환경에서의 기본 명령어들에 대해 알아보자."
toc: true
toc_sticky: true
header:
  teaser: /assets/images/linux/linux_logo.png

categories:
  - linux

tags:
  - docker
  - kubernetes
  - container
  - build
  - run
  - Dockerfile
  - ENV
  - env
  - e
  - env-files
  - ARG
  - build-arg

use_math: true

last_modified_at: 2024-11-29T20:00-20:30
---

![png](/assets/images/linux/linux_logo.png){: .align-center}{: width="80%" height="80%"}  

<br/>  

# Linux 기본 명령어

## 1. 디렉토리

1. 현재 디렉터리 경로 확인
    ```shell
    pwd
    ```

2. 현재 디렉터리의 내용(폴더, 파일 등) 확인
    ```shell
    ls
    ```
    - `-a` : 숨겨진 파일이나 폴더 보이기
    - `-l` : 자세한 내용(퍼미션(권한), 포함된 파일수, 소유자, 그룹, 크기, 수정일자, 이름)
    - `-S` : 크기순으로 정렬해서 출력
    - `-h` : K, M, G 단위를 사용하여 파일 크기를 사람이 **보기 좋게** 표시
    - `-Sl` : S와 l 옵션을 같이 표시

3. 현재 디렉터리의 **하위디렉터리 용량** 확인  

    ```shell
    du
    ```
    - `-h` : K, M, G 단위를 사용하여 파일 크기를 사람이 **보기 좋게** 표시
    - `-s` : 현재 디렉터리의 전체 사용량만 표시  

4. 파일/폴더 복사

    ```shell
    # filename1을 filename2라는 이름으로 복사
    cp <filename1> <filename2>
    ```
    - `-r` : 디렉터리에 대한 복사  

5. 파일/폴더 삭제  

    ```shell
    # filename 삭제
    rm <filename>
    ```
    - `-r` : 디렉터리 삭제

6. 파일/폴더 권한 설정  

    ```shell
    # OOO (user, group, other)
    chmod OOO <filename>/<dirname>
    ```
    - 읽기(r) `4` / 쓰기(w) `2` / 실행(x) `1` 
    - `777`: 3가지 유형의 유저에게 모든 권한을 부여(**각 숫자의 합이 7**) 
    - `755`: user에게는 모든권한, group과 other에게는 읽기와 실행만 부여(**각 숫자의 합이 5**)  


## 2. 파일종류 및 권한 표기
  
| O | OOO | OOO | OOO |
| --- | --- | --- | --- |
| 파일종류 | 사용자(owner, 소유자)의 권한 | 그룹(group)의 권한 | 다른 사용자(other)의 권한 |  

- *예시 `-rwxrwxr-x`      
    - O: `d`가 있으면 디렉터리, `-`이면 파일  
    - OOO: 읽기(`r`ead), 쓰기(**`w`**rite), 실행(e`x`ecute) 권한  

<br/>  

# Shell 스크립트

## 1. 반복문

```shell
#!/bin/bash
 
array=(1 3 5 7 9)
for var in "${array[@]}"
do
  echo $var
done
```

```
# 출력
1
3
5
7
9
```

- **`#!/bin/bash`의 의미**  
    - bash shell을 사용하겠다고 명시하는 것으로, `#`는 주석이지만, `#!`는 셔뱅  
    - 리눅스에서는 Bourne shell(/bin/sh), bash shell(/bin/bash)을 사용  
    - bash는 bourne의 향상 버전


## 2. shell에서 Python 코드 실행

```bash
DATE=$1
./batch.py --date $DATE > ./log_text.txt 2>&1
```

- `DATE=$1` : shell 실행 시 입력한 첫번째 인수(argument)를 `DATE` 변수에 할당
- `--date` : python에서 받을 인수 (ex. `argparse`)  
    - `DATE`를 shell에서 받고 이걸 그대로 python에도 전달하는 역할      
- `> log_text.txt` : shell이 실행될 때의 출력 내용을 해당 파일에 리다이렉션  
- `2>&1` : 표준 에러를 표준 출력으로 리다이렉션  
    - shell 실행시에 발생하는 에러들도(`2`) 출력으로 바꿔주는 용도  
    - 이게 없으면 에러는 터미널에만 표시되고, 파일에는 표준 출력들만 기록됨          
      - `0`: 표준 입력 (stdin)
      - `1`: 표준 출력 (stdout)
      - `2`: 표준 에러 (stderr)

<br/>  

# Reference

- [https://wotres.tistory.com/entry/Chmod-777-755-의미-권한-설정](https://wotres.tistory.com/entry/Chmod-777-755-%EC%9D%98%EB%AF%B8-%EA%B6%8C%ED%95%9C-%EC%84%A4%EC%A0%95)

- [https://devpouch.tistory.com/128](https://devpouch.tistory.com/128)
- [https://losskatsu.github.io/os-kernel/bash/#리눅스-bash의-모든-것-binbash의-의미](https://losskatsu.github.io/os-kernel/bash/#%EB%A6%AC%EB%88%85%EC%8A%A4-bash%EC%9D%98-%EB%AA%A8%EB%93%A0-%EA%B2%83-binbash%EC%9D%98-%EC%9D%98%EB%AF%B8)