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

  // Signup forms — wired to MailerLite (account 2322024, form VVFC3r).
  // Posts directly to the same subscribe endpoint the Stay Connected popup uses,
  // so every signup lands in the same list. The custom hero design is preserved;
  // only the submit behaviour is handled here.
  var ML_SUBSCRIBE_URL =
    'https://assets.mailerlite.com/jsonp/2322024/forms/187467223980311925/subscribe';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(form, message) {
    var err = form.parentElement.querySelector('.signup-error');
    if (!err) {
      err = document.createElement('p');
      err.className = 'signup-error';
      err.setAttribute('role', 'alert');
      form.insertAdjacentElement('afterend', err);
    }
    err.textContent = message;
  }

  function clearError(form) {
    var err = form.parentElement.querySelector('.signup-error');
    if (err) err.remove();
  }

  var forms = document.querySelectorAll('form[data-signup]');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearError(form);

      var emailInput = form.querySelector('input[type="email"], input[name="email"]');
      var email = emailInput ? emailInput.value.trim() : '';
      var success = form.parentElement.querySelector('.signup-success') ||
                    form.querySelector('.signup-success');
      var controls = form.querySelectorAll('input, select, button');
      var submitBtn = form.querySelector('button[type="submit"]') ||
                      form.querySelector('button');
      var originalLabel = submitBtn ? submitBtn.textContent : '';

      if (!EMAIL_RE.test(email)) {
        setError(form, 'Please enter a valid email address.');
        if (emailInput) emailInput.focus();
        return;
      }

      // Pending state
      controls.forEach(function (el) { el.disabled = true; });
      if (submitBtn) submitBtn.textContent = 'Adding you…';

      function recover() {
        controls.forEach(function (el) { el.disabled = false; });
        if (submitBtn) submitBtn.textContent = originalLabel;
      }

      var body = 'fields[email]=' + encodeURIComponent(email) +
                 '&ml-submit=1&anticsrf=true';

      fetch(ML_SUBSCRIBE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
      })
        .then(function (res) {
          return res.json().catch(function () { return { success: res.ok }; });
        })
        .then(function (data) {
          if (data && data.success) {
            if (success) {
              success.classList.add('is-visible');
              success.setAttribute('role', 'status');
            }
            // Keep fields disabled and dim the form as a calm confirmation state.
            form.style.opacity = '0.55';
          } else {
            recover();
            setError(form, 'Something went wrong. Please try again.');
          }
        })
        .catch(function () {
          recover();
          setError(form, 'Could not reach the server. Please try again.');
        });
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
