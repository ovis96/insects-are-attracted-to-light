requirejs(["./helper"], function() {
  const GLOBAL_COLOR = '#ffffff';
  const WHITE = 'white';
  const BLACK = 'black';

  const randomColor = () => {
    const r = Math.floor(255 * Math.random());
    const g = Math.floor(255 * Math.random());
    const b = Math.floor(255 * Math.random());
    return `rgb(${r}, ${g}, ${b})`;
  }

  const canvas = document.querySelector('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const c = canvas.getContext('2d');

  const mouse = {
    x: undefined,
    y: undefined,
    radius: 150,
    dx: 1,
    dy: 1,
  };
  document.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  })



  const NUMBER_OF_CIRCLES = 100;
  const RADIUS = 1;
  const ANGLE = 2*Math.PI/3;



  function Circle(x, y, radius, color, index, isMouse) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.index = index;
    this.dx = Math.random() * 10 - 5;
    this.dy = Math.random() * 10 - 5;
    this.speed = Math.random() * 4 + 1;
    this.isMouse = isMouse;

    this.draw = () => {
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
      c.strokeStyle = this.color ? this.color : 'black';
      c.fillStyle = this.color ? this.color : 'black';
      c.fill();
      c.stroke()

      const dxyP = {
        x: this.dx,
        y: this.dy,
      };
      const dxyN = {
        x: this.dx,
        y: this.dy,
      };
      rotate(dxyP, ANGLE/2, false);
      rotate(dxyN, ANGLE/2, true);
      if (!this.isMouse) { // drawing hands/legs of insects
        c.beginPath();
        c.moveTo(this.x, this.y);

        const dist = Math.sqrt(square(dxyP.x) + square(dxyP.y));
        c.lineTo(this.x + dxyP.x/dist*radius*3, this.y+dxyP.y/dist*radius*3);
        c.stroke();
        
        c.beginPath();
        c.moveTo(this.x, this.y);
        c.lineTo(this.x + dxyN.x/dist*radius*3, this.y+dxyN.y/dist*radius*3);
        c.stroke();
      }
    }

    this.move = () => {
      let dist = Math.sqrt(square(this.dx) + square(this.dy))
      let upX = this.dx/dist*this.speed;
      let upY = this.dy/dist*this.speed;
      // check out of boundary
      if (this.x + upX - this.radius < 0 || this.x + upX + this.radius > window.innerWidth) {
        this.dx *= -1;
      }
      if (this.y + upY - this.radius < 0 || this.y + upY + this.radius > window.innerHeight) {
        this.dy *= -1;
      }
      

      for (let i = 0; i<NUMBER_OF_CIRCLES; i++) {
        if (i === this.index) continue;
        if (doesCollide(circles[i], this)) {
          const dirForMe = giveMeDirection(this, circles[i]);
          const dirForHim = giveMeDirection(circles[i], this);
          this.dx = dirForMe.x;
          this.dy = dirForMe.y;
          circles[i].dx = dirForHim.x;
          circles[i].dy = dirForHim.y;
          this.color = WHITE;
          break;
        }
      }

      if (doesCollide(mouse, this)) { // collide with light
        const newDirection = giveMeDirection(this, mouse);
        this.color = BLACK;
        if (cannotReturn(mouse, this)) { // if it is inside the light speed is lower and get random direction (get mad)
          const dxy = getRandomDirection(this);
          this.dx = dxy.x;
          this.dy = dxy.y;
          if (this.speed !== 1) {
            this.prevSpeed = this.speed;
            this.speed = 1;
          }
        } else if (!doesCollideClosely(mouse, this) && Math.random() < 0.1) { // if insects collide with light, 10% can go out
          this.dx = newDirection.x;
          this.dy = newDirection.y;
          this.speed = this.prevSpeed || Math.random() * 5;
        } else {
          this.speed = this.prevSpeed || Math.random() * 5;
        }
      } else {
        this.speed = this.prevSpeed || Math.random() * 5
        this.color = WHITE;
      }

      // move
      dist = Math.sqrt(square(this.dx) + square(this.dy))
      upX = this.dx/dist*this.speed;
      upY = this.dy/dist*this.speed;
      this.x += upX;
      this.y += upY;
    }
  }

  // create insects
  const circles = [];

  for (let i = 0; i<NUMBER_OF_CIRCLES; i++)
  {
    const radius = RADIUS;
    const x = Math.random() * (window.innerWidth - radius * 2) + radius;
    const y = Math.random() * (window.innerHeight - radius * 2) + radius;
    const nowCircle = new Circle(x, y, radius, WHITE, i, false)
    let flag = 0;
    for (let j = 0; j<i; j++) {
      if (doesCollide(nowCircle, circles[j])) {
        flag = 1;
        break;
      }
    }
    if (flag) { // intersected with another circle so cancel this circle find a new one
      i --;
    } else {
      circles.push(nowCircle);
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const mouseCircle = new Circle(mouse.x, mouse.y, mouse.radius, 'rgba(255, 255, 255, 1)', null, true);
    mouseCircle.draw();
    for (let i = 0; i<NUMBER_OF_CIRCLES; i++) {
      circles[i].move();
      circles[i].draw();
    }
  }
  animate(); // animate

  setInterval(() => { // change direction of insects every 1 sec
    for (let i = 0; i<NUMBER_OF_CIRCLES; i++) {
      const circle = circles[i];
      if (Math.random() < 7) {
        if (canSeeLight(circle, mouse, ANGLE)) { // if insect can see the light center
          circles[i].dx = mouse.x - circles[i].x;
          circles[i].dy = mouse.y - circles[i].y;
        } else {
          const dxy = getRandomDirection(circles[i]);
          circles[i].dx = dxy.x;
          circles[i].dy = dxy.y;
        }
      } 
      if (Math.random() < 0.4) { // give random direction make it alive
        const dxy = getRandomDirection(circles[i]);
        circles[i].dx = dxy.x;
        circles[i].dy = dxy.y;
      }
    }
  }, 1000);
});
