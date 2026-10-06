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

/*
 * Lambda wavelength system
 * One mathematically regular wave shape everywhere.
 * A fixed dash travels continuously along it, so a new stroke starts drawing
 * back on before the previous one has completely left the far edge.
 */
const WAVE_PATH = 'M-100 90 C-50 52 0 52 50 90 S150 128 200 90 S300 52 350 90 S450 128 500 90 S600 52 650 90 S750 128 800 90 S900 52 950 90 S1050 128 1100 90 S1200 52 1250 90 S1350 128 1400 90 S1500 52 1550 90 S1650 128 1700 90';

function createWave({ tone = 'dark', hero = false, delay = 0 } = {}) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 1600 180');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('lambda-wave', hero ? 'lambda-wave--hero' : 'lambda-wave--section', `lambda-wave--${tone}`);
  svg.style.setProperty('--wave-delay', `${delay}s`);

  let stroke = tone === 'light' ? '#ffffff' : '#173bd8';

  if (hero) {
    const defs = document.createElementNS(ns, 'defs');
    const gradient = document.createElementNS(ns, 'linearGradient');
    gradient.id = 'lambda-hero-wave-gradient';
    gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
    gradient.setAttribute('x1', '0');
    gradient.setAttribute('x2', '1600');
    ['0:#173bd8','34.9:#173bd8','35.1:#ffffff','100:#ffffff'].forEach(item => {
      const [offset, colour] = item.split(':');
      const stop = document.createElementNS(ns, 'stop');
      stop.setAttribute('offset', `${offset}%`);
      stop.setAttribute('stop-color', colour);
      gradient.appendChild(stop);
    });
    defs.appendChild(gradient);
    svg.appendChild(defs);
    stroke = 'url(#lambda-hero-wave-gradient)';
  }

  const track = document.createElementNS(ns, 'path');
  track.setAttribute('d', WAVE_PATH);
  track.setAttribute('pathLength', '100');
  track.setAttribute('stroke', stroke);
  track.classList.add('lambda-wave__track');

  const runner = document.createElementNS(ns, 'path');
  runner.setAttribute('d', WAVE_PATH);
  runner.setAttribute('pathLength', '100');
  runner.setAttribute('stroke', stroke);
  runner.classList.add('lambda-wave__runner');

  svg.append(track, runner);
  return svg;
}

const wavePlacements = [
  ['.site-nav', 'dark', false],
  ['.hero--image', 'dark', true],
  ['.manifesto', 'light', false],
  ['.work-head', 'dark', false],
  ['.project-info', 'dark', false],
  ['.craft', 'light', false],
  ['.method', 'dark', false],
  ['.contact', 'dark', false],
  ['.case-hero', 'dark', false],
  ['.storyboard-section', 'light', false],
  ['.fox-deck-section', 'dark', false],
  ['.case-section', 'dark', false],
  ['.next-project', 'dark', false]
];

let waveIndex = 0;
wavePlacements.forEach(([selector, tone, hero]) => {
  document.querySelectorAll(selector).forEach(el => {
    if (el.querySelector(':scope > .lambda-wave')) return;
    const delay = -(waveIndex * 0.72);
    el.appendChild(createWave({ tone, hero, delay }));
    waveIndex += 1;
  });
});
