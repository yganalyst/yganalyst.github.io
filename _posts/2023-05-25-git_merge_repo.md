---
title:  "[Git] 여러 개의 Github Repository 하나로 합치기"
excerpt: "여러 개의 Github Repository를 하나로의 Repository로 합치는 방법에 대해 알아보자"
toc: true
toc_sticky: true
header:
  teaser: /assets/images/git/git_github_logo.jpg

categories:
  - etc

tags:
  - git
  - github
  - subtree
  - add
  - repository
  - prefix


last_modified_at: 2023-05-25T20:00-20:30
---

# 개요  

![jpg](/assets/images/git/git_github_logo.jpg){: .align-center}{: width="60%" height="80%"}  

우리가 폴더를 정리하듯이 일정 시간이 지나면 작업 했던 Repository들을 하나로 합치고 싶은 상황이 생긴다.  
이번 포스팅은 Github 여러 개의 Repositiory를 하나로 합치는 방법에 대한 방법이다.  
Git과 Github에 대한 자세한 내용은 [**[Git] Git & Github의 동작원리 이해하기 및 주요 명령어 정리**](https://yganalyst.github.io/etc/git_github_summary/)를 참고하자.  

  
<br/>

# 방법  

1. 하나로 합칠 새로운 Repository를 생성한다.  
2. 새로운 Repository를 Clone해 온다.
3. 기존 Repository를 Add 한다
    ```
    $ git subtree add --prefix={repo_name} https://github.com/yganalyst/{repo_name}.git main  
    ```
    ```
    $ git push 
    ```
4. 합쳐진 것을 확인할 수 있다.  


<br/>

# Reference  
https://fomaios.tistory.com/entry/Git-%EC%97%AC%EB%9F%AC-%EB%A0%88%ED%8F%AC%EC%A7%80%ED%86%A0%EB%A6%AC-%ED%95%98%EB%82%98%EB%A1%9C-%ED%95%A9%EC%B9%98%EA%B8%B0Merge-multiple-repository  










