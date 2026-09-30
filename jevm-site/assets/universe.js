import { orbitPosition, projectPosition, pickPlanet, workflowAt } from './orbit-model.mjs?v=20260928-9';

(() => {
  const universe = document.querySelector('.universe');
  if (!universe) return;
  const canvas = universe.querySelector('canvas');
  const motion = universe.querySelector('[data-action="motion"]');
  const reset = universe.querySelector('[data-action="reset"]');
  const buttons = [...universe.querySelectorAll('[data-market]')];
  const steps = [...universe.querySelectorAll('[data-step]')];
  const readout = universe.querySelector('.flow-readout');
  const coreStatus = universe.querySelector('.core-status');
  const executionLabel = universe.querySelector('.execution-orbit-label');
  const planetLabel = document.createElement('div');
  planetLabel.className = 'planet-label';
  planetLabel.setAttribute('aria-hidden', 'true');
  universe.querySelector('.cosmos-stage').append(planetLabel);
  const mobile = matchMedia('(max-width: 600px)');
  const chinese = document.documentElement.lang === 'zh-CN';
  const help = universe.querySelector('#scene-help');
  const interactiveHelp = help.textContent;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let targetColor = buttons[0].dataset.color.split(',').map(Number);
  let color = [...targetColor];
  let rotation = [-0.17, 0.32];
  let targetRotation = [...rotation];
  let running = !reducedMotion.matches;
  let visible = true;
  let frame = 0;
  let lastTime = 0;
  let elapsed = 0;
  let cycleTime = 0;
  let activeStep = -1;
  let selectedMarket = 0;
  let hovered = false;
  let focused = false;
  let hoveredPlanet = -1;
  let planetPositions = [];
  let dragging = null;
  let gl;

  // Keep market content independent of WebGL so the accessible controls also work without a GPU.
  buttons.forEach((button, index) => button.addEventListener('click', () => {
    selectedMarket = index;
    buttons.forEach(item => {
      const selected = item === button;
      item.setAttribute('aria-pressed', String(selected));
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
    targetColor = button.dataset.color.split(',').map(Number);
    universe.style.setProperty('--market-color', 'rgb(' + targetColor.map(value => Math.round(value * 255)).join(',') + ')');
    activeStep = -1;
    updateStep(workflowAt(cycleTime).step);
    requestFrame();
  }));

  const vertexSource = `
    attribute vec2 position;
    void main() { gl_Position = vec4(position, 0.0, 1.0); }
  `;
  const fragmentSource = `
    precision highp float;
    uniform vec2 resolution;
    uniform vec2 rotation;
    uniform vec3 accent;
    uniform float time;
    uniform float cameraDistance;
    uniform float selected;
    uniform float highlighted;
    uniform float workflowStep;
    uniform vec3 planets[5];
    uniform vec3 planetColors[5];
    uniform vec3 executionTarget;

    float hash(vec3 p) {
      p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }
    float noise(vec3 p) {
      vec3 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                     mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                 mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                     mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
    }
    mat3 turn(vec2 angle) {
      float cx = cos(angle.x), sx = sin(angle.x);
      float cy = cos(angle.y), sy = sin(angle.y);
      return mat3(cy,0.0,-sy, 0.0,1.0,0.0, sy,0.0,cy)
           * mat3(1.0,0.0,0.0, 0.0,cx,sx, 0.0,-sx,cx);
    }
    vec2 project(vec3 p, mat3 model) {
      vec3 v = vec3(dot(model[0], p), dot(model[1], p), dot(model[2], p));
      return v.xy * 1.5 / (cameraDistance - v.z);
    }
    void main() {
      vec2 uv = (gl_FragCoord.xy - resolution * 0.5) / resolution.y;
      mat3 model = turn(rotation);
      vec3 ro = model * vec3(0.0, 0.0, cameraDistance);
      vec3 rd = model * normalize(vec3(uv * 2.0, -3.0));
      float b = dot(ro, rd);
      float h = b * b - dot(ro, ro) + 1.0;
      float depth = 1000.0;
      float silhouette = length(cross(ro, rd));
      float halo = exp(-max(silhouette - 1.0, 0.0) * 13.0);
      vec3 col = accent * 0.48;
      float alpha = halo * 0.14;

      // A moving packet explains direction: inputs to Jev, approved intent to EVM, receipt back.
      for (int i = 0; i < 5; i++) {
        bool chosen = abs(float(i) - selected) < 0.1;
        if (workflowStep < 2.0 || chosen) {
          vec2 asset = project(planets[i], model);
          vec2 start = workflowStep < 2.0 ? asset : vec2(0.0);
          vec2 end = workflowStep < 2.0 ? vec2(0.0) : asset;
          if (workflowStep > 3.5) {
            vec2 execution = project(executionTarget, model);
            start = workflowStep < 4.5 ? asset : execution;
            end = workflowStep < 4.5 ? execution : vec2(0.0);
          }
          vec2 line = end - start;
          float along = clamp(dot(uv - start, line) / max(dot(line,line), 0.0001), 0.0, 1.0);
          float distanceToLine = length(uv - start - line * along);
          float trail = exp(-distanceToLine * 900.0) * 0.16;
          float packet = exp(-length(uv - mix(start, end, fract(time * 0.34 + float(i) * 0.18))) * 260.0);
          vec3 signalColor = workflowStep < 3.0 ? vec3(0.42,0.8,1.0) : vec3(0.95,0.73,0.4);
          col = mix(col, signalColor, min(1.0, trail + packet));
          alpha = max(alpha, trail + packet * 0.95);
        }
      }

      // The sphere is intersected in object space; its surface and orbit occlusion rotate together.
      if (h > 0.0) {
        depth = -b - sqrt(h);
        vec3 p = ro + rd * depth;
        vec3 n = normalize(p);
        vec3 light = model * normalize(vec3(-0.65, 0.9, 1.2));
        float diffuse = max(dot(n, light), 0.0);
        float fresnel = pow(1.0 - max(dot(n, -rd), 0.0), 3.2);
        float terrain = noise(p * 3.8) * 0.64 + noise(p * 9.0) * 0.25 + noise(p * 23.0) * 0.11;
        float contour = pow(1.0 - abs(sin((terrain + p.y * 0.29) * 58.0)), 18.0);
        float fineContour = pow(1.0 - abs(sin((terrain + p.y * 0.29) * 116.0)), 22.0);
        float longitude = atan(p.z, p.x);
        float latitude = asin(clamp(p.y, -1.0, 1.0));
        vec2 grid = vec2(longitude * 20.0, latitude * 18.0);
        float gridLine = pow(1.0 - min(abs(sin(grid.x)), abs(sin(grid.y))), 44.0);
        vec2 cell = fract(grid / 3.141593) - 0.5;
        float node = exp(-dot(cell, cell) * 1450.0) * step(0.66, hash(floor(p * 32.0)));
        vec3 base = mix(vec3(0.009, 0.025, 0.049), accent * 0.18, terrain);
        col = base * (0.25 + diffuse * 1.4);
        col += accent * contour * (0.06 + diffuse * 0.28);
        col += accent * fineContour * diffuse * 0.045;
        col += accent * gridLine * 0.085;
        col += vec3(0.75,0.91,1.0) * node * (0.15 + diffuse);
        col += accent * fresnel * (0.32 + diffuse * 0.9);
        col += vec3(0.68,0.86,1.0) * pow(max(dot(reflect(-light,n), -rd), 0.0), 80.0) * 0.36;
        if (workflowStep < 1.5) col += accent * exp(-pow(p.y - sin(time * 0.8), 2.0) * 220.0) * (0.08 + diffuse * 0.2);
        alpha = 1.0;
      }

      // Small spheres use the same ray/depth test as the core: far-side planets are truly occluded.
      for (int i = 0; i < 5; i++) {
        vec3 origin = ro - planets[i];
        float radius = 0.135 + float(i) * 0.008;
        float pb = dot(origin, rd);
        float ph = pb * pb - dot(origin, origin) + radius * radius;
        bool chosen = abs(float(i) - selected) < 0.1;
        if (ph > 0.0) {
          float hit = -pb - sqrt(ph);
          if (hit > 0.0 && hit < depth) {
            depth = hit;
            vec3 n = normalize(ro + rd * hit - planets[i]);
            vec3 light = model * normalize(vec3(-0.65,0.9,1.2));
            float diffuse = max(dot(n,light),0.0);
            float rim = pow(1.0 - max(dot(n,-rd),0.0),2.8);
            float texture = noise(n * (4.0 + float(i))) * 0.25 + 0.75;
            vec3 tint = planetColors[i];
            if (workflowStep > 0.5 && chosen) tint = mix(tint,vec3(0.55,1.0,0.78),0.5);
            col = tint * texture * (0.08 + diffuse * 0.7) + tint * rim * 0.65;
            col += vec3(0.9) * pow(max(dot(reflect(-light,n),-rd),0.0),36.0) * 0.45;
            if (workflowStep > 1.5 && !chosen) col *= 0.5;
            alpha = 1.0;
          }
        }
      }

      // Planet halos are translucent, but the core and every solid planet still occlude them.
      for (int i = 0; i < 5; i++) {
        vec3 origin = ro - planets[i];
        float radius = 0.135 + float(i) * 0.008;
        float emphasis = (abs(float(i) - selected) < 0.1 ? 1.0 : 0.0)
          + (abs(float(i) - highlighted) < 0.1 ? 0.65 : 0.0);
        vec3 tint = planetColors[i];
        float auraDepth = -dot(origin, rd);
        float edge = length(cross(origin, rd)) / radius;
        if (auraDepth > 0.0 && auraDepth < depth) {
          float glow = exp(-max(edge - 1.0, 0.0) * 4.2) * smoothstep(0.98, 1.08, edge);
          float opacity = glow * (0.18 + emphasis * 0.1);
          col = mix(col, tint * 1.25, opacity);
          alpha = max(alpha, opacity);
        }

        // Each local ring has its own tilt; its traveling highlight uses the pausable scene clock.
        vec3 normal = normalize(vec3(0.25 + sin(float(i) * 1.4) * 0.3, 0.8, 0.55 + cos(float(i)) * 0.2));
        float denom = dot(rd, normal);
        if (abs(denom) > 0.001) {
          float ringDepth = -dot(origin, normal) / denom;
          if (ringDepth > 0.0 && ringDepth < depth) {
            vec3 p = origin + rd * ringDepth;
            float distanceToRing = abs(length(p) - radius * 1.65);
            float width = max(radius * 0.035, ringDepth / resolution.y);
            float ring = 1.0 - smoothstep(width * 0.3, width, distanceToRing);
            float bloom = exp(-distanceToRing / width * 0.6);
            vec3 axis = normalize(cross(normal, vec3(0.0,0.0,1.0)));
            float phase = atan(dot(p, cross(normal, axis)), dot(p, axis));
            float pulse = pow(max(cos(phase - time * 0.55 - float(i) * 1.7), 0.0), 18.0);
            float opacity = min(0.95, ring * (0.4 + emphasis * 0.2 + pulse * 0.3) + bloom * 0.08);
            col = mix(col, tint * (0.8 + pulse * 0.7), opacity);
            alpha = max(alpha, opacity);
          }
        }
      }

      // Two intersecting orbital planes give depth cues, with far arcs hidden behind the core.
      for (int i = 0; i < 2; i++) {
        vec3 normal = i == 0 ? normalize(vec3(0.14, 0.88, 0.46)) : normalize(vec3(-0.64, 0.63, 0.32));
        float denom = dot(rd, normal);
        float t = -dot(ro, normal) / denom;
        vec3 p = ro + rd * t;
        float radius = i == 0 ? 1.63 : 1.91;
        float width = max(0.003, 3.2 / resolution.y);
        float ring = 1.0 - smoothstep(width * 0.3, width, abs(length(p) - radius));
        vec3 axis = normalize(cross(normal, vec3(0.0,0.0,1.0)));
        float phase = atan(dot(p, cross(normal, axis)), dot(p, axis));
        float pulse = pow(max(cos(phase - time * 0.25 - float(i) * 2.8), 0.0), 70.0);
        float dots = pow(max(cos(phase * 48.0), 0.0), 34.0);
        if (abs(denom) > 0.001 && t > 0.0 && t < depth) {
          float opacity = ring * (0.3 + pulse * 0.8 + dots * 0.2 + (workflowStep > 2.5 && i == 1 ? 0.25 : 0.0));
          // Warm outer orbit distinguishes contract execution from the decision core.
          vec3 orbitColor = i == 0 ? accent : vec3(0.84, 0.68, 0.44);
          col = mix(col, orbitColor * (0.4 + pulse * 1.3), opacity);
          alpha = max(alpha, opacity);
        }
      }
      vec2 starGrid = gl_FragCoord.xy / 85.0;
      vec2 starCell = floor(starGrid);
      float seed = hash(vec3(starCell, 3.0));
      vec2 starPos = vec2(seed, hash(vec3(starCell, 8.0)));
      float star = exp(-length(fract(starGrid) - starPos) * 220.0) * step(0.72, seed);
      if (depth == 1000.0) {
        col = mix(col, vec3(0.65,0.78,0.9), star);
        alpha = max(alpha, star * 0.6);
      }
      gl_FragColor = vec4(col, alpha);
    }
  `;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  }

  let program;
  let uniforms;
  function initialize() {
    gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' });
    if (!gl) throw new Error('WebGL unavailable');
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    uniforms = Object.fromEntries(['resolution', 'rotation', 'accent', 'time', 'cameraDistance', 'selected', 'highlighted', 'workflowStep', 'planets[0]', 'planetColors[0]', 'executionTarget'].map(name => [name, gl.getUniformLocation(program, name)]));
    gl.uniform3fv(uniforms['planetColors[0]'], buttons.flatMap(button => button.dataset.color.split(',').map(Number)));
    universe.classList.add('is-ready');
    help.textContent = interactiveHelp;
    canvas.tabIndex = 0;
    motion.disabled = reset.disabled = false;
    requestFrame();
  }

  function fallback() {
    universe.classList.remove('is-ready');
    motion.disabled = reset.disabled = true;
    canvas.tabIndex = -1;
    help.textContent = document.documentElement.lang === 'zh-CN'
      ? '静态视图 · 仍可点选市场' : 'Static view · Market selection remains available';
    cancelAnimationFrame(frame);
    frame = 0;
    program = null;
    setMotion(false);
    executionLabel.removeAttribute('style');
  }

  function requestFrame() {
    if (program && !frame && visible && !document.hidden) frame = requestAnimationFrame(render);
  }

  function render(now) {
    frame = 0;
    // Cap pixel density and frame rate; suspend entirely when the scene is offscreen or paused.
    if (!visible || document.hidden || !program) return;
    if (now - lastTime < 32) { requestFrame(); return; }
    const delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const density = Math.min(devicePixelRatio || 1, 1.5);
    const width = Math.round(canvas.clientWidth * density);
    const height = Math.round(canvas.clientHeight * density);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
    const playing = running && !dragging && !hovered && !focused;
    if (playing) { elapsed += delta; cycleTime += delta; }
    const ease = reducedMotion.matches ? 1 : 0.12;
    rotation = rotation.map((value, i) => value + (targetRotation[i] - value) * ease);
    color = color.map((value, i) => value + (targetColor[i] - value) * ease);
    const distance = 6.8;
    const executionTarget = mobile.matches ? [0, -2.0, 0] : [2.7, -0.75, 0];
    // Mobile reserves a normal-flow label row; clear any desktop projection after resizing.
    if (mobile.matches) {
      executionLabel.removeAttribute('style');
    } else {
      const executionPoint = projectPosition(executionTarget, rotation, canvas.clientWidth, canvas.clientHeight, distance);
      executionLabel.style.left = `${executionPoint.x}px`;
      executionLabel.style.top = `${executionPoint.y}px`;
    }
    const positions = buttons.map((button, index) => orbitPosition(index, elapsed));
    planetPositions = positions;
    const projectedPlanets = positions.map(point => projectPosition(point, rotation, canvas.clientWidth, canvas.clientHeight, distance));
    const labelIndex = hoveredPlanet < 0 ? selectedMarket : hoveredPlanet;
    const labelPoint = projectedPlanets[labelIndex];
    planetLabel.textContent = buttons[labelIndex].querySelector('strong').textContent;
    planetLabel.style.left = `${labelPoint.x}px`;
    planetLabel.style.top = `${labelPoint.y}px`;
    planetLabel.hidden = labelPoint.occluded;
    const workflow = workflowAt(cycleTime);
    updateStep(workflow.step);
    universe.style.setProperty('--step-progress', workflow.progress);
    gl.uniform2f(uniforms.resolution, width, height);
    gl.uniform2fv(uniforms.rotation, rotation);
    gl.uniform3fv(uniforms.accent, color);
    gl.uniform1f(uniforms.time, elapsed);
    gl.uniform1f(uniforms.cameraDistance, distance);
    gl.uniform1f(uniforms.selected, selectedMarket);
    gl.uniform1f(uniforms.highlighted, hoveredPlanet >= 0 ? hoveredPlanet : buttons.indexOf(document.activeElement));
    gl.uniform1f(uniforms.workflowStep, workflow.step);
    gl.uniform3fv(uniforms.executionTarget, executionTarget);
    gl.uniform3fv(uniforms['planets[0]'], positions.flat());
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    const settling = rotation.some((value, i) => Math.abs(value - targetRotation[i]) > 0.0001)
      || color.some((value, i) => Math.abs(value - targetColor[i]) > 0.0001);
    if (playing || settling) requestFrame();
  }

  const badges = buttons.map(button => {
    const badge = document.createElement('span');
    badge.className = 'planet-classification';
    badge.setAttribute('aria-hidden', 'true');
    button.querySelector('.node-copy').append(badge);
    return badge;
  });
  function updateStep(step) {
    if (step === activeStep) return;
    activeStep = step;
    universe.dataset.phase = step;
    steps.forEach((button, index) => {
      button.setAttribute('aria-pressed', String(index === step));
      document.getElementById(`flow-${index}`).hidden = index !== step;
    });
    coreStatus.textContent = step < 3 ? steps[step].querySelector('strong').textContent
      : (chinese ? ['等待独立核验', '意图已交付', '状态已更新'] : ['Awaiting policy', 'Intent delivered', 'State updated'])[step - 3];
    badges.forEach((badge, index) => {
      badge.textContent = step === 0 ? '' : index === selectedMarket
        ? (chinese ? '候选' : 'Candidate')
        : (index + selectedMarket) % 2 === 0 ? (chinese ? '观察' : 'Watch') : (chinese ? '排除' : 'Exclude');
    });
  }

  // Manual stepping stays usable without WebGL and never submits a transaction.
  steps.forEach((button, index) => button.addEventListener('click', () => {
    setMotion(false);
    cycleTime = index * 5;
    updateStep(index);
    requestFrame();
  }));
  buttons.forEach((button, index) => {
    button.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse') return;
      hovered = true;
      hoveredPlanet = index;
      requestFrame();
    });
    button.addEventListener('pointerleave', () => { hovered = false; hoveredPlanet = -1; requestFrame(); });
  });
  // Pause while keyboard users explore the scene or steps; playback controls remain explicit overrides.
  [canvas, ...buttons, ...steps].forEach(control => {
    control.addEventListener('focus', () => { focused = true; requestFrame(); });
    control.addEventListener('blur', () => { focused = false; requestFrame(); });
  });

  function setMotion(value) {
    running = value;
    motion.setAttribute('aria-pressed', String(value));
    motion.textContent = value ? motion.dataset.pause : motion.dataset.play;
    // Avoid unsolicited screen-reader announcements while the automatic cycle is playing.
    readout.setAttribute('aria-live', value ? 'off' : 'polite');
    requestFrame();
  }
  motion.addEventListener('click', () => setMotion(!running));
  reset.addEventListener('click', () => {
    targetRotation = [-0.17, 0.32];
    elapsed = 0;
    cycleTime = 0;
    updateStep(0);
    setMotion(!reducedMotion.matches);
    requestFrame();
  });
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !program) return;
    const hit = planetAt(event);
    if (hit >= 0) { buttons[hit].click(); setMotion(false); return; }
    dragging = { id: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
    setMotion(false);
  });
  canvas.addEventListener('pointermove', event => {
    if (!dragging) {
      if (event.pointerType === 'mouse') {
        hoveredPlanet = planetAt(event);
        hovered = hoveredPlanet >= 0;
        canvas.style.cursor = hovered ? 'pointer' : 'grab';
        requestFrame();
      }
      return;
    }
    if (dragging.id !== event.pointerId) return;
    targetRotation[1] += (event.clientX - dragging.x) * 0.006;
    targetRotation[0] = Math.max(-1, Math.min(1, targetRotation[0] + (event.clientY - dragging.y) * 0.004));
    dragging.x = event.clientX;
    dragging.y = event.clientY;
    requestFrame();
  });
  function planetAt(event) {
    const rect = canvas.getBoundingClientRect();
    return pickPlanet(event.clientX - rect.left, event.clientY - rect.top, planetPositions, rotation, canvas.clientWidth, canvas.clientHeight, 6.8);
  }
  canvas.addEventListener('pointerleave', () => { hovered = false; hoveredPlanet = -1; requestFrame(); });
  function release() { dragging = null; }
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('lostpointercapture', release);
  canvas.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    setMotion(false);
    targetRotation[1] += event.key === 'ArrowLeft' ? -0.16 : event.key === 'ArrowRight' ? 0.16 : 0;
    targetRotation[0] = Math.max(-1, Math.min(1, targetRotation[0] + (event.key === 'ArrowUp' ? -0.12 : event.key === 'ArrowDown' ? 0.12 : 0)));
    requestFrame();
  });
  reducedMotion.addEventListener('change', () => setMotion(!reducedMotion.matches));
  mobile.addEventListener('change', () => {
    hovered = false;
    hoveredPlanet = -1;
    requestFrame();
  });
  document.addEventListener('visibilitychange', requestFrame);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    requestFrame();
  }).observe(canvas);
  new ResizeObserver(requestFrame).observe(canvas);
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); fallback(); });
  canvas.addEventListener('webglcontextrestored', () => {
    try { initialize(); } catch { fallback(); }
  });
  setMotion(running);
  updateStep(0);
  try { initialize(); } catch (error) {
    console.warn('Jev scene uses its static fallback:', error.message);
    fallback();
  }
})();
