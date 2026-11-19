# 아직은 직장인

[![Build and Deploy](https://github.com/yganalyst/yganalyst.github.io/actions/workflows/pages-deploy.yml/badge.svg)](https://github.com/yganalyst/yganalyst.github.io/actions/workflows/pages-deploy.yml)

> 생각만 하던 일들을 하나씩 해봅니다. 아직은 직장인이지만요.

**https://yganalyst.github.io**

개인 사이트이자 side project 실험 기록입니다. Theme 없이 layout, style, script를 직접 작성했습니다.

## Stack

- **Site**: Jekyll 4.4 · Vanilla JS · SCSS
- **Comments**: utterances
- **Contact form**: Formspree
- **Analytics**: GA4 · GoatCounter (visitor counter)
- **Deploy**: GitHub Actions → GitHub Pages

## Features

- **Work-hours bar**: 로고 옆 progress bar가 평일 10–19시(KST) 근무 시간을 표시
- **Visitor counter**: 헤더에 `today · total` 표시
- **Dark / Light mode**
- **Post filter**: 카테고리 + 검색
- **TOC**: 소제목 3개 이상인 글에서 자동 생성

## Run locally

```bash
bundle install
bundle exec jekyll serve --drafts   # http://127.0.0.1:4000
```

## Writing

- Post: `_posts/YYYY-MM-DD-slug.md`
- Lab: `_drafts/lab-template.md` 복사 → `categories: [Lab, 프로젝트명]`
- Project: `_data/projects.yml`
