---
title: Lab
prose: false
permalink: /lab/
lead: 실행하고 수습하고
---
{%- assign lab_posts = site.categories["Lab"] -%}

{% if site.data.projects.size > 0 %}
<ul class="projects">
{% for p in site.data.projects %}{% include project-card.html project=p %}{% endfor %}
</ul>
{% endif %}

<section class="section">
  <div class="section-head"><h2>기록</h2></div>
  {% if lab_posts %}
  <ul class="post-list">
    {% for post in lab_posts %}{% include post-row.html post=post %}{% endfor %}
  </ul>
  {% else %}
  <p class="empty-inline">아직 기록이 없습니다.</p>
  {% endif %}
</section>
