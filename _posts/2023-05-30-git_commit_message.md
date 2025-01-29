---
title:  "[Git] Git Commit Message Convention"
excerpt: "Git의 Commit 메세지 규칙에 대해 알아보자"
toc: true
toc_sticky: true
header:
  teaser: /assets/images/git/git_github_logo.jpg

categories:
  - etc

tags:
  - git
  - github


last_modified_at: 2023-05-30T20:00-20:30
---

# 개요  

![jpg](/assets/images/git/git_github_logo.jpg){: .align-center}{: width="60%" height="80%"}  

이번 포스팅은 commit message의 규칙과 관련된 내용이다.  
개발 시 Git을 사용하면서 수많은 Commit을 하게 되는데, 일관성 있는 message convention과 같은 약속된 규칙을 기반으로 보다 효율적인 팀원 간 협업이 가능하다.  
Git과 Github에 대한 자세한 내용은 [**[Git] Git & Github의 동작원리 이해하기 및 주요 명령어 정리**](https://yganalyst.github.io/etc/git_github_summary/)를 참고하자.  

  
<br/>

# Commit Message 

| 타입 이름 | 내용 |
| --- | --- |
| feat | 새로운 기능에 대한 커밋 |
| fix | 버그 수정에 대한 커밋 |
| build | 빌드 관련 파일 수정 / 모듈 설치 또는 삭제에 대한 커밋 |
| chore | 그 외 자잘한 수정에 대한 커밋 |
| ci | ci 관련 설정 수정에 대한 커밋 |
| docs | 문서 수정에 대한 커밋 |
| style | 코드 스타일 혹은 포맷 등에 관한 커밋 |
| refactor | 코드 리팩토링에 대한 커밋 |
| test | 테스트 코드 수정에 대한 커밋 |
| perf | 성능 개선에 대한 커밋 | 

## 예시  

```ruby
git commit -m "Fix: 광고 팝업 예외처리

웹사이트 진입 후 키워드 입력 시,
비정기적으로 노출되는 광고 팝업으로 인한 오류 수정.

resolves: #1011"
```


<br/>

# Reference  

https://velog.io/@chojs28/Git-%EC%BB%A4%EB%B0%8B-%EB%A9%94%EC%8B%9C%EC%A7%80-%EA%B7%9C%EC%B9%99  









