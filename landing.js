// landing.js
// - lightweight particle background on canvas
// - subtle card-stack tilt tied to mouse movement
// - respects prefers-reduced-motion

(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Canvas Particles ---------- */
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  const particles = [];
  const PARTICLE_COUNT = Math.round((width * height) / 90000); // density

  function rand(min, max){ return Math.random() * (max - min) + min; }

  class Particle {
    constructor(){
      this.reset();
    }
    reset(){
      this.x = rand(0, width);
      this.y = rand(0, height);
      this.vx = rand(-0.2, 0.6) * 0.6;
      this.vy = rand(-0.15, 0.15);
      this.r = rand(0.6, 2.8);
      this.alpha = rand(0.06, 0.25);
      this.h = rand(170, 190); // tealish hue
    }
    step(){
      this.x += this.vx;
      this.y += this.vy;
      if(this.x > width + 20 || this.x < -20 || this.y < -20 || this.y > height + 20) this.reset();
    }
    draw(){
      ctx.beginPath();
      ctx.fillStyle = `hsla(${this.h}, 95%, 60%, ${this.alpha})`;
      ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fill();
    }
  }

  function initParticles(){
    particles.length = 0;
    const count = Math.max(12, PARTICLE_COUNT);
    for(let i=0;i<count;i++) particles.push(new Particle());
  }

  function onResize(){
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
  }
  window.addEventListener('resize', onResize, {passive:true});

  function renderCanvas(){
    ctx.clearRect(0,0,width,height);

    // soft background radial glow center-left
    const g = ctx.createRadialGradient(width*0.18, height*0.25, 50, width*0.18, height*0.25, Math.max(width,height));
    g.addColorStop(0, 'rgba(61,189,181,0.08)');
    g.addColorStop(0.5, 'rgba(61,189,181,0.02)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,width,height);

    particles.forEach(p => {
      p.step();
      p.draw();
    });

    // subtle connecting lines between near particles
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < 90){
          ctx.beginPath();
          ctx.strokeStyle = `rgba(61,189,181,${Math.max(0, 0.08 - (dist/1000))})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    if(!prefersReduced) requestAnimationFrame(renderCanvas);
  }

  // Init
  onResize();
  if(!prefersReduced) renderCanvas();

  /* ---------- Card stack tilt ---------- */
  const stack = document.getElementById('cardStack');
  if(stack && !prefersReduced){
    const bounds = stack.getBoundingClientRect();
    const centerX = bounds.left + bounds.width/2;
    const centerY = bounds.top + bounds.height/2;

    function handleMove(e){
      const x = (e.clientX - centerX) / bounds.width; // -0.5 -> 0.5
      const y = (e.clientY - centerY) / bounds.height;
      const rotY = x * 14; // degrees
      const rotX = -y * 10;
      stack.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg) translateZ(0)`;
    }

    function handleLeave(){
      stack.style.transform = `rotateY(0deg) rotateX(0deg)`;
    }

    // mousemove on parent container
    const visual = document.querySelector('.hero-visual');
    if(visual){
      visual.addEventListener('mousemove', handleMove, {passive:true});
      visual.addEventListener('mouseleave', handleLeave, {passive:true});
    }
  }

  // Accessibility: if reduced motion, stop animations
  if(prefersReduced){
    canvas.style.display = 'none';
  }
})();
