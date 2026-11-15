---
title: Contact
prose: false
permalink: /contact/
lead: 질문, 피드백, 커피챗 제안 모두 환영합니다.
---
{%- assign action = site.contact.form_action | default: "" | strip -%}
<form class="contact-form" id="contact-form" action="{{ action }}" method="POST"{% if action.size == 0 %} data-disabled{% endif %}>
  <label>
    <span>이름 <em>선택</em></span>
    <input type="text" name="name" autocomplete="name" maxlength="80">
  </label>
  <label>
    <span>답장 받을 이메일 <em>선택</em></span>
    <input type="email" name="email" autocomplete="email" maxlength="120">
  </label>
  <fieldset>
    <legend>어떻게 오셨어요? <em>선택</em></legend>
    <div class="choices">
      {%- assign sources = "검색,LinkedIn,GitHub,지인 소개,기타" | split: "," -%}
      {%- for s in sources %}
      <label class="choice"><input type="radio" name="source" value="{{ s }}"><span>{{ s }}</span></label>
      {%- endfor %}
    </div>
  </fieldset>
  <label>
    <span>메시지</span>
    <textarea name="message" rows="6" required maxlength="4000"></textarea>
  </label>
  <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">
  <div class="form-foot">
    <button type="submit" class="btn">보내기</button>
    <p class="form-status" role="status"></p>
  </div>
</form>
