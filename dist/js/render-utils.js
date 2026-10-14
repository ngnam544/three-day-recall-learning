export function el(tag,text,attrs={}){const node=document.createElement(tag);if(text!==null&&text!==undefined)node.textContent=text;for(const [k,v] of Object.entries(attrs)){if(k==='class')node.className=v;else node.setAttribute(k,v);}return node;}
export function add(parent,...children){parent.append(...children.filter(Boolean));return parent;}
export function button(text,action,cls=''){const b=el('button',text,{type:'button',class:cls});b.onclick=action;return b;}
export function checkbox(text,checked,action){const input=el('input',null,{type:'checkbox'});input.checked=checked;input.onchange=()=>action(input.checked);return add(el('label'),input,el('span',text));}
export function panel(parent,title){const c=el('section',null,{class:'card'});if(title)c.append(el('h2',title));parent.append(c);return c;}
export function note(text){const n=document.querySelector('#notice');n.textContent=text;clearTimeout(note.timer);note.timer=setTimeout(()=>n.textContent='',6000);}
export function download(raw,name){const url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));const a=el('a',null,{href:url,download:name});a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
