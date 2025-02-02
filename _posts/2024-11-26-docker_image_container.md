---
title: "[Docker] Docker의 핵심 구성요소, Image와 Container"
excerpt: "Docker의 핵심 구성요소인 Image와 Container에 대해 알아보자."
toc: true
toc_sticky: true
header:
  teaser: /assets/images/docker/docker_logo.jpg

categories:
  - docker

tags:
  - docker
  - kubernetes
  - container
  - build
  - run
  - Dockerfile

use_math: true

last_modified_at: 2024-11-26T20:00-20:30
---

![jpg](/assets/images/docker/docker_logo.jpg){: .align-center}{: width="80%" height="80%"}  

<br/>  

# Images vs Containers

- Docker의 구성요소
    - **Images**: 모든 설정 명령(Configuration)과 코드가 포함된 공유가능한 패키지
        
        (ex. 템플릿, 블루프린트, runtimes 등)
        
    - **Containers**: 위와 같은 이미지들의 구체적인 실행 인스턴스
        
        (ex. Unit of software, **다수의 컨테이너를 하나의 이미지를 기반으로 생성 가능**)
        
    
    ⇒ 즉, **이미지를 기반으로 하는 컨테이너를 실행**하는 것
    
    ![0.png](/assets/images/docker/image_containers/0.png)
    
    ![1.png](/assets/images/docker/image_containers/1.png)
    
<br/>  

# Images 다루기   

## 이미 존재하는 이미지(pre-built image) 사용  

**[Docker Hub](https://hub.docker.com/) Image 사용하기**

1. Docker Hub 에서 최신 node 이미지를 다운로드함
    ```bash
    docker run node
    ```
2. 다운로드 된 Docker image list 확인
    ```bash
    docker image ls
    ```
3. Docker가 생성한 모든(all) 컨테이너, 프로세스 확인  
    *동일한 IMAGE(node)를 기반으로 하는 2개의 컨테이너가 실행될 수 있음을 시사한다.
    ```bash
    docker ps -a
    ```
    ```
    CONTAINER ID   IMAGE          COMMAND                   CREATED          STATUS                      PORTS     NAMES
    5f011e43e7ee   node           "docker-entrypoint.s…"   6 minutes ago    Exited (0) 4 minutes ago              silly_roentgen
    2f9c487a2ded   node           "docker-entrypoint.s…"   12 minutes ago   Exited (0) 12 minutes ago             wonderful_lovelace
    ```    

4. Docker node image의 node shell 사용하기  
    ```bash
    docker run -it node
    ```
    
**Docker Hub에 얹어서 자체 Dockerfile 생성하기**
    
1. DockerFile 작성  

    ```docker
    # dockerfile
    FROM node        # <BaseImage>
    
    WORKDIR /app     # Docker가 작업할 컨테이너 내의 경로 지정
    
    COPY . ./        # <source> <destination>  
                     # <이미지 외부 경로: . 은 프로젝트 폴더 전체> -> <컨테이너 내부 경로>
                     # WORKDIR /app 이므로 ./는 /app을 바라보고 있음
                  
    RUN npm install  # WORKDIR의 경로에서 실행 명령
    
    EXPOSE 80        # 컨테이너는 로컬과 격리! 되어있으므로, 해당 PORT를 노출시켜줘야 함
    
    CMD [ "node","server.js"]    # node.js 실행 명령 - 항상 마지막에 위치함
                                 # RUN은 이미지를 생성하면 실행되는 구조
                                 # 이미지 생성 후 컨테이너를 실행할 때 실행되어야 함
    ```
    
    - `npm install` : 실행되는 터미널 경로 내의 `package.json`의 dependencies에 명시된 라이브러리를 자동으로 설치해줌

2. DockerFile을 기반으로 이미지 생성
    
    ```bash
    docker build .
    ```
    
3. 컨테이너 실행
    
    ```bash
    docker run -p 3000:80 bff8989a23c40b38002674f8d2dcae5abe47ee54c5eab6960c0fd17f4ea9e6cb
    
    # -p : publish의 약자
    # <로컬PORT> : <컨테이너PORT>
    #  -> 컨테이너에 노출된 80 port를 로컬의 3000port에 publish 하겠다는 의미
    #  -> localhost:3000 으로 접속 가능해짐
    ```
    
    - Dockerfile에서 `EXPOSE` 는 실제 실행되는 명령은 아니고 document 역할만 함
    - 하지만 위와 같이 docker 실행 시 `-p`로 PORT를 명시해줘야 하므로 `EXPOSE` 작성은 권장됨

## Image는 build 할 때의 상태로 유지됨

- **build 이후 소스코드의 변경사항을 반영하려면 이미지를 새로 생성(build)해야 함!**
    - 처음 build 할 때 복사(`COPY`)해온 소스코드로 Lock이 걸림
    
    ```bash
    docker build .
    ```
    

## Layer-based architecture

- Docker는 layer 기반 구조임
    - **Docker는 모든 명령과 결과를 cache해 두고 있는 것이 핵심**
    - **이미지를 build할 때 명령을 다시 실행할 필요가 없으면, cache된 결과를 사용함**

    ⇒ 이미지를 연속 두번 build 하면 금방 완료되는 이유

- 즉 아래와 같은 Dockerfile에서 `server.js` 파일을 수정했다면, `COPY` 부터 재실행
    
    ```docker
    FROM node
    
    WORKDIR /app
    
    COPY . /app        # 여기부터 Re-build
    
    RUN npm install
    
    EXPOSE 80
    
    CMD [ "node","server.js"]
    ```
    
    - 후속 Layer들 (`RUN npm install`)도 다시 실행한다.
        
        ⇒ **비효율적임!!**
        
- **Dockerfile 최적화**
    
    ```docker
    FROM node
    
    WORKDIR /app
    
    COPY package.json /app
    
    RUN npm install
    
    COPY . /app               # 변경이 발생한 부분 (Re-build는 여기부터만 하면 됨)
    
    EXPOSE 80
    
    CMD [ "node","server.js"]
    ```
    
    - re-build 할때마다 `npm install` 이 실행되는 것을 방지하기 위해, `package.json` 파일만 위에서 따로 copy해줌
    - **내부 소스코드 변경 시 `COPY . /app` 부분만 업데이트되고, 이후 하위 Layer만 영향을 받게되어 시간이 훨씬 빨라짐**

<br/>  

# Images & Containers 관리

![2.png](/assets/images/docker/image_containers/2.png)

## Container 명령어

- 과거에 실행되었던 모든 컨테이너 출력
    
    ```bash
    docker ps -a
    ```
    
- 종료되었던 컨테이너 재실행 (새로 실행 X)
    
    ```bash
    docker start <container ID or NAME>
    ```
    
    - `docker start` : container는 background로 실행
        - Default가 Detached 모드
    - `docker run` : container는 foreground로 실행 (프로세스가 막히고 Log 확인 가능)
        - Default가 Attached 모드
- run에서 detatched 모드로 실행
    
    ```bash
    docker run -p 8000:80 -d 1f113db3f9ef
    ```
    
- detached 모드를 attached 모드로 변환하기
    
    ```bash
    docker attach unruffled_agnesip
    ```
    
- detached 모드에서 log 찍기 (follow 모드로)
    
    ```bash
    docker logs -f exciting_shirley
    ```
    
- 기존 컨테이너를 attach 모드로 실행하기
    
    ```bash
    docker start -a exciting_shirleyx
    ```
    

## Python Interactive mode

- 아래 python code 컨테이너 실행 시 `input` 으로 인해 interactive mode가 필요함
    
    ```python
    from random import randint
    
    min_number = int(input("Please enter the min number: "))
    max_number = int(input("Please enter the max number: "))
    
    if (max_number < min_number):
        print("Invalid input - shutting down...")
    else:
        rnd_number = randint(min_number, max_number)
        print(rnd_number)
    ```
    
- Docker image build 후 아래와 같이 실행
    
    ```bash
    docker run -it 7477e7c8d1ff605baa204d20db91bc957bf31da30af31799b1fd6a58a33f2fe1
    
    # -i : interactive mode
    # -t : Allocate a pseudo-TTY (Terminal 생성)
    ```
    
- 컨테이너 재실행 할 경우
    
    ```bash
    docker start -a -i goofy_davinci
    ```
    

## Images & Containers 삭제

- 실행되지 않고 있는 컨테이너 삭제
    
    ```bash
    docker rm <container_name1> <container_name2> <container_name3> ...
    ```
    
    - 실행 중인 컨테이너는 먼저 `docker stop` 으로 중지해주어야 함
- docker 이미지 리스트
    
    ```bash
    docker images
    ```
    
- docker 이미지 삭제
    
    ```bash
    docker rmi <IMAGE_ID1> <IMAGE_ID2> <IMAGE_ID3> ... 
    ```
    
    - **이미지가 더이상 사용되지 않을 때만 제거 가능(중단된 컨테이너에도 포함되지 않아야 함)**
- 아무런 사용이 되지 않고 있는 docker image 삭제
    
    ```bash
    docker image prune
    ```
    
- **컨테이너 실행 후 중단 시 자동 삭제 (`--rm`)**
    
    ```bash
    docker run -p 3000:80 -d --rm 1f113db3f9ef
    ```
    
    - docker image를 re-build 하는 경우가 많기 때문에, 이전 컨테이너를 다시 실행시킬 일이 없는 경우가 많음 → 자주 쓰게 됨

## Build된 Docker Image 상세정보 확인하기

```bash
docker image inspect <IMAGE ID>
```

## Container ↔ 로컬 간의 파일 복사

```bash
docker cp <source> <destination>

# 로컬 파일 -> 컨테이너 Copy
docker cp dummy/test.txt mystifying_goldstine:/test

# 컨테이너 -> 로컬파일 Copy
docker cp mystifying_goldstine:/test dummy/test.txt
```

- Docker Image를 다시 build하지 않아도 되지만, 좋은 해결책은 아님

## 이름 & 태그 지정하기

- 컨테이너 이름 설정 (`--name <string>`)
    
    ```bash
    docker run -p 3000:80 -d --rm --name goalsapp 2f04e8cfc9b0
    ```
    
- 이미지 이름은 `name` : `tag` 로 나누어짐
    
    ![3.png](/assets/images/docker/image_containers/3.png)
    
    - name : 이미지 그룹의 명칭
    - tag: 이미지의 버전 명칭
        
        ex) `node:14`
        
- Docker Image build 할 때 name:tag 지정 (`-t`)
    
    ```bash
    docker build -t goals:latest . 
    ```
    
- Image name:tag 변경하기 (`tag`)
    
    ```bash
    docker tag <before name>:<before tag> <after name>:<after tag> 
    ```
    
<br/>  

# Image 공유하기

![4.png](/assets/images/docker/image_containers/4.png)

- Dockerfile를 공유 → 사용자가 `build` 해야하고, file path 등을 설정해줘야 함
- Build된 이미지 자체를 공유 → 바로 사용가능
    - DockerHub에 이미지 푸시(push)

## DockerHub에 image push

- DockerHub에 Repository 생성
    - `namespace/Repository Name`
- Docker Image push
    
    ```bash
    docker push yonggeun/node-hello-world
    ```
    
    - **push할 image의 `name` 을 `namespace/Repository Name` 로 변경해줘야 함**
    - FROM에 참조하는 `node` 이미지는 이미 DockerHub에 있기 때문에, 따로 push하지는 않음
- Access Denied 일때는 로그인 필요
    
    ```bash
    docker login
    ```
    

## DockerHub Image pull(다운로드)

```bash
docker pull yonggeun/node-hello-world
```

- **Local에 image가 없는 경우** → 알아서 DockerHub에서 `pull` → `run`
    
    ```bash
    docker run yonggeun/node-hello-world
    ```


<br/>  

# Reference

[Udemy - Docker & Kubernetes: The Practical Guide](https://www.udemy.com/course/docker-kubernetes-the-practical-guide/)  