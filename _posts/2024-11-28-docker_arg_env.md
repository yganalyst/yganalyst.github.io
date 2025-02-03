---
title: "[Docker] Argument & Environment Variables"
excerpt: "Dockerfile과 shell 명령어를 통해 Argment와 글로벌 환경 변수를 다루는 방법을 알아보자."
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
  - ENV
  - env
  - e
  - env-files
  - ARG
  - build-arg

use_math: true

last_modified_at: 2024-11-27T20:00-20:30
---

![jpg](/assets/images/docker/docker_logo.jpg){: .align-center}{: width="80%" height="80%"}  

<br/>  

# Argument & Environment variables

![3.png](/assets/images/docker/data/3.png)

## ENV

**하드코딩이 아닌 환경변수를 Global하게 설정해줄 수 있음 (ex. PORT 같은 경우)**

- 실행 코드가 환경변수를 기반으로 실행되도록 변경
    ```jsx
    /* server.js
    
     */
    app.listen(process.env.PORT);
    ``` 

1. **Dockerfile에서 환경변수 지정**
    ```docker
    # Dockerfile
    ...
    COPY . .
    
    ENV PORT 80
    
    EXPOSE $PORT
    ...
    ```
    
    ⇒ 이미지 Re-build
    
2. **Docker shell에서 지정**
    - `--env Key=Value` 또는 `-e Key=Value` 사용 가능  
    
    ```bash
    docker run -d --rm -p 3000:8000 --env PORT=8000 --name feedback-app - v ...
    
    # 여러개인 경우
    -e key1=val1 -e key2=val2 ...
    ```
    
3. **`.env` 파일로 지정**
    - `--env-files <file_path>`
    
    ```bash
    # .env 파일
    PORT=8000
    ```
    
    ```bash
    docker run -d --rm -p 3000:8000 --env-files ./.env --name feedback-app - v ...
    ```
    

## ARG

- Dockerfile의 일부를 변경하고 이미지를 re-build 해야되는 경우 (ex. PORT별로 이미지 빌드)

1. Dockerfile에서 `ARG` 지정
    - `ARG <KEY>=<VALUE>` 
    
    ```docker
    # Dockerfile
    ...
    COPY . .
    
    ARG DEFAULT_PORT=80
    
    ENV PORT $DEFAULT_PORT
    
    EXPOSE $PORT
    ...
    ```
    
2. **Docker shell에서 지정**
    - `--build-arg <KEY>=<VALUE>`
    
    ```bash
    docker build -t feedback-node:dev --build-arg DEFAULT_PORT=8000 .
    ```



<br/>  

# Reference

[Udemy - Docker & Kubernetes: The Practical Guide](https://www.udemy.com/course/docker-kubernetes-the-practical-guide/)  