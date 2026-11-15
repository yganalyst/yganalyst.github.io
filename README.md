# yg's lab

https://yganalyst.github.io

[Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy) 테마 기반 Jekyll 블로그입니다. `master` 에 push 하면 GitHub Actions 가 빌드·배포합니다.

## 로컬 실행

```bash
bundle install
bundle exec jekyll serve --drafts   # http://127.0.0.1:4000
```

Docker 를 쓸 경우:

```bash
docker run --rm -it -p 4000:4000 -v "$PWD":/srv -w /srv ruby:3.4 \
  bash -c "bundle install && bundle exec jekyll serve -H 0.0.0.0 --drafts"
```

## 글 쓰기

- 기술 노트: `_posts/YYYY-MM-DD-slug.md`, `categories: [대분류, 소분류]`
- 실험 기록: `_drafts/lab-template.md` 를 복사해 `categories: [Lab, 프로젝트명]` 으로 작성
- 프로젝트 목록: `_data/projects.yml` 에 추가하면 Projects 탭에 표시됩니다
- 글을 수정하면 front matter 의 `last_modified_at` 을 직접 갱신합니다

2025년 이전 글은 front matter 의 `permalink` 로 예전 주소(`/:category/:title/`)를 유지합니다.
