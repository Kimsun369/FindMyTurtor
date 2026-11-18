import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

// The stairs mirror the login steps: email lights the lower steps, password
// lights the staircase, and a successful session lights the goal.
export function LearningArchitecture3D({ stage = 0 }) {
  const mountRef = useRef(null)
  const stageRef = useRef(stage)

  useEffect(() => { stageRef.current = stage }, [stage])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x090c0d, 18, 48)

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
    camera.position.set(9, 7.2, 16)
    camera.lookAt(3.8, 1.35, -0.4)

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
    } catch {
      mount.classList.add('learning-architecture-fallback')
      return () => mount.classList.remove('learning-architecture-fallback')
    }
    renderer.setClearColor(0x090c0d, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.shadowMap.enabled = window.innerWidth > 700
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.setAttribute('aria-hidden', 'true')
    mount.appendChild(renderer.domElement)

    const sceneObjects = []
    const stairGroup = new THREE.Group()
    stairGroup.position.x = 5.8
    stairGroup.scale.setScalar(0.76)
    scene.add(stairGroup)
    sceneObjects.push(stairGroup)

    const stone = new THREE.MeshStandardMaterial({ color: 0x69727a, metalness: 0.2, roughness: 0.58 })
    const landingStone = new THREE.MeshStandardMaterial({ color: 0x8f8366, metalness: 0.22, roughness: 0.48 })
    const gold = new THREE.MeshStandardMaterial({ color: 0x9f906b, metalness: 0.38, roughness: 0.36 })
    const treadMaterials = []
    const treadGeometry = new THREE.BoxGeometry(4.25, 0.05, 0.05)
    const stepGeometry = new RoundedBoxGeometry(4.45, 0.42, 0.88, 4, 0.06)

    for (let index = 0; index < 7; index += 1) {
      const y = -0.38 + index * 0.44
      const z = 2.7 - index * 0.91
      const step = new THREE.Mesh(stepGeometry, index === 6 ? landingStone : stone)
      step.position.set(0, y, z)
      step.castShadow = true
      step.receiveShadow = true
      stairGroup.add(step)

      const material = new THREE.MeshStandardMaterial({ color: 0x38433d, emissive: 0x000000, roughness: 0.4 })
      treadMaterials.push(material)
      const tread = new THREE.Mesh(treadGeometry, material)
      tread.position.set(0, y + 0.2, z + 0.39)
      stairGroup.add(tread)
    }

    const landing = new THREE.Mesh(new RoundedBoxGeometry(4.8, 0.32, 1.35, 5, 0.06), landingStone)
    landing.position.set(0, 2.62, -3.5)
    landing.castShadow = true
    stairGroup.add(landing)

    const goal = new THREE.Group()
    goal.position.set(0, 3.2, -3.98)
    stairGroup.add(goal)
    const arch = new THREE.Mesh(new THREE.TorusGeometry(1.02, 0.065, 10, 48, Math.PI), gold)
    arch.rotation.z = 0
    goal.add(arch)
    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.8, 0.12), gold)
      post.position.set(side * 1.02, -0.37, 0)
      goal.add(post)
    }
    const goalMaterial = new THREE.MeshBasicMaterial({ color: 0xdac998, transparent: true, opacity: 0.26 })
    const goalOrb = new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 18), goalMaterial)
    goalOrb.position.set(0, 0.28, -0.16)
    goal.add(goalOrb)
    const goalLight = new THREE.PointLight(0xe0c87f, 0, 7, 1.8)
    goalLight.position.set(0, 0.25, 0.4)
    goal.add(goalLight)

    const railMaterial = new THREE.MeshStandardMaterial({ color: 0x8f8163, metalness: 0.42, roughness: 0.4 })
    for (const side of [-1, 1]) {
      const points = [
        new THREE.Vector3(side * 2.08, -0.15, 3.05),
        new THREE.Vector3(side * 2.08, 0.7, 1.2),
        new THREE.Vector3(side * 2.08, 1.5, -0.7),
        new THREE.Vector3(side * 2.08, 2.35, -2.5),
        new THREE.Vector3(side * 2.08, 2.65, -3.55),
      ]
      const curve = new THREE.CatmullRomCurve3(points)
      stairGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 36, 0.03, 6, false), railMaterial))
    }

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 32),
      new THREE.MeshStandardMaterial({ color: 0x0a0d0e, roughness: 0.85 }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.62
    ground.receiveShadow = true
    scene.add(ground)
    sceneObjects.push(ground)

    scene.add(new THREE.HemisphereLight(0xc8ced1, 0x101312, 1.35))
    const keyLight = new THREE.SpotLight(0xe1d8c3, 520, 42, Math.PI / 4.8, 0.65, 1.8)
    keyLight.position.set(-7, 12, 9)
    keyLight.target.position.set(5.8, 1.4, -1)
    keyLight.castShadow = window.innerWidth > 700
    keyLight.shadow.mapSize.set(768, 768)
    scene.add(keyLight, keyLight.target)
    const fillLight = new THREE.DirectionalLight(0xc5ccd1, 2.2)
    fillLight.position.set(5, 8, 4)
    scene.add(fillLight)

    let frame = 0
    let tick = 0
    const resize = () => {
      const { width, height } = mount.getBoundingClientRect()
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)
    resize()

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const render = () => {
      tick += 0.016
      const currentStage = stageRef.current
      const litCount = currentStage === 0 ? 0 : currentStage === 1 ? 2 : currentStage === 2 ? 7 : 7
      treadMaterials.forEach((material, index) => {
        const lit = index < litCount
        material.color.setHex(lit ? 0x8a9b8d : 0x38433d)
        material.emissive.setHex(lit ? (currentStage >= 3 ? 0x9a7741 : 0x426b50) : 0x000000)
        material.emissiveIntensity = lit ? (currentStage >= 3 ? 1.65 : 0.8) : 0
      })
      const success = currentStage >= 3
      goalMaterial.color.setHex(success ? 0xffe6a2 : 0xdac998)
      goalMaterial.opacity = success ? 0.82 : currentStage === 2 ? 0.42 : 0.26
      goalLight.intensity = success ? 38 + Math.sin(tick * 4) * 3 : 0
      if (!reducedMotion) stairGroup.rotation.y = -0.08 + Math.sin(tick * 0.35) * 0.025
      renderer.render(scene, camera)
      frame = window.requestAnimationFrame(render)
    }
    render()

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      renderer.dispose()
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) {
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) material.dispose()
        }
      })
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
      sceneObjects.length = 0
    }
  }, [])

  return <div className="learning-architecture" ref={mountRef} aria-hidden="true" />
}
