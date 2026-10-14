import {loadBank} from './question-repository.js?v=ui20261014k';
import {KEY,readState,saveState,parseImport,freshState} from './state-store.js?v=ui20261014k';
import {el,add,button,note,download} from './render-utils.js';
import {dashboard} from './dashboard-view.js?v=ui20261014k';
import {studyView} from './study-controller.js?v=ui20261014k';
import {examView,updateExamTimer} from './exam-controller.js?v=ui20261014k';
import {markedView} from './marked-view.js?v=ui20261014k';
const root=document.querySelector('#app');let view='home',rawRecovery=null,storageBlocked=false;
const ctx={root,state:null,bank:null,practiceMode:'read',save,render,home:()=>go('home'),study:(mode='read')=>{ctx.practiceMode=mode;go('study');},exam:()=>go('exam'),marked:()=>go('marked'),exportState,importState,reset};
function save(){try{saveState(localStorage,ctx.state);return true;}catch(error){note('Không lưu được tiến độ trên thiết bị này.');return false;}}
function go(next){if(ctx.state)save();view=next;render();window.scrollTo(0,0);}
function render(){root.replaceChildren();if(!ctx.state){recovery();return;}if(!ctx.bank){root.append(el('h1','Chưa tải được câu hỏi.'),el('p',ctx.bankError||'Đang tải…'),button('Thử tải lại',()=>location.reload(),'primary'),button('Xuất bản lưu',exportState));return;}if(view==='study')studyView(ctx);else if(view==='exam')examView(ctx);else if(view==='marked')markedView(ctx);else dashboard(ctx);updateExamTimer(ctx);}
function exportState(){let raw=rawRecovery;try{if(!raw)raw=JSON.stringify(ctx.state,null,2);download(raw,'nho-lau-backup.json');note('Đã xuất bản lưu JSON.');}catch(error){note('Không xuất được: '+error.message);}}
function importState(){const input=el('input',null,{type:'file',accept:'.json,application/json'});input.onchange=async()=>{try{const file=input.files[0];if(!file)return;if(file.size>10000000)throw Error();const candidate=parseImport(await file.text());if(!confirm('Thay tiến độ hiện tại bằng tệp này?'))return;saveState(localStorage,candidate);ctx.state=candidate;rawRecovery=null;view='home';render();note('Đã nhập tiến độ.');}catch(error){note('Không thể nhập tệp này. Tiến độ hiện tại chưa đổi.');}};input.click();}
function reset(){if(!confirm('Xóa toàn bộ tiến độ trên trình duyệt này?'))return;const next=freshState();try{saveState(localStorage,next);ctx.state=next;rawRecovery=null;view='home';render();}catch(error){note('Không thể xóa tiến độ.');}}
function recovery(){add(root,el('h1','Không đọc được tiến độ.'),el('p','Xuất bản lưu hiện có hoặc nhập một tệp JSON hợp lệ.',{class:'warning'}),button('Xuất tiến độ',exportState,'primary'),button('Nhập tiến độ',importState));}
document.querySelector('#share').onclick=async()=>{try{if(navigator.share)await navigator.share({title:'Ôn 600 câu hỏi',url:location.href});else if(navigator.clipboard){await navigator.clipboard.writeText(location.href);note('Đã sao chép liên kết.');}else prompt('Sao chép liên kết:',location.href);}catch(error){if(error.name!=='AbortError')note('Không thể chia sẻ. Sao chép địa chỉ trang.');}};
try{const result=readState(localStorage);ctx.state=result.state;rawRecovery=result.error?result.raw:null;}catch(error){storageBlocked=true;ctx.state=null;root.textContent='Không truy cập được bộ nhớ trình duyệt.';}
try{ctx.bank=await loadBank();}catch(error){ctx.bankError=error.message;}
render();setInterval(()=>updateExamTimer(ctx),1000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateExamTimer(ctx);});
