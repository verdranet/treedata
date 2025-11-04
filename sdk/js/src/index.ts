export type Grove = { id:string; name:string; targetTrees:number; planted:number; region:string };
export type Plot = { id:string; groveId:string; lat:number; lng:number; species:string; ageDays:number };
export type Offset = { plotId:string; epoch:string; kgCO2e:number };

export class VerraNet {
  base:string;
  constructor(base='http://localhost:8787'){ this.base = base; }
  async groves():Promise<{groves:Grove[]}>{ 
    const r = await fetch(`${this.base}/groves`); return r.json();
  }
  async plots():Promise<{plots:Plot[]}>{ 
    const r = await fetch(`${this.base}/plots`); return r.json();
  }
  async offsets():Promise<{offsets:Offset[]}>{ 
    const r = await fetch(`${this.base}/offsets`); return r.json();
  }
  async mintTree(plotId:string, species:string, planterId:string){
    const r = await fetch(`${this.base}/mint/tree`,{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({plotId, species, planterId})
    });
    return r.json();
  }
}
