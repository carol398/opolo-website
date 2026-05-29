/* Opolo — small interactions: mobile nav, signup form confirmation */

(function () {
  'use strict';

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Signup forms — front-end confirmation only.
  // Wire to your provider (ConvertKit, Mailchimp, Buttondown, etc.) by setting
  // a real action URL on the form, or by handling the submit event below.
  var forms = document.querySelectorAll('form[data-signup]');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var success = form.parentElement.querySelector('.signup-success') ||
                    form.querySelector('.signup-success');
      if (success) {
        success.classList.add('is-visible');
        success.setAttribute('role', 'status');
      }
      // Hide the form fields once submitted, keep a calm confirmation in place.
      var fields = form.querySelectorAll('input, select, button');
      fields.forEach(function (el) { el.disabled = true; });
      form.style.opacity = '0.55';
    });
  });

  // Mark the active nav link based on current path
  var path = window.location.pathname.split('/').pop() || 'index.html';
  var links = document.querySelectorAll('.nav-link');
  links.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === path) link.classList.add('is-active');
    if (path === '' && href === 'index.html') link.classList.add('is-active');
  });
})();
