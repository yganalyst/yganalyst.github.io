---
title: "[Docker] Image와 Container에서의 Data Management"
excerpt: "독립된 환경인 Image와 Container에서 Data를 다루는 방법에 대해서 알아보자."
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
  - volume
  - mount
  - bind mounts

use_math: true

last_modified_at: 2024-11-27T20:00-20:30
---

![jpg](/assets/images/docker/docker_logo.jpg){: .align-center}{: width="80%" height="80%"}  

<br/>  

# Data

## Images & Containers에 존재하는 Data 종류

![0.png](/assets/images/docker/data/0.png)  

- Application: 앱 소스코드 환경  
- Temporary App Data: 일시적인 데이터  
  - **컨테이너를 삭제하면 모든 데이터는 삭제됨**
- Permanent App Data: 영구 데이터 (사용자 계정 정보 등)  


<br/>  

# Data Storages

![1.png](/assets/images/docker/data/1.png)

## Volumes

- Volume: **Container와 연동된 호스트 머신 (로컬 컴퓨터)의 하드 드라이드**
    - Container를 종료하더라도 볼륨의 데이터는 유지됨
    - Container를 **외부 폴더와 연동**하거나 **단순히 데이터를 보존**하려는 경우 사용함

## Volume의 종류

- **Anonymous Volumes**  
    - 익명의 명칭으로 자동 생성, **컨테이너 삭제 시 볼륨도 삭제됨**
    - Dockerfile에 명시해서 생성
        
        ```docker
        FROM node
        ...        
        VOLUME [ "/app/feedback" ]  # 컨테이너 내부의 연동시킬 폴더 경로
        ```
        
- **Named Volumne**  
    - Volume 생성 시 이름 지정, 컨테이너를 삭제해도 유지됨  
    - 컨테이너 생성 시 옵션 설정
      - `-v <volume name>:<container path>`  
        
        ```bash
        docker run -d -p 3000:80 --rm --name feedback-app -v feedback:/app/feedback feedback-node:volumes
        ```
        
    - **컨테이너 삭제 후 다시 실행할 때 Volume Name만 똑같이 설정해주면 연동됨**
        
        ⇒ 컨테이너 간의 데이터 연동 가능
        
- Volume 확인
    
    ```bash
    docker volume ls
    ```
    
- Volume 삭제
    
    ```bash
    docker volume rm <VOL_NAME>
    
    # 또는
    
    docker volume prune
    ```
    

## Bind Mounts

- 지금까지는 소스코드에 변경사항이 있을 경우, **이미지 Re-Build → 컨테이너 재실행**이 필요했음
- Bind Mount를 통해 로컬 컴퓨터 상의 경로와 컨테이너 내의 경로를 식별할 수 있음
    - 컨테이너는 해당 경로를 계속 모니터링 → 항상 최신의 상태 유지
    - **이미지가 아니라 실행하는 컨테이너에 적용되는 것임**
- **영구적이고 수정가능한 데이터에 적합**
- Bind Mount 데이터를 삭제하려면 실제 로컬 호스트에서 삭제를 해야됨
- 컨테이너 생성 시 옵션 설정
    - `-v <Local absolute pat>:<container path>`
    
    ```bash
    docker run -d -p 3000:80 --rm --name feedback-app -v feedback:/app/feedback -v "/docker-complete/data_volumes:/app" -v /app/node_modules feedback-node:volumes
    
    ```
    
- **익명 볼륨도 추가하는 이유? (중요)**
    
    ![2.png](/assets/images/docker/data/2.png)
    
    - Anonymous Volume: `-v /app/node_modules`
    - Bind Mount: `-v "/docker-complete/data_volumes:/app"`
      -  Bind Mount가 `npm install`로 설치한 `/app/node_modules/` 폴더까지 덮어씌워 버려서, 라이브러리 정보가 사라져버림
      - **Anonymous Volume을 통해 `/app` 보다 `/app/node_modules` 를 선행**
        ⇒ 도커는 하위 경로를 우선으로 식별하는 규칙이 있음
        
- Read Only Volume (읽기 전용) `:ro`  
    - Bind Mount를 생성할 때 단방향(호스트 → 컨테이너) 수정만 가능하도록 강제함
      - 보안이 유지를 위함  
    - 현재는 프로젝트 전체 폴더에 Mount 되어 있기 때문에, 컨테이너에서 Write 해야되는 일부 폴더 (사용자 데이터 저장 등)를 익명 볼륨으로 뺴주기
        
        ```bash
        docker run -d -p 3000:80 --rm --name feedback-app -v feedback:/app/feedback -v "E:/01_git_repo/docker-complete/data_volumes:/app:ro" -v /app/temp -v /app/node_modules feedback-node:volumes
        ```
        
- Bind Mount vs `COPY`
    - **Bind Mounts를 사용하면 Dockerfile 내에 `COPY`로 스냅샷을 할 필요가 없지 않나??**
    ⇒ 개발 중에는 그렇지만, 운영(배포) 중에는 소스코드의 변경사항을 실시간 반영할일이 없기 때문에 스냅샷이 필요

## Volume 관리하기

- volume 직접 생성
    
    ```bash
    docker create volume <volume_name>
    ```
    
    ⇒ **이후 Named volume 생성 시 해당 <volume_name>을 사용하면 자동으로 연동**
    
    ⇒ **없으면 자동으로 생성**
    
- Volume 세부정보 확인
    
    ```bash
    docker volume inspect <volume_name>
    ```
    
- `.dockerignore` 로 `COPY`되면 안되는 폴더/파일 지정할 수 있음


<br/>  

# Reference

[Udemy - Docker & Kubernetes: The Practical Guide](https://www.udemy.com/course/docker-kubernetes-the-practical-guide/)  