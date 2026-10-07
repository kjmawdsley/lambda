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
const WAVE_PATH = 'M-120 90 C-80 54 -40 54 0 90 C40 126 80 126 120 90 C160 54 200 54 240 90 C280 126 320 126 360 90 C400 54 440 54 480 90 C520 126 560 126 600 90 C640 54 680 54 720 90 C760 126 800 126 840 90 C880 54 920 54 960 90 C1000 126 1040 126 1080 90 C1120 54 1160 54 1200 90 C1240 126 1280 126 1320 90 C1360 54 1400 54 1440 90 C1480 126 1520 126 1560 90 C1600 54 1640 54 1680 90';

function createWave({ tone = 'dark', hero = false, delay = 0 } = {}) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 1600 180');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('lambda-wave', hero ? 'lambda-wave--hero' : 'lambda-wave--section', `lambda-wave--${tone}`);
  svg.style.setProperty('--wave-delay', `${delay}s`);

  let stroke = tone === 'light' ? '#ffffff' : '#4b19ff';

  if (hero) {
    const defs = document.createElementNS(ns, 'defs');
    const gradient = document.createElementNS(ns, 'linearGradient');
    gradient.id = 'lambda-hero-wave-gradient';
    gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
    gradient.setAttribute('x1', '0');
    gradient.setAttribute('x2', '1600');
    ['0:#f0d85a','34.9:#f0d85a','35.1:#ffffff','100:#ffffff'].forEach(item => {
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
  ['.hero--image', 'dark', true],
  ['.manifesto', 'light', false],
  ['.method', 'dark', false],
  ['.case-hero', 'dark', false]
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
