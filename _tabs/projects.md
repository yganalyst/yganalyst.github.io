---
icon: fas fa-flask
order: 1
title: Projects
---

만들어 보는 아이템들과 진행 상태입니다. 각 프로젝트의 시행착오는 **Lab** 카테고리에 기록합니다.

{% assign status_label = "idea:💡 아이디어,building:🛠 진행 중,launched:🚀 출시,paused:⏸ 보류,dropped:🪦 중단" | split: "," %}

{% for p in site.data.projects %}
{%- assign label = p.status -%}
{%- for pair in status_label -%}
  {%- assign kv = pair | split: ":" -%}
  {%- if kv[0] == p.status -%}{%- assign label = kv[1] -%}{%- endif -%}
{%- endfor %}
### {{ p.name }}

{{ label }} · {{ p.started }}부터
{: .text-muted }

{{ p.summary }}

{% if p.metrics %}> {{ p.metrics }}
{: .prompt-info }
{% endif %}
{% if p.link %}[서비스 바로가기]({{ p.link }}){% endif %}
{% if site.categories[p.category] %}[기록 {{ site.categories[p.category].size }}개 보기](/categories/{{ p.category | slugify }}/){% endif %}

---
{% endfor %}
