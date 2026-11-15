---
title: Lab
prose: false
permalink: /lab/
lead: 직접 만들어 보는 것들. 잘 되든 망하든 과정과 숫자를 남깁니다.
---
{%- assign lab_posts = site.categories["Lab"] -%}

<ul class="projects">
{% for p in site.data.projects %}{% include project-card.html project=p %}{% endfor %}
</ul>

<section class="section">
  <div class="section-head"><h2>실험 기록</h2></div>
  {% if lab_posts %}
  <ul class="post-list">
    {% for post in lab_posts %}{% include post-row.html post=post %}{% endfor %}
  </ul>
  {% else %}
  <p class="empty-inline"><code>git log --oneline</code> 결과가 아직 비어 있습니다. 첫 커밋 준비 중.</p>
  {% endif %}
</section>
