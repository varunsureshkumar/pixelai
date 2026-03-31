import { useState, useRef, useCallback, useReducer, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS  — "Studio Dark": Syne + DM Mono, coral + teal
// ═══════════════════════════════════════════════════════════════════════════════
const T = {
  bg:"#060606", surf:"#0E0E0E", card:"#161616", elev:"#1E1E1E",
  bdr:"#2A2A2A", bdr2:"#363636",
  acc:"#FF3C3C", acc2:"#00D4AA", acc3:"#FFB800",
  txt:"#F0F0F0", dim:"#767676", mut:"#3A3A3A",
};

// ═══════════════════════════════════════════════════════════════════════════════
// FILTER PRESETS — 16 total
// ═══════════════════════════════════════════════════════════════════════════════
const FILTERS = [
  { id:"orig",    name:"Original", adj:{} },
  { id:"vivid",   name:"Vivid",    adj:{ sat:55,  con:12,  bri:5              } },
  { id:"cinema",  name:"Cinema",   adj:{ con:28,  sat:-22, warm:-18, bri:-5   } },
  { id:"golden",  name:"Golden",   adj:{ warm:65, sat:35,  bri:10,   con:10   } },
  { id:"noir",    name:"Noir",     adj:{ sat:-100,con:32,  bri:-8             } },
  { id:"matte",   name:"Matte",    adj:{ con:-18, sat:-18, bri:12,   fade:22  } },
  { id:"arctic",  name:"Arctic",   adj:{ warm:-48,sat:12,  bri:6              } },
  { id:"pop",     name:"Pop",      adj:{ sat:88,  con:8,   bri:5              } },
  { id:"fade",    name:"Fade",     adj:{ con:-22, bri:22,  sat:-32,  fade:18  } },
  { id:"lomo",    name:"Lomo",     adj:{ sat:75,  con:38,  bri:-12,  vig:55   } },
  { id:"dreamy",  name:"Dreamy",   adj:{ bri:18,  con:-12, sat:28,   fade:8   } },
  { id:"travel",  name:"Travel",   adj:{ sat:42,  con:22,  warm:22,  bri:6    } },
  { id:"dusk",    name:"Dusk",     adj:{ warm:45, sat:28,  con:15,   bri:-8, vig:25  } },
  { id:"clarity", name:"Clarity",  adj:{ con:18,  sat:15,  sharp:35, bri:5   } },
  { id:"teal",    name:"Teal",     adj:{ warm:-30,sat:35,  con:12,   bri:3    } },
  { id:"retro",   name:"Retro",    adj:{ sat:-20, warm:35, con:10,   fade:30, vig:30 } },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 1-TAP LOOKS — the core differentiator
// ═══════════════════════════════════════════════════════════════════════════════
const LOOKS = [
  { id:"insta",     name:"Instagram\nReady",  emoji:"📸", color:"#E91E8C",
    adj:{ bri:8,  con:14, sat:20,  warm:6,   sharp:28, vig:8  }, filter:"vivid"  },
  { id:"cinematic", name:"Cinematic",         emoji:"🎬", color:"#1E90FF",
    adj:{ bri:-5, con:28, sat:-22, warm:-18, sharp:20         }, filter:"cinema" },
  { id:"travelpop", name:"Travel\nPop",       emoji:"✈️", color:"#FF6B35",
    adj:{ bri:6,  con:22, sat:42,  warm:22,  sharp:15         }, filter:"travel" },
  { id:"nightglow", name:"Night\nGlow",       emoji:"🌙", color:"#7B2FBE",
    adj:{ bri:12, con:18, sat:-10, warm:-25, vig:40, sharp:20 }, filter:"arctic" },
  { id:"goldenhour",name:"Golden\nHour",      emoji:"🌅", color:"#FFB800",
    adj:{ bri:10, con:10, sat:35,  warm:65,  vig:20           }, filter:"golden" },
  { id:"moody",     name:"Moody",             emoji:"🎭", color:"#9B5DE5",
    adj:{ bri:-10,con:35, sat:-15, warm:-10, vig:55, fade:10  }, filter:"lomo"   },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ADJUSTMENT CONTROLS
// ═══════════════════════════════════════════════════════════════════════════════
const ADJS = [
  { id:"bri",   label:"Brightness", icon:"☀",  min:-100, max:100 },
  { id:"con",   label:"Contrast",   icon:"◑",  min:-100, max:100 },
  { id:"sat",   label:"Saturation", icon:"◈",  min:-100, max:100 },
  { id:"warm",  label:"Warmth",     icon:"♨",  min:-100, max:100 },
  { id:"sharp", label:"Sharpness",  icon:"✦",  min:0,    max:100 },
  { id:"vig",   label:"Vignette",   icon:"⊙",  min:0,    max:100 },
  { id:"fade",  label:"Fade",       icon:"▣",  min:0,    max:100 },
  { id:"blur",  label:"Blur",       icon:"~",  min:0,    max:100 },
];
const DA = { bri:0,con:0,sat:0,warm:0,sharp:0,vig:0,fade:0,blur:0 };

// ═══════════════════════════════════════════════════════════════════════════════
// CSS FILTER COMPUTATION
// ═══════════════════════════════════════════════════════════════════════════════
function toCSS(adj, before=false) {
  if (before) return "none";
  const {bri:b=0,con:c=0,sat:s=0,warm:w=0,sharp:sh=0,blur:bl=0} = adj;
  const bf = (1+b/100).toFixed(3);
  const cf = (1+c/100).toFixed(3);
  const sf = Math.max(0,1+s/100).toFixed(3);
  const sep = w>0 ? Math.min(w/200,0.5).toFixed(3) : 0;
  const hue = w<0 ? (Math.abs(w)*0.9).toFixed(1) : 0;
  const shf = sh>0 ? (1+sh/300).toFixed(3) : 1;
  const blf = bl>0 ? `blur(${(bl/25).toFixed(2)}px)` : "";
  return [
    `brightness(${bf})`,
    `contrast(${(parseFloat(cf)*parseFloat(shf)).toFixed(3)})`,
    `saturate(${sf})`,
    sep>0 && `sepia(${sep})`,
    hue>0 && `hue-rotate(-${hue}deg)`,
    blf,
  ].filter(Boolean).join(" ");
}
const presetCSS = id => toCSS({...DA,...(FILTERS.find(f=>f.id===id)?.adj||{})});

// ═══════════════════════════════════════════════════════════════════════════════
// STATE MACHINE
// ═══════════════════════════════════════════════════════════════════════════════
const INIT = {
  url:null, name:"",
  adj:{...DA}, filter:"orig",
  tab:"looks", before:false,
  textOverlays:[], rotation:0, flipH:false, flipV:false,
  history:[], future:[],
};
const snap = s => ({
  adj:{...s.adj}, filter:s.filter,
  rotation:s.rotation, flipH:s.flipH, flipV:s.flipV,
  textOverlays:[...s.textOverlays],
});
function reducer(s,a) {
  const save = () => [...s.history.slice(-19), snap(s)];
  switch(a.type) {
    case "LOAD":    return {...INIT, url:a.url, name:a.name};
    case "ADJ":     return {...s, adj:{...s.adj,[a.key]:a.val}, history:save(), future:[]};
    case "FILTER":  return {...s, filter:a.id, history:save(), future:[]};
    case "LOOK":    return {...s, adj:{...DA,...a.adj}, filter:a.filter, history:save(), future:[]};
    case "ENHANCE": return {...s, adj:{...DA,bri:8,con:14,sat:20,warm:6,sharp:28,vig:8}, history:save(), future:[]};
    case "ROTATE":  return {...s, rotation:(s.rotation+90)%360, history:save(), future:[]};
    case "FLIP_H":  return {...s, flipH:!s.flipH, history:save(), future:[]};
    case "FLIP_V":  return {...s, flipV:!s.flipV, history:save(), future:[]};
    case "RESET":   return {...s, adj:{...DA}, filter:"orig", rotation:0, flipH:false, flipV:false, history:save(), future:[]};
    case "UNDO":    if(!s.history.length) return s;
                    return {...s,...s.history[s.history.length-1], history:s.history.slice(0,-1), future:[snap(s),...s.future.slice(0,9)]};
    case "REDO":    if(!s.future.length) return s;
                    return {...s,...s.future[0], history:[...s.history,snap(s)], future:s.future.slice(1)};
    case "BEFORE":  return {...s, before:a.val};
    case "TAB":     return {...s, tab:a.tab};
    case "ADD_TEXT":    return {...s, textOverlays:[...s.textOverlays, a.overlay]};
    case "REMOVE_TEXT": return {...s, textOverlays:s.textOverlays.filter((_,i)=>i!==a.idx)};
    default: return s;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HISTOGRAM DECORATION
// ═══════════════════════════════════════════════════════════════════════════════
const HIST = Array.from({length:24},(_,i)=>{
  const x=i/23;
  return Math.min(100,Math.max(8,Math.round(55+30*Math.sin(x*Math.PI)+12*Math.sin(x*2.5*Math.PI)+8*(Math.sin(i*1.7)+1)/2)));
});

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function PixelAI() {
  const [st, dispatch]     = useReducer(reducer, INIT);
  const [selAdj,setSelAdj] = useState("bri");
  const [textIn,setTextIn] = useState("");
  const [txtColor,setTxtColor] = useState("#FFFFFF");
  const [txtSize,setTxtSize]   = useState(36);
  const [isDrag,setIsDrag] = useState(false);
  const [toast,setToast]   = useState(false);
  const [busy,setBusy]     = useState(false);

  const fileRef   = useRef();
  const imgRef    = useRef();
  const canvasRef = useRef();

  const vigOp  = st.adj.vig  / 100;
  const fadeOp = st.adj.fade / 100;
  const activeCSS   = toCSS(st.adj, st.before);
  const imgTransform = [
    st.rotation ? `rotate(${st.rotation}deg)` : "",
    st.flipH ? "scaleX(-1)" : "",
    st.flipV ? "scaleY(-1)" : "",
  ].filter(Boolean).join(" ") || undefined;
  const curAdj = ADJS.find(a=>a.id===selAdj);
  const hasEdits = st.filter!=="orig" || Object.values(st.adj).some(v=>v!==0);

  // Keyboard shortcuts
  useEffect(() => {
    const kd = e => {
      if (!st.url) return;
      if ((e.metaKey||e.ctrlKey) && e.key==="z") {
        e.preventDefault();
        dispatch({type: e.shiftKey?"REDO":"UNDO"});
      }
    };
    window.addEventListener("keydown",kd);
    return () => window.removeEventListener("keydown",kd);
  },[st.url]);

  const handleFile = useCallback(file => {
    if (!file||!file.type.startsWith("image/")) return;
    dispatch({type:"LOAD", url:URL.createObjectURL(file), name:file.name});
  },[]);

  const handleDrop = useCallback(e => {
    e.preventDefault(); setIsDrag(false);
    handleFile(e.dataTransfer.files[0]);
  },[handleFile]);

  // ── EXPORT ──────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    if (!imgRef.current||busy) return;
    setBusy(true);
    await new Promise(r=>setTimeout(r,60));
    const img=imgRef.current, c=canvasRef.current, ctx=c.getContext("2d");
    const W=img.naturalWidth, H=img.naturalHeight;
    c.width=W; c.height=H;
    ctx.save();
    ctx.translate(W/2,H/2);
    if(st.rotation) ctx.rotate((st.rotation*Math.PI)/180);
    if(st.flipH) ctx.scale(-1,1);
    if(st.flipV) ctx.scale(1,-1);
    ctx.filter = activeCSS;
    ctx.drawImage(img,-W/2,-H/2);
    ctx.restore();
    if(vigOp>0) {
      const grd=ctx.createRadialGradient(W/2,H/2,W*.28,W/2,H/2,W*.82);
      grd.addColorStop(0,"transparent");
      grd.addColorStop(1,`rgba(0,0,0,${vigOp*.88})`);
      ctx.fillStyle=grd; ctx.fillRect(0,0,W,H);
    }
    if(fadeOp>0) { ctx.fillStyle=`rgba(255,255,255,${fadeOp*.38})`; ctx.fillRect(0,0,W,H); }
    st.textOverlays.forEach(({text,size,color})=>{
      const fs=Math.round((size/36)*(W*.09));
      ctx.font=`800 ${fs}px Syne,sans-serif`;
      ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.shadowBlur=14; ctx.shadowColor="rgba(0,0,0,.9)";
      ctx.fillStyle=color; ctx.fillText(text,W/2,H*.84);
    });
    const link=document.createElement("a");
    link.download=`pixelai_${Date.now()}.jpg`;
    link.href=c.toDataURL("image/jpeg",0.95);
    link.click();
    setBusy(false); setToast(true); setTimeout(()=>setToast(false),2600);
  };

  const addText = () => {
    if(!textIn.trim()) return;
    dispatch({type:"ADD_TEXT", overlay:{text:textIn, size:txtSize, color:txtColor}});
    setTextIn("");
  };

  // ── CSS ─────────────────────────────────────────────────────────────────────
  const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.px-root{font-family:'Syne',sans-serif;background:${T.bg};color:${T.txt};min-height:100vh;display:flex;justify-content:center}
.px-app{width:100%;max-width:430px;min-height:100vh;background:${T.bg};display:flex;flex-direction:column;overflow:hidden;position:relative}

.px-hdr{display:flex;align-items:center;justify-content:space-between;padding:13px 14px 10px;border-bottom:1px solid ${T.bdr};gap:8px;flex-shrink:0}
.px-logo{font-size:20px;font-weight:800;letter-spacing:-.8px;background:linear-gradient(120deg,${T.acc},${T.acc3});-webkit-background-clip:text;-webkit-text-fill-color:transparent;white-space:nowrap}
.px-logo em{-webkit-text-fill-color:${T.dim};font-style:normal}
.px-hdr-r{display:flex;align-items:center;gap:5px}

.px-ibtn{width:32px;height:32px;border-radius:8px;background:${T.card};border:1px solid ${T.bdr};color:${T.dim};font-size:14px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s}
.px-ibtn:hover{background:${T.elev};color:${T.txt};border-color:${T.bdr2}}
.px-ibtn:disabled{opacity:.3;pointer-events:none}
.px-ibtn.on{color:${T.acc};border-color:${T.acc};background:rgba(255,60,60,.08)}

.px-exp{height:32px;padding:0 13px;border-radius:8px;background:linear-gradient(135deg,${T.acc},#FF6040);border:none;color:#fff;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:5px;transition:all .2s;box-shadow:0 3px 12px -3px rgba(255,60,60,.5);white-space:nowrap}
.px-exp:hover{box-shadow:0 5px 18px -3px rgba(255,60,60,.7);transform:translateY(-1px)}
.px-exp:disabled{opacity:.55;pointer-events:none}

.px-img-wrap{position:relative;width:100%;aspect-ratio:1;background:${T.surf};overflow:hidden;flex-shrink:0}
.px-img{width:100%;height:100%;object-fit:cover;display:block;transition:filter .08s linear}
.px-vig{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 38%,rgba(0,0,0,${vigOp*.88}) 100%);pointer-events:none}
.px-fade{position:absolute;inset:0;background:rgba(255,255,255,${fadeOp*.38});pointer-events:none}
.px-badge{position:absolute;top:11px;padding:4px 9px;border-radius:7px;font-size:9.5px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase}
.px-before-b{left:11px;background:rgba(0,0,0,.72);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.12);color:#fff}
.px-after-b{right:11px;background:rgba(255,60,60,.85);color:#fff}
.px-txt-layer{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:8%;pointer-events:none;gap:4px}
.px-txt-el{font-family:'Syne',sans-serif;font-weight:800;text-shadow:0 2px 14px rgba(0,0,0,.85);text-align:center;padding:0 16px;line-height:1.15}

.px-qa{display:flex;gap:5px;padding:8px 11px;border-bottom:1px solid ${T.bdr};background:${T.surf};flex-shrink:0;overflow-x:auto;scrollbar-width:none}
.px-qa::-webkit-scrollbar{display:none}
.px-qb{flex-shrink:0;height:30px;padding:0 11px;border-radius:8px;background:${T.card};border:1px solid ${T.bdr};color:${T.dim};font-family:'Syne',sans-serif;font-size:11px;font-weight:600;display:flex;align-items:center;gap:4px;cursor:pointer;transition:all .18s;white-space:nowrap}
.px-qb:hover{background:${T.elev};color:${T.txt};border-color:${T.bdr2}}
.px-qb.ai{background:linear-gradient(135deg,rgba(0,212,170,.12),rgba(255,60,60,.05));border-color:${T.acc2};color:${T.acc2}}
.px-qb.red{color:${T.acc}}

.px-panel{flex:1;overflow-y:auto;overflow-x:hidden;min-height:0}
.px-panel::-webkit-scrollbar{display:none}

.px-shdr{display:flex;align-items:center;justify-content:space-between;padding:13px 14px 7px}
.px-stit{font-size:10.5px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${T.dim}}
.px-scap{font-size:10px;color:${T.mut};font-weight:600}

/* LOOKS */
.px-looks{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:0 11px 14px}
.px-look{border-radius:12px;border:1.5px solid ${T.bdr};background:${T.card};overflow:hidden;cursor:pointer;transition:all .2s}
.px-look:hover{transform:scale(1.02);border-color:${T.bdr2}}
.px-look.on{border-color:var(--lc);box-shadow:0 0 16px -5px var(--lc)}
.px-look-h{height:68px;display:flex;align-items:center;justify-content:center;font-size:24px}
.px-look-n{padding:5px 3px;text-align:center;font-size:9px;font-weight:700;color:${T.txt};white-space:pre-line;line-height:1.25}

/* FILTERS */
.px-fscroll{display:flex;gap:8px;padding:4px 11px 14px;overflow-x:auto;scrollbar-width:none}
.px-fscroll::-webkit-scrollbar{display:none}
.px-fi{flex-shrink:0;width:74px;cursor:pointer;transition:transform .18s}
.px-fi:hover{transform:translateY(-2px)}
.px-fthumb{width:74px;height:74px;border-radius:9px;overflow:hidden;border:2px solid ${T.bdr};transition:border-color .18s,box-shadow .18s;background:${T.card}}
.px-fi.on .px-fthumb{border-color:${T.acc};box-shadow:0 0 0 2px rgba(255,60,60,.2)}
.px-fthumb img{width:100%;height:100%;object-fit:cover;display:block}
.px-fn{text-align:center;font-size:9.5px;font-weight:600;color:${T.dim};margin-top:5px}
.px-fi.on .px-fn{color:${T.acc}}

/* ADJUSTMENTS */
.px-achips{display:flex;gap:5px;padding:11px 11px 5px;overflow-x:auto;scrollbar-width:none}
.px-achips::-webkit-scrollbar{display:none}
.px-ac{flex-shrink:0;height:29px;padding:0 9px;border-radius:8px;background:${T.card};border:1px solid ${T.bdr};color:${T.dim};font-family:'Syne',sans-serif;font-size:11px;font-weight:600;display:flex;align-items:center;gap:5px;cursor:pointer;transition:all .18s;white-space:nowrap}
.px-ac:hover{background:${T.elev};color:${T.txt};border-color:${T.bdr2}}
.px-ac.on{background:rgba(255,60,60,.09);border-color:${T.acc};color:${T.acc}}
.px-dot{width:4px;height:4px;border-radius:50%;background:${T.acc2};display:none}
.px-ac.mod .px-dot{display:block}

.px-sw{padding:10px 15px 4px}
.px-sh{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.px-sl{font-size:13px;font-weight:700;color:${T.txt}}
.px-sv{font-family:'DM Mono',monospace;font-size:13px;font-weight:500;color:${T.acc};min-width:38px;text-align:right}

.px-range{-webkit-appearance:none;appearance:none;width:100%;height:4px;border-radius:4px;background:${T.elev};outline:none;cursor:pointer}
.px-range::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:${T.acc};box-shadow:0 0 0 4px rgba(255,60,60,.18);cursor:pointer;transition:box-shadow .15s}
.px-range::-webkit-slider-thumb:hover{box-shadow:0 0 0 7px rgba(255,60,60,.25)}
.px-range::-webkit-slider-runnable-track{height:4px;border-radius:4px}

.px-hist{display:flex;gap:1px;align-items:flex-end;height:26px;padding:6px 15px 2px;opacity:.38}
.px-hb{flex:1;background:${T.acc2};border-radius:2px 2px 0 0;min-height:2px}

.px-div{height:1px;background:${T.bdr};margin:0 13px}

.px-agrid{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;padding:7px 11px 14px}
.px-am{background:${T.card};border:1px solid ${T.bdr};border-radius:10px;padding:9px 10px}
.px-amh{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.px-aml{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:${T.dim}}
.px-amv{font-family:'DM Mono',monospace;font-size:11px;color:${T.acc};font-weight:500}
.px-mr{-webkit-appearance:none;width:100%;height:3px;border-radius:3px;background:${T.elev};outline:none;cursor:pointer}
.px-mr::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:${T.acc};box-shadow:0 0 0 3px rgba(255,60,60,.18)}

/* TEXT */
.px-tp{padding:11px 13px;display:flex;flex-direction:column;gap:11px}
.px-inp{width:100%;background:${T.card};border:1px solid ${T.bdr};border-radius:10px;padding:11px 13px;color:${T.txt};font-family:'Syne',sans-serif;font-size:14px;outline:none;transition:border-color .18s}
.px-inp:focus{border-color:${T.acc2}}
.px-inp::placeholder{color:${T.mut}}
.px-crow{display:flex;gap:7px;flex-wrap:wrap}
.px-cs{width:28px;height:28px;border-radius:50%;cursor:pointer;transition:transform .15s;border:2px solid transparent}
.px-cs:hover{transform:scale(1.1)}
.px-cs.on{border-color:#fff;box-shadow:0 0 0 1px rgba(255,255,255,.25)}
.px-atb{height:40px;border-radius:10px;background:linear-gradient(135deg,${T.acc2},#00A884);border:none;color:#000;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;transition:all .2s}
.px-atb:hover{box-shadow:0 4px 16px -4px rgba(0,212,170,.6)}
.px-tlist{display:flex;flex-direction:column;gap:5px}
.px-tc{display:flex;align-items:center;gap:8px;background:${T.card};border:1px solid ${T.bdr};border-radius:8px;padding:7px 10px}
.px-tct{flex:1;font-size:12px;font-weight:700}
.px-del{width:22px;height:22px;border-radius:6px;background:rgba(255,60,60,.1);border:none;color:${T.acc};font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center}

/* UPLOAD */
.px-upload{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px 18px 30px;gap:18px}
.px-drop{width:100%;aspect-ratio:1;max-height:310px;border-radius:18px;border:2px dashed ${T.bdr2};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;cursor:pointer;transition:all .25s;background:${T.surf};position:relative;overflow:hidden}
.px-drop::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 30% 30%,rgba(255,60,60,.04),transparent 70%)}
.px-drop.dz{border-color:${T.acc};background:rgba(255,60,60,.03);transform:scale(.992)}
.px-di{width:66px;height:66px;border-radius:18px;background:linear-gradient(135deg,rgba(255,60,60,.15),rgba(0,212,170,.08));border:1px solid rgba(255,60,60,.18);display:flex;align-items:center;justify-content:center;font-size:26px}
.px-dt{font-size:18px;font-weight:800;color:${T.txt};letter-spacing:-.3px;text-align:center}
.px-ds{font-size:12px;color:${T.dim};text-align:center}
.px-cta{width:100%;height:48px;border-radius:13px;background:linear-gradient(135deg,${T.acc},#FF6040);border:none;color:#fff;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;box-shadow:0 7px 22px -6px rgba(255,60,60,.5)}
.px-cta:hover{transform:translateY(-1px);box-shadow:0 11px 28px -6px rgba(255,60,60,.6)}
.px-fps{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.px-fp{padding:4px 9px;border-radius:20px;background:${T.card};border:1px solid ${T.bdr};font-size:10.5px;color:${T.dim};font-weight:600}

/* TABS */
.px-tabs{display:flex;background:${T.surf};border-top:1px solid ${T.bdr};flex-shrink:0}
.px-tab{flex:1;height:52px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;cursor:pointer;border:none;background:none;color:${T.dim};font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;transition:color .18s}
.px-tab.on{color:${T.acc}}
.px-ti{font-size:16px;line-height:1}

/* TOAST */
.px-toast{position:fixed;bottom:68px;left:50%;transform:translateX(-50%) translateY(${toast?"0px":"14px"});opacity:${toast?1:0};transition:all .3s cubic-bezier(.34,1.56,.64,1);background:${T.acc2};color:#000;padding:8px 17px;border-radius:100px;font-size:12px;font-weight:700;pointer-events:none;white-space:nowrap;z-index:200;box-shadow:0 5px 22px -6px rgba(0,212,170,.6)}
`;

  // ── UPLOAD SCREEN ──────────────────────────────────────────────────────────
  if (!st.url) return (
    <div style={{fontFamily:"'Syne',sans-serif"}}>
      <style>{css}</style>
      <canvas ref={canvasRef} style={{display:"none"}} />
      <div className="px-root">
        <div className="px-app">
          <div className="px-hdr">
            <div className="px-logo">Pixel<em>AI</em></div>
            <span style={{fontSize:10,color:T.dim,fontWeight:700,letterSpacing:"1px"}}>V1 · MVP</span>
          </div>
          <div className="px-upload">
            <div
              className={`px-drop${isDrag?" dz":""}`}
              onClick={()=>fileRef.current?.click()}
              onDragOver={e=>{e.preventDefault();setIsDrag(true)}}
              onDragLeave={()=>setIsDrag(false)}
              onDrop={handleDrop}
            >
              <div className="px-di">📷</div>
              <div className="px-dt">Drop your photo here</div>
              <div className="px-ds">or tap to choose from gallery</div>
            </div>
            <button className="px-cta" onClick={()=>fileRef.current?.click()}>
              Choose Photo
            </button>
            <div className="px-fps">
              {["✨ AI Enhance","🎬 16 Filters","🌟 1-Tap Looks","↩️ Undo/Redo","📐 Rotate & Flip","📤 HD Export"].map(t=>(
                <span key={t} className="px-fp">{t}</span>
              ))}
            </div>
            <div style={{textAlign:"center",marginTop:4}}>
              <div style={{fontSize:13,fontWeight:800,color:T.txt,letterSpacing:"-.3px"}}>
                "The fastest way to make your photos
              </div>
              <div style={{fontSize:13,fontWeight:800,color:T.acc,letterSpacing:"-.3px"}}>
                Instagram-ready."
              </div>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}}
            onChange={e=>handleFile(e.target.files[0])} />
        </div>
      </div>
    </div>
  );

  // ── EDITOR ─────────────────────────────────────────────────────────────────
  return (
    <div style={{fontFamily:"'Syne',sans-serif"}}>
      <style>{css}</style>
      <canvas ref={canvasRef} style={{display:"none"}} />
      <div className="px-root">
        <div className="px-app">

          {/* HEADER */}
          <div className="px-hdr">
            <div className="px-logo">Pixel<em>AI</em></div>
            <div className="px-hdr-r">
              <button
                className={`px-ibtn${st.before?" on":""}`}
                title="Hold to see Before"
                onMouseDown={()=>dispatch({type:"BEFORE",val:true})}
                onMouseUp={()=>dispatch({type:"BEFORE",val:false})}
                onTouchStart={()=>dispatch({type:"BEFORE",val:true})}
                onTouchEnd={()=>dispatch({type:"BEFORE",val:false})}
              >⊿</button>
              <button className="px-ibtn" title="Undo ⌘Z"
                onClick={()=>dispatch({type:"UNDO"})}
                disabled={!st.history.length}>↩</button>
              <button className="px-ibtn" title="Redo ⌘⇧Z"
                onClick={()=>dispatch({type:"REDO"})}
                disabled={!st.future.length}>↪</button>
              <button className="px-exp" onClick={handleExport} disabled={busy}>
                {busy?"⏳":"↑"} {busy?"Saving…":"Export"}
              </button>
            </div>
          </div>

          {/* IMAGE */}
          <div className="px-img-wrap">
            <img ref={imgRef} src={st.url} alt="editing" className="px-img"
              crossOrigin="anonymous"
              style={{filter:activeCSS, transform:imgTransform}} />
            {vigOp>0&&!st.before&&<div className="px-vig"/>}
            {fadeOp>0&&!st.before&&<div className="px-fade"/>}
            {st.before&&<div className="px-badge px-before-b">BEFORE</div>}
            {!st.before&&hasEdits&&<div className="px-badge px-after-b">EDITED</div>}
            {!st.before&&st.textOverlays.length>0&&(
              <div className="px-txt-layer">
                {st.textOverlays.map((o,i)=>(
                  <div key={i} className="px-txt-el"
                    style={{fontSize:o.size,color:o.color}}>{o.text}</div>
                ))}
              </div>
            )}
          </div>

          {/* QUICK ACTIONS */}
          <div className="px-qa">
            <button className="px-qb ai" onClick={()=>dispatch({type:"ENHANCE"})}>✦ Auto-Enhance</button>
            <button className="px-qb" onClick={()=>dispatch({type:"ROTATE"})}>↻ Rotate</button>
            <button className="px-qb" onClick={()=>dispatch({type:"FLIP_H"})}>↔ Flip H</button>
            <button className="px-qb" onClick={()=>dispatch({type:"FLIP_V"})}>↕ Flip V</button>
            <button className="px-qb red" onClick={()=>dispatch({type:"RESET"})}>✕ Reset</button>
            <button className="px-qb" onClick={()=>fileRef.current?.click()}>⊕ New</button>
          </div>

          {/* PANEL */}
          <div className="px-panel">

            {/* ══ LOOKS ══ */}
            {st.tab==="looks"&&<>
              <div className="px-shdr">
                <span className="px-stit">1-Tap Looks</span>
                <span className="px-scap">Instant aesthetics</span>
              </div>
              <div className="px-looks">
                {LOOKS.map(look=>{
                  const isOn=st.filter===look.filter&&
                    JSON.stringify({...DA,...look.adj})===JSON.stringify(st.adj);
                  return (
                    <div key={look.id}
                      className={`px-look${isOn?" on":""}`}
                      style={{"--lc":look.color}}
                      onClick={()=>dispatch({type:"LOOK",adj:look.adj,filter:look.filter})}
                    >
                      <div className="px-look-h"
                        style={{background:`linear-gradient(135deg,${look.color}22,${look.color}55)`}}>
                        {look.emoji}
                      </div>
                      <div className="px-look-n">{look.name}</div>
                    </div>
                  );
                })}
              </div>
            </>}

            {/* ══ FILTERS ══ */}
            {st.tab==="filters"&&<>
              <div className="px-shdr">
                <span className="px-stit">Filters</span>
                <span className="px-scap">{FILTERS.length} presets</span>
              </div>
              <div className="px-fscroll">
                {FILTERS.map(f=>(
                  <div key={f.id}
                    className={`px-fi${st.filter===f.id?" on":""}`}
                    onClick={()=>dispatch({type:"FILTER",id:f.id})}
                  >
                    <div className="px-fthumb">
                      {st.url&&<img src={st.url} alt={f.name}
                        style={{filter:presetCSS(f.id)}} />}
                    </div>
                    <div className="px-fn">{f.name}</div>
                  </div>
                ))}
              </div>
            </>}

            {/* ══ ADJUST ══ */}
            {st.tab==="adjust"&&<>
              <div className="px-achips">
                {ADJS.map(a=>(
                  <button key={a.id}
                    className={`px-ac${selAdj===a.id?" on":""}${st.adj[a.id]!==0?" mod":""}`}
                    onClick={()=>setSelAdj(a.id)}
                  >
                    <span className="px-dot"/>
                    {a.icon} {a.label}
                  </button>
                ))}
              </div>

              {curAdj&&<div className="px-sw">
                <div className="px-sh">
                  <span className="px-sl">{curAdj.icon} {curAdj.label}</span>
                  <span className="px-sv">{st.adj[selAdj]>0?"+":""}{st.adj[selAdj]}</span>
                </div>
                <input type="range" className="px-range"
                  min={curAdj.min} max={curAdj.max}
                  value={st.adj[selAdj]}
                  onChange={e=>dispatch({type:"ADJ",key:selAdj,val:Number(e.target.value)})}
                />
              </div>}

              <div className="px-hist">
                {HIST.map((h,i)=><div key={i} className="px-hb" style={{height:`${h}%`}}/>)}
              </div>

              <div className="px-div"/>
              <div className="px-shdr">
                <span className="px-stit">All Adjustments</span>
              </div>
              <div className="px-agrid">
                {ADJS.map(a=>(
                  <div key={a.id} className="px-am">
                    <div className="px-amh">
                      <span className="px-aml">{a.label}</span>
                      <span className="px-amv">{st.adj[a.id]>0?"+":""}{st.adj[a.id]}</span>
                    </div>
                    <input type="range" className="px-mr"
                      min={a.min} max={a.max}
                      value={st.adj[a.id]}
                      onChange={e=>{
                        dispatch({type:"ADJ",key:a.id,val:Number(e.target.value)});
                        setSelAdj(a.id);
                      }}
                    />
                  </div>
                ))}
              </div>
            </>}

            {/* ══ TEXT ══ */}
            {st.tab==="text"&&<div className="px-tp">
              <input className="px-inp"
                placeholder="Type overlay text…"
                value={textIn}
                onChange={e=>setTextIn(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&addText()}
              />
              <div>
                <div className="px-sh" style={{marginBottom:10}}>
                  <span className="px-sl">Font Size</span>
                  <span className="px-sv">{txtSize}px</span>
                </div>
                <input type="range" className="px-range" min={14} max={80}
                  value={txtSize} onChange={e=>setTxtSize(Number(e.target.value))} />
              </div>
              <div>
                <div className="px-stit" style={{marginBottom:9}}>Text Color</div>
                <div className="px-crow">
                  {["#FFFFFF","#000000","#FF3C3C","#00D4AA","#FFB800","#4A90E2","#E91E8C","#FF6B35"].map(c=>(
                    <div key={c}
                      className={`px-cs${txtColor===c?" on":""}`}
                      style={{background:c,borderColor:c==="#FFFFFF"?T.bdr2:"transparent",
                        border:`2px solid ${txtColor===c?"#fff":"transparent"}`}}
                      onClick={()=>setTxtColor(c)}
                    />
                  ))}
                </div>
              </div>
              <button className="px-atb" onClick={addText}>+ Add Text Overlay</button>
              {st.textOverlays.length>0&&<>
                <div className="px-stit">Added Text</div>
                <div className="px-tlist">
                  {st.textOverlays.map((o,i)=>(
                    <div key={i} className="px-tc">
                      <span className="px-tct" style={{color:o.color}}>"{o.text}"</span>
                      <span style={{fontFamily:"'DM Mono'",fontSize:10,color:T.dim}}>{o.size}px</span>
                      <button className="px-del"
                        onClick={()=>dispatch({type:"REMOVE_TEXT",idx:i})}>✕</button>
                    </div>
                  ))}
                </div>
              </>}
            </div>}

          </div>{/* end panel */}

          {/* TAB BAR */}
          <div className="px-tabs">
            {[
              {id:"looks",icon:"✨",label:"Looks"},
              {id:"filters",icon:"🎨",label:"Filters"},
              {id:"adjust",icon:"⚙",label:"Adjust"},
              {id:"text",icon:"T",label:"Text"},
            ].map(tab=>(
              <button key={tab.id}
                className={`px-tab${st.tab===tab.id?" on":""}`}
                onClick={()=>dispatch({type:"TAB",tab:tab.id})}
              >
                <span className="px-ti">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* TOAST */}
          <div className="px-toast">✓ Saved to downloads!</div>

          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}}
            onChange={e=>handleFile(e.target.files[0])} />

        </div>
      </div>
    </div>
  );
}
