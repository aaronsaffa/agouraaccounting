'use strict';
// Review-only chrome and an explicit no-send state; no CAPTCHA hostname changes.
const review = document.createElement('aside');
review.className = 'design-review';
review.setAttribute('aria-label', 'Design review');
const label = document.createElement('span');
label.textContent = 'Design preview · A smaller desktop header';
const current = document.createElement('a');
current.href = 'https://agouraaccounting.com/';
current.target = '_blank';
current.rel = 'noopener';
current.textContent = 'View current website ↗';
review.append(label, current);
document.body.prepend(review);
document.addEventListener('submit', event => {
  if (!(event.target instanceof HTMLFormElement)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const status = event.target.querySelector('.form-status');
  if (status) {
    status.hidden = false;
    status.textContent = 'This preview does not send messages. Please use the current website for inquiries.';
    const link = document.createElement('a');
    link.href = 'https://agouraaccounting.com/contact-us';
    link.textContent = ' Open the live contact page.';
    status.append(link);
  }
}, true);
