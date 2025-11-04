import React, { useEffect, useState } from 'react'

export default function App(){
  const base = 'http://localhost:8787'
  const [groves, setGroves] = useState([])
  const [offsets, setOffsets] = useState([])
  const [txs, setTxs] = useState([])
  const [tab, setTab] = useState('dashboard')

  useEffect(()=>{
    fetch(base+'/groves').then(r=>r.json()).then(d=>setGroves(d.groves||d))
    fetch(base+'/offsets').then(r=>r.json()).then(d=>setOffsets(d.offsets||d))
    fetch(base+'/explorer').then(r=>r.json()).then(d=>setTxs(d.transactions||[]))
  },[])

  const planted = groves.reduce((a,g)=>a+(g.planted||0),0)
  const target = groves.reduce((a,g)=>a+(g.targetTrees||0),0)
  const offset = offsets.reduce((a,o)=>a+(o.kgCO2e||0),0)

  return (
    <div style={{fontFamily:'Inter, system-ui', background:'#0B0F14', color:'#D8F3DC', minHeight:'100vh', padding:20}}>
      <header style={{display:'flex',alignItems:'center',gap:12}}>
        <img src='logo.png' width='48'/>
        <h1 style={{color:'#00C37A'}}>VerdraNET</h1>
      </header>
      <p style={{opacity:.8}}>Where digital networks and living ecosystems merge.</p>
      <nav style={{marginTop:20}}>
        <button onClick={()=>setTab('dashboard')}>Dashboard</button>
        <button onClick={()=>setTab('explorer')}>Blockchain Explorer</button>
      </nav>

      {tab==='dashboard' && (
        <div style={{marginTop:30}}>
          <h2>Network Metrics</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
            <div style={{background:'#10151C',padding:16,borderRadius:10}}>
              <div>Total Planted</div><div style={{fontSize:28}}>{planted}</div>
            </div>
            <div style={{background:'#10151C',padding:16,borderRadius:10}}>
              <div>Target Trees</div><div style={{fontSize:28}}>{target}</div>
            </div>
            <div style={{background:'#10151C',padding:16,borderRadius:10}}>
              <div>CO₂ Captured (kg)</div><div style={{fontSize:28}}>{offset}</div>
            </div>
          </div>
        </div>
      )}

      {tab==='explorer' && (
        <div style={{marginTop:30}}>
          <h2>Blockchain Explorer</h2>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr><th>Tx</th><th>Tree ID</th><th>GPS</th><th>Block</th><th>Time</th></tr></thead>
            <tbody>
              {txs.map(t=>(
                <tr key={t.tx} style={{borderTop:'1px solid #132028'}}>
                  <td>{t.tx}</td><td>{t.treeId}</td>
                  <td>{t.gps[0].toFixed(3)}, {t.gps[1].toFixed(3)}</td>
                  <td>{t.block}</td><td>{new Date(t.time).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
