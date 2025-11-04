import React, { useEffect, useState } from 'react'

export default function App(){
  const [groves, setGroves] = useState([])
  const [offsets, setOffsets] = useState([])
  const [base, setBase] = useState('http://localhost:8787')

  useEffect(()=>{
    fetch(base+'/groves').then(r=>r.json()).then(d=>setGroves(d.groves||[]))
    fetch(base+'/offsets').then(r=>r.json()).then(d=>setOffsets(d.offsets||[]))
  }, [base])

  const totalPlanted = groves.reduce((a,g)=>a+g.planted,0)
  const totalTarget  = groves.reduce((a,g)=>a+g.targetTrees,0)
  const totalOffset  = offsets.reduce((a,o)=>a+o.kgCO2e,0)

  return (
    <div style={{fontFamily:'Inter, system-ui, sans-serif', padding:20, background:'#0b0f14', minHeight:'100vh', color:'#d8f3dc'}}>
      <h1 style={{margin:0}}>VerraNET <span style={{opacity:.7}}>(LARP)</span></h1>
      <p style={{opacity:.8}}>Mock dashboard with fake KPIs.</p>

      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16, margin:'20px 0'}}>
        <div style={{background:'#10151c', padding:16, borderRadius:12}}>
          <div>Total Planted</div>
          <div style={{fontSize:32, fontWeight:700}}>{totalPlanted.toLocaleString()}</div>
        </div>
        <div style={{background:'#10151c', padding:16, borderRadius:12}}>
          <div>Target Trees</div>
          <div style={{fontSize:32, fontWeight:700}}>{totalTarget.toLocaleString()}</div>
        </div>
        <div style={{background:'#10151c', padding:16, borderRadius:12}}>
          <div>kgCO₂e Accrued</div>
          <div style={{fontSize:32, fontWeight:700}}>{totalOffset.toLocaleString()}</div>
        </div>
      </div>

      <h3>Groves</h3>
      <table style={{width:'100%', borderCollapse:'collapse'}}>
        <thead>
          <tr><th style={{textAlign:'left'}}>Name</th><th>Region</th><th>Planted / Target</th></tr>
        </thead>
        <tbody>
          {groves.map(g=>(
            <tr key={g.id} style={{borderTop:'1px solid #132028'}}>
              <td>{g.name}</td>
              <td style={{textAlign:'center'}}>{g.region}</td>
              <td style={{textAlign:'right'}}>{g.planted.toLocaleString()} / {g.targetTrees.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
