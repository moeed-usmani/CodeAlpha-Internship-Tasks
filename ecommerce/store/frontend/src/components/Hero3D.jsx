import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Hero3D() {
  const mount = useRef(null);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    // WebGL na chale (ya size 0 ho) to crash nahi, bas background rahega
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      console.warn('WebGL unavailable, skipping 3D hero', e);
      return;
    }
    const W = () => el.clientWidth || window.innerWidth;
    const H = () => el.clientHeight || window.innerHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W() / H(), 0.1, 100);
    camera.position.z = 7;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(W(), H());
    el.appendChild(renderer.domElement);

    const gold = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 1, roughness: 0.18 });
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.35, 0.42, 260, 36, 2, 3), gold);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.015, 16, 200), new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.5 }));
    ring.rotation.x = Math.PI / 2.4;
    const ring2 = ring.clone();
    ring2.scale.setScalar(1.25);
    ring2.rotation.set(Math.PI / 1.8, 0.4, 0);
    scene.add(knot, ring, ring2);

    // floating gold dust
    const N = 700;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N * 3; i++) pos[i] = (Math.random() - 0.5) * 18;
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xf5d77a, size: 0.025, transparent: true, opacity: 0.8 }));
    scene.add(dust);

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const l1 = new THREE.PointLight(0xffe6a8, 90, 30); l1.position.set(5, 4, 6);
    const l2 = new THREE.PointLight(0x7a5cff, 60, 30); l2.position.set(-6, -3, 4);
    scene.add(l1, l2);

    const mouse = { x: 0, y: 0 };
    const onMove = (e) => { mouse.x = (e.clientX / window.innerWidth - 0.5) * 2; mouse.y = (e.clientY / window.innerHeight - 0.5) * 2; };
    const onResize = () => {
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('resize', onResize);

    let raf;
    let visible = true;
    const onVis = () => { visible = !document.hidden; };
    document.addEventListener('visibilitychange', onVis);
    const clock = new THREE.Clock();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const t = clock.getElapsedTime();
      knot.rotation.x = t * 0.25 + mouse.y * 0.4;
      knot.rotation.y = t * 0.35 + mouse.x * 0.5;
      ring.rotation.z = t * 0.2;
      ring2.rotation.z = -t * 0.15;
      dust.rotation.y = t * 0.03;
      knot.position.y = Math.sin(t) * 0.15;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
      [knot.geometry, ring.geometry, dustGeo].forEach((g) => g.dispose());
      [gold, dust.material, ring.material].forEach((m) => m.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);

  return <div ref={mount} className="hero3d" />;
}
