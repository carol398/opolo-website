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
        setError(form, 'That email address is missing something. Check it and we will add you to the list.');
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
            askGradeLevel(form, email);
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

  // Step two of the waitlist: one grade-level question on the success state.
  // The email is already captured, so skipping this costs nothing.
  function askGradeLevel(form, email) {
    var host = form.parentElement;
    if (host.querySelector('.grade-ask')) return;

    var ask = document.createElement('div');
    ask.className = 'grade-ask';

    var selectId = 'grade-select-' + Math.random().toString(36).slice(2, 7);

    var q = document.createElement('label');
    q.className = 'grade-ask-q';
    q.setAttribute('for', selectId);
    q.textContent = 'One quick question, so we send you what fits: what grade is your child in?';
    ask.appendChild(q);

    var select = document.createElement('select');
    select.className = 'grade-select';
    select.id = selectId;
    var options = ['Choose a grade', '6th grade', '7th grade', '8th grade', '9th grade',
      '10th grade', '11th grade', '12th grade', '5th grade or younger', 'Not a parent'];
    options.forEach(function (label, i) {
      var o = document.createElement('option');
      o.textContent = label;
      o.value = i === 0 ? '' : label;
      if (i === 0) { o.disabled = true; o.selected = true; }
      select.appendChild(o);
    });
    select.addEventListener('change', function () {
      if (!select.value) return;
      select.disabled = true;
      var body = 'fields[email]=' + encodeURIComponent(email) +
                 '&fields[student_grade]=' + encodeURIComponent(select.value) +
                 '&ml-submit=1&anticsrf=true';
      fetch(ML_SUBSCRIBE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
      }).catch(function () {}).finally(function () {
        // The signup is already complete; the answer is a bonus either way.
        var done = document.createElement('p');
        done.className = 'grade-ask-done';
        done.setAttribute('role', 'status');
        done.textContent = 'Got it. Thank you.';
        ask.replaceChildren(done);
      });
    });
    ask.appendChild(select);

    var successEl = host.querySelector('.signup-success');
    if (successEl && successEl.parentElement === host) {
      successEl.insertAdjacentElement('afterend', ask);
    } else {
      host.appendChild(ask);
    }
  }

  // Mark the active nav link based on current path
  var path = window.location.pathname.split('/').pop() || 'index.html';
  var links = document.querySelectorAll('.nav-link');
  links.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === path) link.classList.add('is-active');
    if (path === '' && href === 'index.html') link.classList.add('is-active');
  });
})();
