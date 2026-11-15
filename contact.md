---
title: Contact
prose: false
permalink: /contact/
---
{%- assign action = site.contact.form_action | default: "" | strip -%}
<form class="contact-form" id="contact-form" action="{{ action }}" method="POST"{% if action.size == 0 %} data-disabled{% endif %}>
  <label>
    <span>요즘 무슨 생각 하세요?</span>
    <textarea name="message" rows="7" required maxlength="4000" placeholder="저녁 뭐 먹지."></textarea>
  </label>
  <label>
    <span>답장을 원하신다면</span>
    <input type="text" name="contact" maxlength="200" autocomplete="off" placeholder="ex) Email, Instagram, etc.">
  </label>
  <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" class="hp" aria-hidden="true">
  <div class="form-foot">
    <button type="submit" class="btn">보내기</button>
    <p class="form-status" role="status"></p>
  </div>
</form>
