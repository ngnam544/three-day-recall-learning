import {BANK_ID} from './question-repository.js';
export const KEY='three-day-recall:v1';
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const number=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0;
const id=v=>Number.isInteger(v)&&v>=1&&v<=600;
function upgradeState(s){if(!object(s))return s;if(s.readQuestionId!==undefined&&s.readQuestionId!==null&&!id(s.readQuestionId))s.readQuestionId=null;if(!object(s.starredIds))s.starredIds={};for(const [key,value]of Object.entries(s.starredIds)){if(!id(Number(key))||!(value===true||['red','yellow','green'].includes(value)))delete s.starredIds[key];else if(value===true)s.starredIds[key]='yellow';}if(typeof s.readVietnamese!=='boolean')s.readVietnamese=false;return s;}
export function freshState(){return {schemaVersion:1,bankId:BANK_ID,cards:{},session:null,exam:null,day:1,catchUp:false,totalAttempts:0,studyMs:0,savedAt:0,readQuestionId:null,starredIds:{},readVietnamese:false};}
export function validateState(s){
 if(!object(s)||s.schemaVersion!==1||s.bankId!==BANK_ID||!object(s.cards)||![1,2,3].includes(s.day)||typeof s.catchUp!=='boolean'||!number(s.totalAttempts)||!number(s.studyMs))throw Error('Bản lưu không đúng phiên bản/ngân hàng hoặc cấu trúc.');
 if(s.readQuestionId!==undefined&&s.readQuestionId!==null&&!id(s.readQuestionId))throw Error('Câu đang đọc không hợp lệ.');
 if(s.starredIds!==undefined&&(!object(s.starredIds)||Object.entries(s.starredIds).some(([key,value])=>!id(Number(key))||!['red','yellow','green'].includes(value))))throw Error('Đánh dấu màu không hợp lệ.');
 if(s.readVietnamese!==undefined&&typeof s.readVietnamese!=='boolean')throw Error('Ngôn ngữ đọc không hợp lệ.');
 for(const [key,c] of Object.entries(s.cards)){
  if(!id(Number(key))||String(Number(key))!==key||!object(c))throw Error('ID thẻ không hợp lệ.');
  for(const field of ['attempts','misses','lastSeen','dueAt','delayedCorrect'])if(!number(c[field]))throw Error('Số liệu thẻ không hợp lệ.');
  if(c.examWrong!==undefined&&typeof c.examWrong!=='boolean')throw Error('Trạng thái ôn thi không hợp lệ.');
  if(c.lastAttempt!==undefined&&(!object(c.lastAttempt)||!['wrong','slow','correct'].includes(c.lastAttempt.grade)||!number(c.lastAttempt.at)||typeof c.lastAttempt.sessionId!=='string'||!['self-reported','typed-automatic'].includes(c.lastAttempt.gradingMode)))throw Error('Lần tự chấm không hợp lệ.');
  if(c.lastCorrectAt!==undefined&&!number(c.lastCorrectAt))throw Error('Mốc ôn tập không hợp lệ.');
  if(c.lastCorrectSession!==undefined&&typeof c.lastCorrectSession!=='string')throw Error('Phiên ôn không hợp lệ.');
 }
 if(s.session!==null){const x=s.session;if(!object(x)||typeof x.id!=='string'||!number(x.count)||x.count>20||!Array.isArray(x.history)||x.history.some(v=>!id(v))||!object(x.remedials)||!object(x.lastWrong)||!(x.current===null||id(x.current))||typeof x.revealed!=='boolean'||typeof x.typed!=='string'||typeof x.spelling!=='boolean'||!number(x.startedAt))throw Error('Phiên học không hợp lệ.');if(x.learnQueue!==undefined&&(!Array.isArray(x.learnQueue)||x.learnQueue.some(v=>!id(v))))throw Error('Danh sách học không hợp lệ.');if(x.studyPhase!==undefined&&!['learn','recall','recall-answer'].includes(x.studyPhase))throw Error('Giai đoạn học không hợp lệ.');if(x.mode!==undefined&&!['learn','recall'].includes(x.mode))throw Error('Chế độ học không hợp lệ.');for(const map of [x.remedials,x.lastWrong])for(const [k,v]of Object.entries(map))if(!id(Number(k))||!number(v))throw Error('Hàng đợi không hợp lệ.');}
 if(s.exam!==null){const x=s.exam;if(!object(x)||typeof x.id!=='string'||!Array.isArray(x.questions)||x.questions.length!==30||new Set(x.questions.map(q=>q.sourceId)).size!==30||x.questions.some(q=>!id(q.sourceId)||typeof q.question!=='string'||typeof q.sourceAnswer!=='string'||!Array.isArray(q.reviewFlags))||!number(x.startedAt)||!number(x.endsAt)||x.endsAt!==x.startedAt+3600000||!Number.isInteger(x.index)||x.index<0||x.index>29||!object(x.checked)||!object(x.grades)||!(x.finalizedAt===null||number(x.finalizedAt)))throw Error('Bài thi không hợp lệ.');if(x.finalizedAt===null&&Object.keys(x.grades).length)throw Error('Bài thi chưa kết thúc nhưng đã có điểm.');const ids=x.questions.map(q=>q.sourceId);for(const [k,v]of Object.entries(x.checked))if(!ids.includes(Number(k))||typeof v!=='boolean')throw Error('Đánh dấu thi không hợp lệ.');for(const [k,v]of Object.entries(x.grades))if(!ids.includes(Number(k))||!['correct','wrong'].includes(v))throw Error('Tự chấm không hợp lệ.');}
 return s;
}
export function readState(storage){const raw=storage.getItem(KEY);if(raw===null)return {state:freshState(),raw:null};try{return {state:validateState(upgradeState(JSON.parse(raw))),raw};}catch(error){return {state:null,raw,error};}}
export function saveState(storage,state){const candidate={...state,savedAt:Date.now()};const raw=JSON.stringify(validateState(candidate));storage.setItem(KEY,raw);state.savedAt=candidate.savedAt;return raw;}
export function parseImport(raw){return validateState(upgradeState(JSON.parse(raw)));}
export function orphanIds(state,questions){const ids=new Set(questions.map(q=>q.sourceId));return Object.keys(state.cards).map(Number).filter(id=>!ids.has(id));}

