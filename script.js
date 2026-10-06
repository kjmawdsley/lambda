const items = document.querySelectorAll('.project, .private-card, .manifesto-grid, .craft-intro, .capabilities, .method-title, .method-body');
items.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

items.forEach(el => observer.observe(el));