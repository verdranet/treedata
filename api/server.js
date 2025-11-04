import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { nanoid } from 'nanoid';

const app = express();
app.use(cors());
app.use(express.json());

const groves = JSON.parse(readFileSync('../data/groves.json'));
const offsets = JSON.parse(readFileSync('../data/offsets.json'));

app.get('/health', (req,res)=>res.json({ok:true, network:'VerdraNET'}));
app.get('/groves', (req,res)=>res.json(groves));
app.get('/offsets', (req,res)=>res.json(offsets));

// Simulated explorer
app.get('/explorer', (req,res)=>{
  const sample = Array.from({length:5}).map((_,i)=>({
    tx: '9xQeWvG8' + nanoid(10),
    treeId: 'TREE_' + nanoid(5),
    gps: [16.75 + Math.random()/100, -93.11 + Math.random()/100],
    block: 1865000+i,
    time: new Date(Date.now()-i*60000).toISOString()
  }))
  res.json({transactions: sample})
});

app.listen(8787, ()=>console.log('VerdraNET API running on http://localhost:8787'));
