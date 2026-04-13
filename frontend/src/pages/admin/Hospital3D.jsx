// ============================================================
// src/pages/admin/Hospital3D.jsx
// ============================================================
// Full screen 3D hospital view — keeps sidebar, removes Layout
// navbar and padding so canvas fills all remaining space.
// ============================================================

import Sidebar from '../../components/Sidebar'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, Sky } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import * as THREE from 'three'
import api from '../../api/axios'

const STATUS_COLORS = {
    empty:       '#00FF00',   // 🟢 bright green
    stable:      '#0088FF',   // 🔵 bright blue
    critical:    '#FF0000',   // 🔴 bright red
    maintenance: '#FFB800',   // 🟡 bright yellow
}

const LEGEND = [
    { c: '#EF4444', l: 'Urgence / Occupé'  },
    { c: '#22C55E', l: 'Chambre libre'     },
    { c: '#F97316', l: 'En maintenance'    },
    { c: '#EAB308', l: 'Stable'            },
]

const DEFAULT_STATS = [
    { color: '#EF4444', label: 'Urgence',     count: 0 },
    { color: '#22C55E', label: 'Libre',       count: 0 },
    { color: '#F59E0B', label: 'Maintenance', count: 0 },
    { color: '#3B82F6', label: 'Stable',      count: 0 },
]

const MOCK_STATUS = Object.fromEntries(
    Array.from({ length: 20 }, (_, i) => {
        const num = String(i + 1).padStart(2, '0')
        const key = `window_EMERGENCY_A_F1_${num}001`
        const colors = ['#FF0000', '#00CC00', '#0055FF']
        return [key, { color: colors[i % 3] }]
    })
)

// ============================================================
// 3D HOSPITAL MODEL
// ============================================================
function Hospital({ statusMap, onLoad }) {
    const { scene }       = useGLTF('/one.glb')
    const { camera, gl }  = useThree()
    const controlsRef     = useRef()
    const innerRef        = useRef()
    const cameraSetupDone = useRef(false)

    useEffect(() => {
        if (!innerRef.current) return

        scene.updateMatrixWorld(true)
        const box    = new THREE.Box3().setFromObject(scene)
        const center = box.getCenter(new THREE.Vector3())
        const size   = box.getSize(new THREE.Vector3())

        // ── One-time camera setup ──────────────────────────────
        if (!cameraSetupDone.current) {
            innerRef.current.position.set(-center.x, -center.y, -center.z)
            innerRef.current.updateMatrixWorld(true)

            const maxDim = Math.max(size.x, size.y, size.z)
            const fovRad = (camera.fov * Math.PI) / 180
            const dist   = (maxDim / 2 / Math.tan(fovRad / 2)) * 0.48

            camera.position.set(dist * 0.9, dist * 1.4, dist * 0.9)
            camera.lookAt(0, 0, 0)
            camera.near = dist * 0.005
            camera.far  = dist * 25
            camera.updateProjectionMatrix()

            gl.toneMapping         = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = 0.88

            if (controlsRef.current) {
                controlsRef.current.target.set(0, 0, 0)
                controlsRef.current.update()
            }

            cameraSetupDone.current = true
        }

        // ── Skip coloring if no data yet ───────────────────────
        if (Object.keys(statusMap).length === 0) {
            onLoad?.()
            return
        }

        // ── Reset stale colors ─────────────────────────────────
        scene.traverse(obj => {
            if (obj.isMesh && obj.userData.isStatusWindow) {
                obj.userData.isStatusWindow = false
                obj.userData.statusColor    = null
            }
        })

        // ── Pass 1: Color window meshes ────────────────────────
        scene.traverse(obj => {
            if (!obj.isMesh) return
            const matchedKey = Object.keys(statusMap).find(key =>
                obj.name.startsWith(key)
            )
            if (!matchedKey) return
            const { color } = statusMap[matchedKey]
            obj.material = new THREE.MeshStandardMaterial({
                color:             new THREE.Color(color),
                emissive:          new THREE.Color(color),
                emissiveIntensity: 4.0,
                roughness:         0.0,
                metalness:         0.0,
                side:              THREE.DoubleSide,
            })
            obj.userData.isStatusWindow = true
            obj.userData.statusColor    = color
        })

        // ── Pass 2: Remove old glow planes, add new ones ───────
        const toRemove = []
        innerRef.current.children.forEach(c => {
            if (c.userData.isGlassPlane) toRemove.push(c)
        })
        toRemove.forEach(c => innerRef.current.remove(c))
        innerRef.current.updateMatrixWorld(true)

        scene.traverse(obj => {
            if (!obj.isMesh || !obj.userData.isStatusWindow) return
            const matchedColor = obj.userData.statusColor

            obj.updateMatrixWorld(true)
            const wbox    = new THREE.Box3().setFromObject(obj)
            const wcenter = wbox.getCenter(new THREE.Vector3())
            const wsize   = wbox.getSize(new THREE.Vector3())

            const localCenter = wcenter.clone()
            innerRef.current.worldToLocal(localCenter)

            const planeW = Math.max(wsize.x, wsize.z)
            const planeH = wsize.y < 0.1 ? Math.max(wsize.x, wsize.z) : wsize.y

            const geo = new THREE.PlaneGeometry(planeW * 1.1, planeH * 1.1)
            const mat = new THREE.MeshStandardMaterial({
                color:             new THREE.Color(matchedColor),
                emissive:          new THREE.Color(matchedColor),
                emissiveIntensity: 15.0,
                transparent:       true,
                opacity:           0.28,
                side:              THREE.DoubleSide,
                depthWrite:        false,
            })
            const glass = new THREE.Mesh(geo, mat)
            glass.position.copy(localCenter)

            const isZFacing = wsize.x < wsize.z
            const normal    = new THREE.Vector3(isZFacing ? 1 : 0, 0, isZFacing ? 0 : 1)
            glass.position.addScaledVector(normal, 0.05)
            if (isZFacing) glass.rotation.y = Math.PI / 2

            glass.userData.isGlassPlane = true
            innerRef.current.add(glass)
        })

        onLoad?.()
    }, [scene, statusMap])

    return (
        <>
            <group ref={innerRef}>
                <primitive object={scene} />
            </group>
            <OrbitControls
                ref={controlsRef}
                makeDefault
                autoRotate
                autoRotateSpeed={1.2}
                enableDamping
                dampingFactor={0.06}
                zoomSpeed={1.2}
                maxPolarAngle={Math.PI / 2.05}
                minPolarAngle={0.15}
                enablePan={false}
            />
        </>
    )
}

// ============================================================
// STAT CARD
// ============================================================
function StatCard({ color, label, count }) {
    return (
        <div
            style={{
                background:   'rgba(255,255,255,0.95)',
                border:       `1px solid ${color}30`,
                borderTop:    `3px solid ${color}`,
                borderRadius: 10,
                padding:      '10px 22px',
                minWidth:     108,
                boxShadow:    `0 4px 20px ${color}18, 0 1px 4px rgba(0,0,0,0.06)`,
                transition:   'transform .2s',
                cursor:       'default',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: color, display: 'inline-block',
                    boxShadow: `0 0 7px ${color}`,
                }} />
                <span style={{
                    color: '#64748b', fontSize: 10,
                    letterSpacing: '1.2px', textTransform: 'uppercase', fontWeight: 700,
                }}>{label}</span>
            </div>
            <div style={{
                color: '#0f172a', fontSize: 26, fontWeight: 900,
                fontFamily: "'DM Mono', 'Courier New', monospace",
                letterSpacing: '-1px',
            }}>{count}</div>
        </div>
    )
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function Hospital3D() {
    const navigate    = useNavigate()
    const { user }    = useAuth()

    const [loaded,     setLoaded]     = useState(false)
    const [time,       setTime]       = useState(new Date())
    const [roomStatus, setRoomStatus] = useState({})
    const [stats,      setStats]      = useState(DEFAULT_STATS)

    // ── Admin guard ────────────────────────────────────────────
    useEffect(() => {
        if (user && user.role !== 'admin') navigate('/dashboard/' + user.role)
    }, [user])

    // ── Clock ──────────────────────────────────────────────────
    useEffect(() => {
        const id = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(id)
    }, [])

    // ── Fetch rooms every 30s ──────────────────────────────────
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res   = await api.get('/nurse/rooms/')
                const rooms = res.data
                const statusMap = {}
                rooms.forEach(room => {
                    statusMap[room.room_number] = {
                        color: STATUS_COLORS[room.status] || STATUS_COLORS.empty,
                    }
                })
                setRoomStatus(statusMap)
                const counts = { critical: 0, empty: 0, maintenance: 0, stable: 0 }
                rooms.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++ })
                setStats([
                    { color: '#EF4444', label: 'Urgence',     count: counts.critical    },
                    { color: '#22C55E', label: 'Libre',       count: counts.empty       },
                    { color: '#F59E0B', label: 'Maintenance', count: counts.maintenance },
                    { color: '#3B82F6', label: 'Stable',      count: counts.stable      },
                ])
            } catch (err) {
                console.log('Using mock data:', err.message)
                setRoomStatus(MOCK_STATUS)
            }
        }
        fetchRooms()
        const interval = setInterval(fetchRooms, 30000)
        return () => clearInterval(interval)
    }, [])

    return (
        // ── Full viewport flex row — sidebar + canvas ──────────
        // No Layout wrapper — we manually include only Sidebar
        // so canvas can fill ALL remaining space with zero gaps
        <div style={{
            display:  'flex',
            height:   '100vh',
            width:    '100vw',
            overflow: 'hidden',
        }}>

            {/* ── Sidebar — same as every other admin page ──────── */}
            <Sidebar />

            {/* ── Right side — canvas fills everything ─────────── */}
            <div style={{
                position:   'relative',
                flex:       1,
                overflow:   'hidden',
                background: 'linear-gradient(160deg, #dce8f5 0%, #c8ddf0 60%, #b8cfe8 100%)',
                fontFamily: "'Segoe UI', system-ui, sans-serif",
            }}>

                <style>{`
                    @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.35;transform:scale(1.3)} }
                    @keyframes loadBar   { 0%{transform:translateX(-100%)} 100%{transform:translateX(420%)} }
                    @keyframes fadeIn    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
                `}</style>

                {/* ── Top header ─────────────────────────────────── */}
                <header style={{
                    position:       'absolute',
                    top: 0, left: 0, right: 0,
                    zIndex:         20,
                    height:         68,
                    background: 'rgba(220,232,245,0.97)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    borderBottom:   '1px solid rgba(0,0,0,0.07)',
                    boxShadow:      '0 2px 24px rgba(0,0,0,0.07)',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'space-between',
                    padding:        '0 28px',
                    gap:            16,
                }}>

                    {/* Logo + title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                        <div style={{
                            width: 42, height: 42, borderRadius: 12,
                            background: 'linear-gradient(135deg, #EF4444 0%, #3B82F6 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 22, boxShadow: '0 4px 14px rgba(59,130,246,0.35)',
                        }}>🏥</div>
                        <div>
                            <div style={{ color: '#0f172a', fontWeight: 800, fontSize: 15, letterSpacing: '-0.3px' }}>
                                CHU Ibn Sina
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: 9.5, letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 600 }}>
                                Surveillance · Temps Réel
                            </div>
                        </div>
                    </div>

                    {/* Stat cards */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'nowrap' }}>
                        {stats.map(s => <StatCard key={s.label} {...s} />)}
                    </div>

                    {/* Clock */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                        <div style={{
                            color: '#0f172a',
                            fontFamily: "'DM Mono', 'Courier New', monospace",
                            fontSize: 21, fontWeight: 700, letterSpacing: '2px',
                        }}>
                            {time.toLocaleTimeString('fr-FR')}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: '#22C55E', boxShadow: '0 0 8px #22C55E',
                                display: 'inline-block',
                                animation: 'livePulse 2s ease-in-out infinite',
                            }} />
                            <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 500 }}>
                                LIVE · Rabat, Maroc
                            </span>
                        </div>
                    </div>
                </header>

                {/* ── Legend ─────────────────────────────────────── */}
                <footer style={{
                    position:       'absolute',
                    bottom: 18, left: '50%',
                    transform:      'translateX(-50%)',
                    zIndex:         20,
                    display:        'flex',
                    alignItems:     'center',
                    gap:            28,
                    background:     'rgba(255,255,255,0.93)',
                    backdropFilter: 'blur(16px)',
                    border:         '1px solid rgba(0,0,0,0.07)',
                    boxShadow:      '0 4px 24px rgba(0,0,0,0.08)',
                    borderRadius:   50,
                    padding:        '11px 32px',
                    whiteSpace:     'nowrap',
                }}>
                    {LEGEND.map(({ c, l }) => (
                        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                                width: 11, height: 11, borderRadius: 3,
                                background: c, display: 'inline-block',
                                boxShadow: `0 0 7px ${c}99`,
                            }} />
                            <span style={{ color: '#475569', fontSize: 12, fontWeight: 500 }}>{l}</span>
                        </div>
                    ))}
                    <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: 20, marginLeft: 4 }}>
                        <span style={{ color: '#94a3b8', fontSize: 11 }}>Mise à jour toutes les 30s</span>
                    </div>
                </footer>

                {/* ── Three.js Canvas ────────────────────────────── */}
                <Canvas
                    style={{ position: 'absolute', inset: 0 }}
                    camera={{ position: [100, 80, 100], fov: 42 }}
                    gl={{ antialias: true }}
                    shadows
                >
                    <Sky
                        distance={450000} sunPosition={[80, 40, 50]}
                        turbidity={8} rayleigh={0.6}
                        mieCoefficient={0.004} mieDirectionalG={0.85}
                    />
                    <ambientLight intensity={0.65} color="#fff8f0" />
                    <directionalLight
                        position={[100, 180, 80]} intensity={2.1} color="#fffbe0" castShadow
                        shadow-mapSize={[2048, 2048]} shadow-camera-far={600}
                        shadow-camera-left={-200} shadow-camera-right={200}
                        shadow-camera-top={200} shadow-camera-bottom={-200}
                    />
                    <directionalLight position={[-60, 80, -60]} intensity={0.45} color="#b8d4f0" />
                    <hemisphereLight args={['#87ceeb', '#5a7a4a', 0.4]} />
                    <Hospital
                        statusMap={roomStatus}
                        onLoad={() => setLoaded(true)}
                    />
                </Canvas>

                {/* ── Loading screen ─────────────────────────────── */}
                {!loaded && (
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 100,
                        background: 'linear-gradient(160deg, #dce8f5, #c8ddf0)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 18,
                    }}>
                        <div style={{ fontSize: 52, animation: 'fadeIn .6s ease both' }}>🏥</div>
                        <div style={{
                            color: '#3B82F6', fontSize: 12,
                            letterSpacing: '3.5px', fontWeight: 700,
                            textTransform: 'uppercase',
                            animation: 'fadeIn .6s .1s ease both', opacity: 0,
                        }}>
                            Chargement du modèle…
                        </div>
                        <div style={{
                            width: 220, height: 3,
                            background: 'rgba(0,0,0,0.1)',
                            borderRadius: 4, overflow: 'hidden',
                            animation: 'fadeIn .6s .2s ease both', opacity: 0,
                        }}>
                            <div style={{
                                height: '100%', width: '55%',
                                background: 'linear-gradient(90deg, #EF4444, #3B82F6)',
                                borderRadius: 4,
                                animation: 'loadBar 1.8s ease-in-out infinite',
                            }} />
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}