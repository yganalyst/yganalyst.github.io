---
title: Contact
prose: false
permalink: /contact/
lead: 답장은 퇴근 후에 합니다.
---
{%- assign action = site.contact.form_action | default: "" | strip -%}
<form class="contact-form" id="contact-form" action="{{ action }}" method="POST"{% if action.size == 0 %} data-disabled{% endif %}>
  <label>
    <span>요즘 고민 있으세요?</span>
    <textarea name="message" rows="7" required maxlength="4000" placeholder="고민, 질문, 커피챗 제안, 아니면 그냥 아무 말이나."></textarea>
  </label>
  <label>
    <span>흔적 남기기 <em>선택</em></span>
    <input type="text" name="contact" maxlength="200" autocomplete="off" placeholder="이메일, 인스타, 링크드인… 답장 받을 곳이 있다면">
  </label>
  <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">
  <div class="form-foot">
    <button type="submit" class="btn">보내기</button>
    <p class="form-status" role="status"></p>
  </div>
</form>
