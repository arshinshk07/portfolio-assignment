// ===== Smooth Scrolling =====
document.querySelectorAll('.sidebar nav a').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ===== Active Link Highlight =====
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.sidebar nav a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').includes(current)) {
      link.classList.add('active');
    }
  });
});

// ===== Typing Effect for Hero Heading =====
const heroText = document.querySelector('.hero h2');
const text = "Hello, I’m Arshin Shaikh";
let index = 0;

function typeEffect() {
  if (index < text.length) {
    heroText.innerHTML = text.slice(0, index + 1) + '<span class="cursor">|</span>';
    index++;
    setTimeout(typeEffect, 100);
  } else {
    document.querySelector('.cursor').style.display = 'none';
  }
}
window.addEventListener('load', typeEffect);
