import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

export function LearningArchitecture3D() {
  const mountRef = useRef(null)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x08090c, 0.045)

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
    camera.position.set(8.8, 7.4, 15.5)

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
    } catch {
      setUnavailable(true)
      return
    }

    renderer.setClearColor(0x08090c, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.15 : 1.6))
    renderer.shadowMap.enabled = window.innerWidth >= 700
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.18
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.setAttribute('aria-hidden', 'true')
    mount.appendChild(renderer.domElement)

    const world = new THREE.Group()
    world.rotation.y = -0.2
    scene.add(world)

    const aluminum = new THREE.MeshPhysicalMaterial({
      color: 0x4b5564,
      metalness: 0.74,
      roughness: 0.3,
      clearcoat: 0.42,
      clearcoatRoughness: 0.24,
    })
    const satin = new THREE.MeshStandardMaterial({
      color: 0x8e98a7,
      metalness: 0.58,
      roughness: 0.38,
    })
    const smokedGlass = new THREE.MeshPhysicalMaterial({
      color: 0x33415c,
      transmission: 0.36,
      transparent: true,
      opacity: 0.58,
      metalness: 0.15,
      roughness: 0.12,
      thickness: 0.9,
    })
    const blueLight = new THREE.MeshStandardMaterial({
      color: 0x3156a6,
      emissive: 0x3156a6,
      emissiveIntensity: 4.2,
      metalness: 0.3,
      roughness: 0.25,
    })

    const moduleGeometry = new RoundedBoxGeometry(1.8, 0.62, 1.55, 5, 0.1)
    const smallModuleGeometry = new RoundedBoxGeometry(1.28, 0.46, 1.18, 5, 0.08)

    const addModule = (
      position,
      material,
      scale = 1,
    ) => {
      const mesh = new THREE.Mesh(scale === 1 ? moduleGeometry : smallModuleGeometry, material)
      mesh.position.set(...position)
      mesh.scale.setScalar(scale === 1 ? 1 : 0.96)
      mesh.castShadow = true
      mesh.receiveShadow = true
      world.add(mesh)
      return mesh
    }

    for (const side of [-1, 1]) {
      for (let distance = 1; distance <= 5; distance += 1) {
        const x = side * (0.95 + distance * 1.42)
        const y = 2.25 - distance * 0.47
        const z = (distance % 2 === 0 ? 0.42 : -0.18) + side * 0.1
        addModule([x, y, z], distance === 1 ? satin : aluminum)
      }

      addModule([side * 4.9, 0.96, side * 1.55], satin, 0.8)
      addModule([side * 6.15, 0.55, side * 2.25], aluminum, 0.8)
    }

    const bridge = new THREE.Mesh(
      new RoundedBoxGeometry(3.2, 0.42, 1.4, 7, 0.11),
      satin,
    )
    bridge.position.set(0, 2.55, 0)
    bridge.castShadow = true
    bridge.receiveShadow = true
    world.add(bridge)

    const glassMarker = new THREE.Mesh(
      new RoundedBoxGeometry(1.05, 1.65, 0.32, 7, 0.16),
      smokedGlass,
    )
    glassMarker.position.set(0, 3.62, 0)
    glassMarker.rotation.y = -0.12
    glassMarker.castShadow = true
    world.add(glassMarker)

    const lightRail = new THREE.Mesh(new THREE.BoxGeometry(2.85, 0.035, 0.06), blueLight)
    lightRail.position.set(0, 2.29, 0.7)
    world.add(lightRail)

    const pathwayRails = []
    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.025, 0.035), blueLight)
      rail.position.set(side * 4.2, 0.18, 0.9)
      rail.rotation.z = side * -0.16
      rail.material = blueLight.clone()
      ;rail.material.emissiveIntensity = 2
      pathwayRails.push(rail)
      world.add(rail)
    }

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(42, 34),
      new THREE.MeshStandardMaterial({
        color: 0x090b0f,
        metalness: 0.22,
        roughness: 0.74,
      }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.62
    ground.receiveShadow = true
    scene.add(ground)

    const ambient = new THREE.HemisphereLight(0xb7c1d0, 0x08090c, 1.25)
    scene.add(ambient)

    const key = new THREE.SpotLight(0xf2f3f5, 620, 38, Math.PI / 4.8, 0.58, 1.7)
    key.position.set(-7, 13, 9)
    key.target.position.set(0, 1.4, 0)
    key.castShadow = window.innerWidth >= 700
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.bias = -0.0003
    scene.add(key, key.target)

    const rim = new THREE.SpotLight(0x5576ad, 220, 30, Math.PI / 4.2, 0.72, 1.8)
    rim.position.set(8, 5, -8)
    rim.target.position.set(0, 2.2, 0)
    scene.add(rim, rim.target)

    const topFill = new THREE.DirectionalLight(0xd7dce5, 3.2)
    topFill.position.set(0, 8, 1)
    scene.add(topFill)

    const cameraFill = new THREE.PointLight(0xc8d1e0, 115, 26, 1.7)
    cameraFill.position.set(6, 5, 11)
    scene.add(cameraFill)

    const targetPointer = new THREE.Vector2()
    const currentPointer = new THREE.Vector2()
    let scrollDepth = 0
    let visible = true
    let animationFrame = 0

    const pointCamera = () => camera.lookAt(0, 1.45, 0)

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect()
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      pointCamera()
    }

    const onPointerMove = (event) => {
      const rect = mount.getBoundingClientRect()
      targetPointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
      targetPointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2
    }

    const onPointerLeave = () => targetPointer.set(0, 0)

    const onScroll = () => {
      const rect = mount.getBoundingClientRect()
      scrollDepth = THREE.MathUtils.clamp(-rect.top / Math.max(rect.height, 1), 0, 1)
    }

    const render = () => {
      currentPointer.lerp(targetPointer, 0.045)
      world.rotation.y = -0.2 + currentPointer.x * 0.08 + scrollDepth * 0.12
      world.rotation.x = currentPointer.y * 0.025
      camera.position.x = 8.8 + currentPointer.x * 0.58
      camera.position.y = 7.4 - currentPointer.y * 0.24 + scrollDepth * 0.8
      camera.position.z = 15.5 - scrollDepth * 1.2
      pointCamera()
      renderer.render(scene, camera)
      mount.parentElement?.classList.add('is-ready')
    }

    const animate = () => {
      if (!visible) return
      render()
      animationFrame = window.requestAnimationFrame(animate)
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !reducedMotion && !animationFrame) animate()
      if (!visible && animationFrame) {
        window.cancelAnimationFrame(animationFrame)
        animationFrame = 0
      }
    })
    observer.observe(mount)

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)
    mount.addEventListener('pointermove', onPointerMove)
    mount.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('scroll', onScroll, { passive: true })
    resize()
    onScroll()
    if (reducedMotion) render()
    else animate()

    return () => {
      observer.disconnect()
      resizeObserver.disconnect()
      mount.removeEventListener('pointermove', onPointerMove)
      mount.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('scroll', onScroll)
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      world.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return
        child.geometry.dispose()
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((material) => material.dispose())
      })
      ground.geometry.dispose()
      ;ground.material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div className={`learning-architecture ${unavailable ? 'is-unavailable' : ''}`}>
      <div className="learning-architecture-fallback" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1791883143730-659fa9d4065b?auto=format&fit=crop&w=1800&q=90"
          alt=""
        />
      </div>
      <div ref={mountRef} className="learning-architecture-canvas" />
    </div>
  )
}
