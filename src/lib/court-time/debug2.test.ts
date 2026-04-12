import { test, expect } from 'vitest';
import type { Player } from './types.js';

// Inline minimal version of scheduleHalf with extra debug
function debugScheduleHalf(players: Player[], startingFive: Player[], halfTargets: number[]) {
  const HALF_MINUTES = 20;
  const MAX_STINT = 10;
  const slots: string[][] = Array.from({ length: HALF_MINUTES }, () => startingFive.map(p => p.id));
  const playerIdx = new Map(players.map((p,i) => [p.id, i]));
  const starterIds = new Set(startingFive.map(p => p.id));
  const benchPlayers = players.filter(p => !starterIds.has(p.id));

  function countMinutes(id: string) {
    let c = 0; for (let m=0;m<HALF_MINUTES;m++) if(slots[m].includes(id)) c++; return c;
  }
  function getSurplus(id: string) { return countMinutes(id) - halfTargets[playerIdx.get(id)!]; }
  function findHighestSurplusInSlot(m: number) {
    let bestId='', bestSurplus=-Infinity, bestIdx=-1;
    for(const id of slots[m]){const s=getSurplus(id),idx=playerIdx.get(id)!;if(s>bestSurplus||(s===bestSurplus&&idx>bestIdx)){bestSurplus=s;bestId=id;bestIdx=idx;}}
    return bestId;
  }
  
  const sortedBench = benchPlayers.slice().sort((a,b)=>{const ia=playerIdx.get(a.id)!,ib=playerIdx.get(b.id)!,td=halfTargets[ib]-halfTargets[ia];return td!==0?td:ia-ib;});
  for(const bp of sortedBench){const bi=playerIdx.get(bp.id)!,tgt=halfTargets[bi];if(tgt===0)continue;const ws=HALF_MINUTES-tgt;for(let m=ws;m<HALF_MINUTES;m++){const outId=findHighestSurplusInSlot(m);slots[m]=slots[m].map(id=>id===outId?bp.id:id);}}

  let changed=true,safety=0;
  while(changed&&safety<100){changed=false;safety++;for(let m=HALF_MINUTES-1;m>=0;m--){const co=new Set(slots[m]);let overTargetId='';for(const id of co){const idx=playerIdx.get(id)!;if(countMinutes(id)>=halfTargets[idx]&&countMinutes(id)>0){overTargetId=id;break;}}if(!overTargetId)continue;let needsTimeId='';for(const p of players){if(co.has(p.id))continue;const idx=playerIdx.get(p.id)!;if(countMinutes(p.id)<halfTargets[idx]){needsTimeId=p.id;break;}}if(!needsTimeId)continue;slots[m]=slots[m].map(id=>id===overTargetId?needsTimeId:id);changed=true;}}

  console.log('\n=== After bench placement + correction pass ===');
  for(let m=0;m<HALF_MINUTES;m++) { const s = slots[m]; console.log(`slot[${m}]: ${s.join(',')} (count=${s.length})`); }
  
  // Max stint enforcement
  let stintChanged=true,stintSafety=0;
  while(stintChanged&&stintSafety<200){stintChanged=false;stintSafety++;
    for(const player of players){const id=player.id;let runStart=-1;
      for(let m=0;m<=HALF_MINUTES;m++){const onCourt=m<HALF_MINUTES&&slots[m].includes(id);if(onCourt){if(runStart===-1)runStart=m;}else{if(runStart!==-1){const runEnd=m,runLen=runEnd-runStart;
        if(runLen>MAX_STINT){const breakAt=runStart+MAX_STINT;const onCourtAtBreak=new Set(slots[breakAt]);let neutralFound=false;
          outer: for(const p of players){if(onCourtAtBreak.has(p.id))continue;for(let y=runEnd;y<HALF_MINUTES;y++){if(slots[y].includes(p.id)&&!slots[y].includes(id)){
            console.log(`NEUTRAL FWD: ${id} run[${runStart}..${runEnd-1}] breakAt=${breakAt} Y=${y} swapWith=${p.id}`);
            slots[breakAt]=slots[breakAt].map(sid=>sid===id?p.id:sid);
            slots[y]=slots[y].map(sid=>sid===p.id?id:sid);
            if(slots[breakAt].length!==5||new Set(slots[breakAt]).size!==5) console.log(`*** DUPLICATE at breakAt=${breakAt}:`,slots[breakAt]);
            if(slots[y].length!==5||new Set(slots[y]).size!==5) console.log(`*** DUPLICATE at y=${y}:`,slots[y]);
            neutralFound=true;stintChanged=true;break outer;}}}
          if(!neutralFound){outer2:for(const p of players){if(onCourtAtBreak.has(p.id))continue;for(let y=0;y<runStart;y++){if(!slots[y].includes(id)&&slots[y].includes(p.id)){
            console.log(`NEUTRAL BWD: ${id} run[${runStart}..${runEnd-1}] breakAt=${breakAt} Y=${y} swapWith=${p.id}`);
            slots[breakAt]=slots[breakAt].map(sid=>sid===id?p.id:sid);
            slots[y]=slots[y].map(sid=>sid===p.id?id:sid);
            if(slots[breakAt].length!==5||new Set(slots[breakAt]).size!==5) console.log(`*** DUPLICATE at breakAt=${breakAt}:`,slots[breakAt]);
            if(slots[y].length!==5||new Set(slots[y]).size!==5) console.log(`*** DUPLICATE at y=${y}:`,slots[y]);
            neutralFound=true;stintChanged=true;break outer2;}}}
          if(!neutralFound){for(const p of players){if(!onCourtAtBreak.has(p.id)){console.log(`FALLBACK: ${id} breakAt=${breakAt}`);slots[breakAt]=slots[breakAt].map(sid=>sid===id?p.id:sid);stintChanged=true;break;}}}}
        }runStart=-1;}}}}}
  
  console.log('\n=== After max stint enforcement ===');
  for(let m=0;m<HALF_MINUTES;m++) { const s = slots[m]; if(s.length!==5||new Set(s).size!==5) console.log(`*** PROBLEM slot[${m}]: ${s.join(',')}`); }
  
  return slots;
}

test('9-player debug trace', () => {
  const players: Player[] = Array.from({length:9},(_,i)=>({id:`p${i}`,name:`Player ${i+1}`}));
  const starters = players.slice(0,5);
  const halfTargets = [11,11,11,11,11,12,11,11,11]; // sum=100 for 9 players
  const slots = debugScheduleHalf(players, starters, halfTargets);
  
  // Verify all slots have exactly 5 unique players
  for(let m=0;m<20;m++) {
    expect(slots[m].length).toBe(5);
    expect(new Set(slots[m]).size).toBe(5);
  }
});
