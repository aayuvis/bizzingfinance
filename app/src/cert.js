/* cert.js — a certificate for a world finished (FAMILY-STANDARD §13, T9).

   What triggers one: a place on the journey whose chapters are all finished.
   What it shows: the child's first name, their avatar, Pip, and the chapters finished (finished, not mastered — mastery.js alone says that).
   How it is shared: as a PNG drawn ON THE DEVICE, from the grown-ups' area only. It is
   never uploaded; the grown-up saves it and decides what happens next. */
import { WORLDS, CHAPTERS, chapterDone } from './content.js';
import { plateFor } from './looks.js';
import { avatarSrc } from './avatars.js';

export function earned(c) {
  return WORLDS.map((w, i) => ({ w, i, done: w.chapters.every((ch) => chapterDone(c, ch)) })).filter((x) => x.done)
    .map(({ w, i }) => ({ id: w.id, n: i + 1, name: w.name, chapters: w.chapters.map((id) => (CHAPTERS.find((x) => x.id === id) || {}).title).filter(Boolean) }));
}

const load = (src) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });

export async function draw(c, worldId) {
  const e = earned(c).find((x) => x.id === worldId); if (!e) return null;
  const W = 1600, H = 1131, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  await document.fonts.ready;
  const [plate, face, pip] = await Promise.all([load(plateFor(worldId, false)), load(new URL(avatarSrc(c.avatar), document.baseURI).href), load(new URL('./mascot/pip-cheer.webp', document.baseURI).href)]);
  g.fillStyle = '#FFF8EC'; g.fillRect(0, 0, W, H);
  g.save(); g.beginPath(); g.roundRect(60, 60, W - 120, 380, 36); g.clip();
  g.drawImage(plate, 0, 0, plate.width, plate.height * 0.8, 60, 60, W - 120, 380); g.restore();
  g.strokeStyle = '#3A2A5C'; g.lineWidth = 10; g.beginPath(); g.roundRect(30, 30, W - 60, H - 60, 44); g.stroke();
  g.fillStyle = '#3A2A5C'; g.textAlign = 'center';
  g.font = '800 40px Fraunces, Georgia, serif'; g.fillText('Bizzing Finance', W / 2, 520);
  g.font = '600 34px "Hanken Grotesk", system-ui, sans-serif'; g.fillText('This certificate is for', W / 2, 590);
  g.font = '800 92px Fraunces, Georgia, serif'; g.fillStyle = '#1F8A5B'; g.fillText(c.name, W / 2, 700);
  g.fillStyle = '#3A2A5C'; g.font = '600 36px "Hanken Grotesk", system-ui, sans-serif';
  g.fillText(`who walked every stop of ${e.name}`, W / 2, 770);
  g.font = '500 30px "Hanken Grotesk", system-ui, sans-serif';
  g.fillText(`and learned: ${e.chapters.join(' · ')}`, W / 2, 830);
  g.drawImage(face, 150, 760, 230, 230);
  g.drawImage(pip, W - 400, 740, 260, 260);
  g.font = '500 24px Sono, monospace'; g.fillStyle = '#5B6770';
  g.fillText(new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }), W / 2, 1010);
  return cv;
}
