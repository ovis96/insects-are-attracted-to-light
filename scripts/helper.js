const doesCollideClosely = (a, b) => {
  return Math.abs(dist2(a, b) - square(a.radius+b.radius)) < 5000;
}
const cannotReturn = (a, b) => {
  return dist2(a, b) + 4999 < square(a.radius+b.radius);
}
const doesCollide = (a, b) => dist2(a, b) < square(a.radius+b.radius);
const dist2 = (a, b) => square(a.x-b.x) + square(a.y-b.y);
const square = x => x * x;
const dot = (a, b) => a.x * b.x + a.y * b.y;
const cross = (a, b) => a.x * b.y - a.y * b.x;
const rotate = (p, angle, isClockWise) => {
  if (isClockWise) angle *= -1;
  const y = p.x * Math.sin(angle) + p.y * Math.cos(angle);
  const x = p.x * Math.cos(angle) - p.y * Math.sin(angle);
  p.x = x;
  p.y = y;
};
const angleBetweenVectors = (p, q) => {
  const crossValue = cross(p, q);
  const dotValue = dot(p, q);
  return Math.atan2(crossValue, dotValue);
}

const minus = (a, b) => ({
  x: a.x - b.x,
  y: a.y - b.y,
});

const giveMeDirection = (a, b) => {
  const mDxy = {
    x: -a.dx,
    y: -a.dy,
  }
  const angle = angleBetweenVectors(minus(b, a), mDxy);
  const newDirection = minus(b, a);
  rotate(newDirection, angle, true);
  return newDirection;
}

const getRandomDirection = (circle) => {
  const dxy = {
    x: circle.dx,
    y: circle.dy,
  };
  rotate(dxy, Math.random() * (Math.PI/3), Math.random() < 0.5);
  return dxy;
}

const ZERO_VECTOR = {
  x: 0,
  y: 0,
}

const canSeeLight = (circle, mouse, ANGLE) => { // can see light, in it's insight of angle ANGLE
  const dxyP = {
    x: circle.dx,
    y: circle.dy,
  };
  const dxyN = {
    x: circle.dx,
    y: circle.dy,
  };
  rotate(dxyP, ANGLE/2, true);
  rotate(dxyN, ANGLE/2, false);
  const mouseDxy = {
    x: mouse.x - circle.x,
    y: mouse.y - circle.y,
  };
  return cross(dxyP, mouseDxy) >= 0 && cross(dxyN, mouseDxy) <= 0;
}