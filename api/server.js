import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync } from 'fs';
import { nanoid } from 'nanoid';

const app = express();
app.use(cors());
app.use(express.json());

const groves = JSON.parse(readFileSync('../data/groves.json'));
const plots = JSON.parse(readFileSync('../data/plots.json'));
const offsets = JSON.parse(readFileSync('../data/offsets.json'));

app.get('/health', (req,res)=>res.json({ok:true, service:'verranet-mock-api'}));
app.get('/groves', (req,res)=>res.json(groves));
app.get('/plots', (req,res)=>res.json(plots));
app.get('/offsets', (req,res)=>res.json(offsets));

// Fake mint endpoint
app.post('/mint/tree', (req,res)=>{
  const { plotId, species, planterId } = req.body || {};
  const id = `TREE_${nanoid(6)}`;
  const receipt = {
    id: `RCPT_${nanoid(8)}`,
    uri: `verranet://receipt/${id}`,
    time: new Date().toISOString(),
    plotId, species, planterId
  };
  // pretend append
  const path = './receipts.json';
  let receipts = [];
  try { receipts = JSON.parse(readFileSync(path)); } catch(e){ receipts = []; }
  receipts.push(receipt);
  writeFileSync(path, JSON.stringify(receipts, null, 2));
  res.json({ treeId: id, receipt });
});

app.listen(8787, ()=>{
  console.log('VerraNET mock API on http://localhost:8787');
});
