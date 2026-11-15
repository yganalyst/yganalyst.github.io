---
title: Contact
prose: false
permalink: /contact/
lead: 흔적을 남기거나, 커피 한 잔 하거나.
---

<div class="contact-cards">
  <a class="contact-card" href="#guestbook">
    <p class="cmd"><span>$</span> git commit -m "다녀감"</p>
    <p class="contact-title">방명록</p>
    <p class="contact-desc">한 줄이면 충분해요. 리뷰어(저)는 무조건 Approve 합니다. GitHub 계정으로 아래에 남길 수 있어요.</p>
    <p class="contact-go">아래에 남기기 ↓</p>
  </a>
  {%- if site.author.linkedin != "" %}
  <a class="contact-card" href="{{ site.author.linkedin }}">
  {%- else %}
  <a class="contact-card" href="https://github.com/{{ site.author.github }}">
  {%- endif %}
    <p class="cmd"><span>$</span> curl -X POST /coffee-chat</p>
    <p class="contact-title">커피챗</p>
    <p class="contact-desc">커리어, 지도 데이터, 사이드 프로젝트, 아니면 그냥 수다. 응답은 <code>200 OK</code> 보장, 아메리카노 한정.</p>
    <p class="contact-go">{% if site.author.linkedin != "" %}LinkedIn으로 연락하기 ↗{% else %}GitHub에서 연락하기 ↗{% endif %}</p>
  </a>
</div>

<section class="guestbook">
  <div class="section-head"><h2>방명록</h2></div>
  <section class="giscus-wrap" id="guestbook"
    data-repo="{{ site.giscus.repo }}" data-repo-id="{{ site.giscus.repo_id }}"
    data-category="{{ site.giscus.category }}" data-category-id="{{ site.giscus.category_id }}"></section>
</section>
