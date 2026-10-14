import {loadBank} from './question-repository.js?v=4d7a28a';
import {KEY,readState,saveState,parseImport,freshState} from './state-store.js?v=4d7a28a';
import {el,add,button,note,download} from './render-utils.js';
import {dashboard} from './dashboard-view.js?v=4d7a28a';
import {studyView} from './study-controller.js?v=4d7a28a';
import {examView,updateExamTimer} from './exam-controller.js';
const root=document.querySelector('#app');let view='home',rawRecovery=null,storageBlocked=false;
const ctx={root,state:null,bank:null,promptStarted:Date.now(),studyMode:'learn',save,render,home:()=>go('home'),study:(mode='learn')=>{ctx.studyMode=mode;if(ctx.state.session?.mode!==mode||mode==='review')ctx.state.session=null;go('study');},exam:()=>go('exam'),exportState,importState,reset};
function save(){try{saveState(localStorage,ctx.state);return true;}catch(error){note('Không lưu được: '+error.message+'. Hãy xuất JSON ngay.');return false;}}
function go(next){if(ctx.state)save();view=next;render();window.scrollTo(0,0);}
function render(){root.replaceChildren();if(!ctx.state){recovery();return;}if(!ctx.bank){root.append(el('h1','Chưa tải được câu hỏi.'),el('p',ctx.bankError||'Đang tải…'),button('Thử tải lại',()=>location.reload(),'primary'),button('Xuất bản lưu',exportState));return;}if(view==='study')studyView(ctx);else if(view==='exam')examView(ctx);else dashboard(ctx);updateExamTimer(ctx);}
function exportState(){let raw=rawRecovery;try{if(!raw)raw=JSON.stringify(ctx.state,null,2);download(raw,'nho-lau-backup.json');note('Đã xuất bản lưu JSON.');}catch(error){note('Không xuất được: '+error.message);}}
function importState(){const input=el('input',null,{type:'file',accept:'.json,application/json'});input.onchange=async()=>{try{const file=input.files[0];if(!file)return;if(file.size>10000000)throw Error('Tệp quá lớn.');const candidate=parseImport(await file.text());if(!confirm(`Nhập bản lưu với ${Object.keys(candidate.cards).length} thẻ, ${candidate.exam?'có':'không có'} bài thi? Bản lưu hiện tại sẽ được thay thế.`))return;saveState(localStorage,candidate);ctx.state=candidate;rawRecovery=null;view='home';render();note('Đã nhập bản lưu.');}catch(error){note('Không nhập: '+error.message+'. Bản lưu hiện tại được giữ.');}};input.click();}
function reset(){if(!confirm('Xóa toàn bộ tiến độ và bài thi trên trình duyệt này? Xuất JSON trước nếu muốn giữ lại.'))return;const next=freshState();try{saveState(localStorage,next);ctx.state=next;rawRecovery=null;view='home';render();}catch(error){note('Không thể đặt lại: '+error.message);}}
function recovery(){add(root,el('h1','Bản lưu cần phục hồi.'),el('p','Không thể đọc bản lưu. Dữ liệu cũ chưa bị ghi đè. Xuất bản gốc trước khi đặt lại.',{class:'warning'}),button('Xuất dữ liệu gốc',exportState,'primary'),button('Nhập bản JSON tốt',importState),button('Đặt lại sau xác nhận',reset,'danger'));}
document.querySelector('#share').onclick=async()=>{try{if(navigator.share)await navigator.share({title:'Nhớ lâu · 3 ngày',url:location.href});else if(navigator.clipboard){await navigator.clipboard.writeText(location.href);note('Đã sao chép liên kết để gửi bạn bè.');}else prompt('Sao chép liên kết này:',location.href);}catch(error){if(error.name!=='AbortError')note('Chưa chia sẻ được. Sao chép địa chỉ trên thanh trình duyệt.');}};
try{const result=readState(localStorage);ctx.state=result.state;rawRecovery=result.error?result.raw:null;}catch(error){storageBlocked=true;ctx.state=null;root.textContent='Không truy cập được bộ nhớ trình duyệt.';}
try{ctx.bank=await loadBank();}catch(error){ctx.bankError=error.message;}
render();setInterval(()=>updateExamTimer(ctx),1000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateExamTimer(ctx);});
