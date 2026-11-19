# 아직은 직장인

[![Build and Deploy](https://github.com/yganalyst/yganalyst.github.io/actions/workflows/pages-deploy.yml/badge.svg)](https://github.com/yganalyst/yganalyst.github.io/actions/workflows/pages-deploy.yml)
![Jekyll](https://img.shields.io/badge/Jekyll-4.4-CC0000?logo=jekyll&logoColor=white)
![Ruby](https://img.shields.io/badge/Ruby-3.4-CC342D?logo=ruby&logoColor=white)

> 생각만 하던 일들을 하나씩 해봅니다. 아직은 직장인이지만요.

**https://yganalyst.github.io**

개인 사이트이자 실험 기록 저장소입니다. 테마 없이 레이아웃·스타일·스크립트를 직접 작성했고, 의존성은 Jekyll 공식 플러그인 3개뿐입니다.

## Stack

| 영역 | 사용 |
| --- | --- |
| 정적 사이트 | Jekyll 4.4 (kramdown GFM, Rouge) |
| 플러그인 | `jekyll-feed`, `jekyll-sitemap`, `jekyll-seo-tag` |
| 스타일 | 단일 SCSS (`assets/css/main.scss`), CSS 변수 기반 다크/라이트 테마 |
| 스크립트 | 프레임워크 없는 Vanilla JS (`assets/js/main.js`) |
| 폰트 | Pretendard, JetBrains Mono |
| 댓글 | utterances (GitHub Issues) |
| 문의 | Formspree |
| 분석 | Google Analytics 4, GoatCounter (헤더 방문자 수) |
| 배포 | GitHub Actions → GitHub Pages |

## Features

- **퇴근 로딩바**: 로고 옆 진행 바가 평일 10–19시(KST) 근무 시간을 표시
- **방문자 수**: GoatCounter 공개 카운터 API로 `today · total` 표시 (실패 시 숨김)
- **다크/라이트 토글**: `localStorage` 에 저장, 첫 페인트 전에 적용해 깜빡임 없음
- **글 목록 필터**: 카테고리 칩 + 검색 (`/posts/?q=키워드` 지원)
- **목차**: 소제목 3개 이상인 글에서 자동 생성, 스크롤 위치 하이라이트
- **수식**: front matter `math: true` 인 글에서만 MathJax 로드
- **지연 로드**: 댓글(utterances)은 화면 근처에 왔을 때 로드
- **검색/AI 노출**: `sitemap.xml`, `feed.xml`(Atom), `rss.xml`(RSS 2.0, 네이버용), `llms.txt`

## Structure

```text
.
├── _config.yml            # 사이트 설정 (분석, 댓글, 문의 폼, 기본 front matter)
├── _layouts/              # default · home · page · post
├── _includes/             # head · header · footer · post-row · project-card
├── _posts/                # 글 (YYYY-MM-DD-slug.md)
├── _drafts/               # 초안, lab-template.md
├── _data/projects.yml     # Lab 페이지 프로젝트 목록
├── assets/
│   ├── css/main.scss
│   ├── js/main.js
│   └── img/               # 파비콘
├── index.html             # 홈
├── posts.html             # 전체 글 + 필터
├── lab.md · about.md · contact.md
├── rss.xml · llms.txt · ads.txt · 404.html
└── .github/workflows/pages-deploy.yml
```

## Local development

Ruby 3.4 기준입니다.

```bash
bundle install
bundle exec jekyll serve --drafts   # http://127.0.0.1:4000
```

로컬 Ruby 버전이 맞지 않으면 Docker로 실행합니다.

```bash
docker run --rm -it -p 4000:4000 -v "$PWD":/srv -w /srv ruby:3.4 \
  bash -c "bundle install && bundle exec jekyll serve -H 0.0.0.0 --drafts"
```

- 분석 스크립트(GA4, GoatCounter)는 `JEKYLL_ENV=production` 빌드에서만 포함됩니다.
- 로컬에서는 헤더 방문자 수가 가짜 숫자(`12 · 1,234`)로 표시됩니다.

## Writing

| 종류 | 위치 | front matter |
| --- | --- | --- |
| 기술 노트 | `_posts/YYYY-MM-DD-slug.md` | `categories: [대분류, 소분류]` |
| 실험 기록 | `_drafts/lab-template.md` 복사 | `categories: [Lab, 프로젝트명]` |
| 프로젝트 | `_data/projects.yml` | `status: idea \| building \| launched \| paused \| dropped` |

- 글을 수정하면 `last_modified_at` 을 직접 갱신합니다.
- 기본 permalink는 `/posts/:title/` 입니다. 2025년 이전 글은 front matter `permalink` 로 예전 주소(`/:category/:title/`)를 유지합니다.

## Deployment

`main` 에 push 하면 GitHub Actions가 다음을 실행합니다.

1. `JEKYLL_ENV=production` 으로 빌드
2. `html-proofer` 로 내부 링크·이미지 검사 (외부 링크 제외)
3. GitHub Pages 배포

`README.md`, `LICENSE`, `.gitignore` 만 바뀐 push는 배포를 건너뜁니다.

## Analytics

- **GA4**: 유입, 페이지별 조회 등 상세 분석
- **GoatCounter**: 헤더의 공개 방문자 수. 본인 방문 제외는 브라우저마다 [`/#toggle-goatcounter`](https://yganalyst.github.io/#toggle-goatcounter) 로 한 번 접속
