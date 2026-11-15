---
title: 프로젝트
prose: false
permalink: /projects/
lead: 직접 만들어 보는 것들과 진행 상태입니다. 과정은 Lab 글로 기록합니다.
---

<ul class="projects">
{% for p in site.data.projects %}{% include project-card.html project=p %}{% endfor %}
</ul>
