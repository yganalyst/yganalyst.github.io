---
title: "[Docker] Docker란? Docker 설치와 사용"
excerpt: "Docker를 시작하기 위하여 설치하고 간단한 사용 방법에 대해 알아보자."
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

last_modified_at: 2024-11-25T20:00-20:30
---

![jpg](/assets/images/docker/docker_logo.jpg){: .align-center}{: width="80%" height="80%"}  

<br/>  

# Docker란?

> **Container를 생성하고 관리하기 위한 도구**

- **Container는 뭔데?**
    - 표준화된 소프트웨어 Unit
    - Code package
    - 코드의 실행 환경 등
- **Container가 왜 필요한데?**
    - 개발 당시의 환경과 동일한 실행 환경을 갖게 할 수 있음
        - ex) 실행을 위한 Node.JS 버전
    - 팀원 간 협업 시 동일한 개발 환경 공유
    - 혼자, 작업 중인 프로젝트가 여러 개인 경우 독립적으로 관리 가능
        - ex) 프로젝트마다 버전이 달라야 하는 경우
    
    ⇒ Host 컴퓨터가 아닌 컨테이너가 갖고 있기 때문에 가능한 얘기
    
- **가상 머신(Virtual Machines) 을 쓰면 안되나?**
    - 장점
        - 독립 환경 구성 가능
        - 모든 것을 안정적으로 공유하고 재생산 할 수 있음
    - 단점
        - 중복 복제, 공간 낭비가 발생함
        - 호스트 컴퓨터에 VM을 계속 설치해야 되므로 성능 저하가 필연적임
        - 정확히 동일한 방식으로 VM들을 설정해야 되는데 까다로움
            - config 파일 같은게 없으니까~
- **Docker는 “Container”들을 생성(Build)하고 관리(Manage)하기 위한 도구**
    
    ![1.png](/assets/images/docker/docker_install/1.png)
    
<br/>  

# Docker 설치

- [Docker 설치 경로](https://docs.docker.com/engine/install/)  
- [Docker Playground (무설치)](https://labs.play-with-docker.com/)   
- Windows 10 Pro 인 경우
    - Hyper-V 활성화
    - Docker Install
    - 끝

<br/>  

# Docker 사용

- Docker의 역할  
    - 프로젝트 폴더에 필요한 라이브러리를 설치(ex. `npm install`)하지 않아도, node.js 기반 app을 실행할 수 있다는 것
 
1. **`Dockerfile` 생성**
    
    ```bash
    FROM node:14
    
    WORKDIR /app
    
    COPY package.json .
    
    RUN npm install
    
    COPY . .
    
    EXPOSE 3000
    
    CMD [ "node", "app.mjs" ]
    ```
    
2. **Docker 이미지 생성 (프로젝트 경로에서)**
    
    ```bash
    docker build .
    ```
    
3. **Docker 실행**
    
    ```bash
    docker run -p 3000:3000 2f04e8cfc9b0f969798e302ce4b9616354c059191a5fbd2d0f68cf4c410ec79c
    ```
    
4. **실행 확인**
    
    ```docker
    http://localhost:3000/
    ```
    
5. **실행 중인 Container 나열**
    
    ```bash
    docker ps
    
    CONTAINER ID   IMAGE          COMMAND                   CREATED              STATUS              PORTS                    NAMES      
    0c636ff8150c   2f04e8cfc9b0   "docker-entrypoint.s…"   About a minute ago   Up About a minute   0.0.0.0:3000->3000/tcp   brave_newton
    ```
    
6. **Container 종료**
    
    ```bash
    docker stop brave_newton
    ```
    
    *Name은 임의로 부여된 컨테이너 이름  


<br/>  

# Reference

[Udemy - Docker & Kubernetes: The Practical Guide](https://www.udemy.com/course/docker-kubernetes-the-practical-guide/)  