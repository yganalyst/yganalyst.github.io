---
title:  "[Git/GitHub] Git & Github의 동작원리 이해하기 및 주요 명령어 정리"
excerpt: "버전관리와 개발 협업을 위해 활용되는 Git과 Github을 근본적인 개념부터 주요 명령어까지 상세히 알아보자"
toc: true
toc_sticky: true
header:
  teaser: /assets/images/git/git_github_logo.jpg

categories:
  - etc

tags:
  - python
  - git
  - github
  - gitlab
  - add
  - push
  - commit
  - fetch
  - pull
  - clone
  - diff
  - log
  - merge
  - branch


last_modified_at: 2023-04-20T20:00-20:30
---

# 개요  

![jpg](/assets/images/git/git_github_logo.jpg){: .align-center}{: width="80%" height="80%"}  

이번 포스팅은 버전관리시스템인 [**Git**](https://git-scm.com/)과 git 저장소를 기반으로 한 협업도구 [**GitHub**](https://github.com/)에 대해 알아보자. 너무 잘 알려져있고 좋은 레퍼런스 자료들도 많지만 개념적인 내용을 확실하게 정리하고 근본부터 차근차근 이해하는 것이 이번 포스팅의 목표이다.  

  
<br/>

# Git vs GitHub vs GitLab ?  

Git과 Github, 언젠가부터 Github으로 협업하는 개발자가 많아짐에 따라 이 두 용어를 혼재해서 사용하는 경우가 많다. 틀린 말은 아니지만 엄연히 다른 개념이며 차이를 제대로 이해할 필요가 있다.  

> 결론부터 얘기하면, **Git은 버전관리시스템(프로그램)**이며 **Github은 Git을 공유하기 위한 클라우드 서비스**이다.  

## Git: 나혼자 로컬에서 버전관리하기  

Git은 오픈소스 버전관리시스템(VCS, Version Control System)으로 내 로컬 컴퓨터에 프로그램을 설치해서 사용할 수 있다.   

버전관리란?  
  

![png](/assets/images/git/git_1.png){: .align-center}{: width="70%" height="70%"}   


위와 같이 일상적으로 우리는 이미 파일을 복사 및 backup해서 버전관리를 하고 있다.  
  
이런 귀찮은 일을 대신해주는 것이 Git이고, 특히 소프트웨어 개발을 위한 소스코드 관리에 특화되어 있어서 어떤 코드가 어떻게 변경되었는지를 계속 트랙킹해준다.    


## Github: 팀과 클라우드에서 버전관리하기  

Github은 위에서 설명한 Git의 저장소(변경내용을 담는 공간)를 다른 사람과 공유할 수 있도록 도와주는 웹기반 호스팅 서비스이다. 이를 위해 버전관리 한 내용(git)을 클라우드 서버에 업로드해서 동료들과 개발을 협업한다.  


> 즉, **Github**이라는 원격의 플랫폼 공간에서 **Git**을 이용하여 각자의 컴퓨터에서 버전관리했던 소스코드들을 공유하고 협업하는 것이다.  

## GitLab  

GitLab도 GitHub과 같은 웹기반 호스팅 서비스이고 버전관리와 협업 측면에서는 기능이 거의 동일하다.  
가장 큰 차이는 개발을 위한 CI/CD와 DevOps가 내장되어 있다는 점이 있다(Github은 별도의 프로그램들을 결합하여 사용). 이외에도 비용적이나 지원언어 등 여러가지 차이가 있긴하다.  

  
<br/>

# 동작원리 이해하기  

## 1) 먼저 Git을 이해해보자  

![png](/assets/images/git/git_diag_1.png){: width="60%" height="60%"} 

git은 로컬 컴퓨터에서 버전관리를 도와주는 시스템이라고 했었다.  
정확히는 특정 폴더(이하 작업 폴더) 내에 존재하는 내용물들의 버전을 관리한다.  
버전 관리를 하면 자연스럽게 다양한 needs들이 생기게 되는데, 이와 함께 기본 동작 원리를 이해하면 위 그림과 같다.  

1. **작업 폴더를 지정**해주기  
  - 해당 폴더 내에 `.git`라는 하위 폴더를 생성함으로써 해당 폴더를 작업 폴더로 만든다.  
2. **변경사항을 저장**하고 싶다.  
  - 저장하고 싶은 변경사항들을 사진을 찍듯 "스냅샷"을 만들어 임시 저장 공간에 담아둔다.  
3. **변경사항을 기록**해 놓고 싶다.  
  - 저장된 변경사항들을 `.git`폴더에 영구적인 스냅샷으로 저장한다.  
4. **변경했던 내용들을 확인**하고 싶다.  
  - 이전에 저장해놨던 변경사항들을 `.git`폴더에서 다시 꺼내 확인한다.  
5. **이전 버전**으로 되돌아 가고 싶다.
  - 저장해놨던 변경사항들을 기반으로 이전의 특정 버전으로 backup한다.  


![png](/assets/images/git/git_diag_2.png){: width="70%" height="70%"}   

지금까지 특정한 작업 폴더 내에서 버전관리를 진행했는데, 현재 시점의 작업 폴더를 기점으로 새로운 작업 폴더(ver2)를 만들어 버전관리를 다시 시작할 수 있다.  
이는 새로운 나뭇가지로 나눠짐을 의미하는 `branch`의 개념이다.  

> 이게 왜 필요할까?? 

보통 우리는 의존성이 높은 소스코드들(운영중인 서비스 또는 모델, 팀원과 협업 중이거나 등등..)을 건드리게 되는 경우가 많다(그래서 Git을 쓴다).  
그렇기 때문에 편리한 버전관리를 위해 보편적으로 아래와 같이 개발을 진행한다.  

1. 가장 최신버전은 `main`이라는 기본 branch로 보존시켜놓는다.  
2. 추가적인 기능 개발은 `main`에 덮어씌우는 것이 아닌, 새로운 `branch`에서 진행한다.  
3. 개발이 완료되면 `main`과의 충돌 여부를 검토 후 최종 병합(merge)하여 최신화시킨다.  


## 2) 원격의 개념  

![png](/assets/images/git/git_diag_3.png)  

이제 로컬 컴퓨터에서 열심히 버전관리를 했던 내용을 팀원들과 공유를 하고 싶은 Needs가 생긴다.  
여기서 우리가 잘 알고있는 원격(ex. GitHub)의 개념이 생겨난다.  

로컬에서만 버전관리를 할때는 (나만 작업을 하니까)굉장히 단순했는데, 여러사람이 업로드를 하다보니 버전이 복잡해지게 되고 이에 따라 추가적인 요구사항들이 발생하게 된다.  

1. 내 작업 폴더(로컬 컴퓨터)의 **변경사항들을 원격에 업로드**하기  
2. **내 작업 폴더와 원격 폴더의 버전차이**가 있을까?  
  - 누군가 원격 폴더를 업데이트했다면 당연히 내 작업폴더와는 버전차이가 생겨 충돌이 많이 발생하므로 확인이 필요하다.  
3. **원격 폴더의 버전을 내 작업 폴더에 적용**해주고 싶다(버전 통일하기)  
  - 내 작업에 대한 변경사항은 업로드를 해야하고, 내가 따라가지 못한 버전은 받아와야 한다.  
4. 단순히 **원격 폴더를 로컬 컴퓨터에 복사**해오고 싶을 때도 있을 것이다.  


## 3) 주요 명령어  

![png](/assets/images/git/git_diag_4.png)

지금까지 버전관리를 하기 위해 자연스럽게 갖게 되는 의문과 Needs들을 말로 쭉 풀어써봤다.  
큼직한 Git/Github의 동작원리와 역할은 위와 같은 필요성을 해결해주기 위한 뼈대를 가지고 있다.  

또한 다양한 필요성들은 위 그림과 같이 우리가 잘 알고있는 Git의 주요 명령어 및 용어들로 치환될 수 있다.  
다음 섹션에서는 이러한 실질적인 명령어 사용법에 대해 알아보자.  


<br/>

# 자주쓰는 Git 명령어  

개인적으로 자주쓰게되는 명령어이며, 상세한 내용은 [Git 공식 Document](https://git-scm.com/)에서 확인할 수 있다.  

## 1) 프로젝트 생성 - 1  

로컬 컴퓨터의 작업 폴더를 Git Repository로 적용함으로써 프로젝트를 생성한다.  

- 작업 폴더 내에 `.git`폴더 생성  

```
git init
```

- 폴더 내에 "모든" 변경사항을 Staging Area에 추가  

```
git add .
```

- "First commit"이라는 메세지로 Staging Area에 올라간 변경사항 Commit  

```
git commit -m "First commit"
```

- 최초 등록된 branch(master)를 main이라는 이름으로 변경  

```
git branch -M main
```

- 로컬 폴더를 Remote Repository에 연결  

```
git remote add origin [git URL]
```

- Remote Repository에 변경사항 업로드  

```
git push [Remote Name] [Branch Name]
```

## 2) 프로젝트 생성 - 2  

- 기존에 존재하는(또는 Github에서 만든) Remote Repository를 복사해서 로컬로 가져오기  

```
git clone [git URL]
```



## 3) 사용자 설정  

- commit 할때의 사용자 정보(이름, 이메일)를 아래와 같이 등록할 수 있다.  

```
git config --global user.name "[name]"
git config --global user.email "[email]"
```


## 4) 변경사항 및 히스토리 확인  

- 마지막으로 commit한 내용과 현재 버전(**commit하기 전**)의 내용 차이를 출력  

```
git diff
```

- 두 commit 간의 내용 차이를 출력  

```
git diff [commit1 ID]..[commit2 ID]
```

- Commit 히스토리를 최신 순으로 출력  
- 옵션
  - `-p`: 두 commit 간의 변경사항도 출력 (---a: 변경 전 / +++b는 변경 후)  
  - `-[number]`: 최근 number개만 출력  
  - `--oneline`: one line으로 출력   
  - `--graph`: graph로 출력  

```
git log
```

- branch들간의 commit 관계를 가시적으로 파악할 수 있는 옵션 조합  

```
git log --branches --decorate --graph --oneline
```

## 5) 특정 버전으로 되돌아가기(backup하기)  

- 이전에 특정한 Commit으로 돌아가는 명령어이며, 돌아간 이후의 상태에 따라 옵션 차이가 있다.  
- 옵션  
  - `--hard`: 돌아가려는 commit 이후의 내용은 모두 삭제된다.    
  - `--soft`: 돌아가려는 commit 이후의 내용은 모두 Staging area에 올라가있는 상태가 된다.  
  - `--mixed`: 돌아가려는 commit 이후의 내용은 모두 untracked(Staging area 이전) 상태가 된다.  

```
git reset [Commit ID] --option
```

- `git revert`는 위 방법과 유사하지만 이전 Commit으로 돌아가고 이후 내용을 초기화하는게 아니라, 돌아간다는 새로운 commit을 쌓는 방식으로 동작한다.  

```
git revert [Commit ID]
```

## 6) branch 다루기  

- 현재 존재하는 branch를 확인  

```
git branch
```

- 새로운 branch 생성  
- 옵션  
  - `-d`: [Branch Name] 삭제  
  - `-D`: 강제로 삭제

```
git branch [Branch Name]
```

- 특정 branch로 전환  
- 옵션  
  - `-b`: branch의 생성과 전환을 동시에 수행  

```
git checkout [Branch Name]
```

- 현재 branch을 기준으로 [Branch Name]을 병합  

```
git merge [Branch Name]
```
  
`git merge`를 수행할때 기존 버전과 충돌이 존재할(덮어씌워야 하는) 경우 아래와 같이 수정 후 저장해야 한다.  

- 특정 파일(text.txt)에서 충돌이 발생함을 알려준다.  

```
Auto-merging <filename>
CONFLICT (content): Merge conflict in test.txt
~
```

- 해당 파일을 열어(`vim text.txt`) 충돌된 부분을 어떻게 반영할 것인지 수정하고 저장한다.  
  - `HEAD` 하단: 현재 checkout한 branch의 수정사항  
  - `<branch name>` 상단: merge할 branch의 수정사항   

```
<<<<<<<< HEAD
test(aaa)
========
test(bbb)
>>>>>>>> <branch name>
```


<br/>

# 메모  

- **Git Bash?**  

**유닉스 shell** 프로그램으로 윈도우 환경에서도 리눅스 커맨드를 이용할 수 있다.  
(리눅스가 유닉스 계열의 운영체제를 기반으로 만들어졌기 때문)

- **vi/vim 에디터**  

윈도우는 메모장을 편집기의 기본으로 하지만 리눅스는 vi 편집기를 사용한다.  
아래와 같이 txt파일을 생성하고 편집기를 열 수 있다.  

```vim
vim test.txt
```

vim에는 입력모드와 명령모드가 있어서 편집하려면 입력모드로 변경해야한다.  
위 명령어로 txt파일을 생성하면 기본적으로 명령모드이다.  

- `i` 입력 → 입력모드 → 텍스트 입력 → `Esc` → 명령모드
- `:wq` : 저장(`w`) 후 종료(`q`)













<br/>

# Reference  
https://cocoon1787.tistory.com/723  
https://coding-lks.tistory.com/162  
https://deku.posstree.com/ko/git/branch-merge/  
https://wecandev.tistory.com/152  
https://han-joon-hyeok.github.io/posts/git-reset-revert/  










