export const BANK_ID='general-knowledge-600';
export function validateBank(data){
 if(data.schemaVersion!==1||data.bankId!==BANK_ID||!Array.isArray(data.questions)||!data.questions.length) throw Error('Ngân hàng câu hỏi không hợp lệ hoặc chưa có câu hỏi.');
 const ids=new Set();
 for(const q of data.questions){
  if(!Number.isInteger(q.sourceId)||q.sourceId<1||q.sourceId>600||ids.has(q.sourceId)||typeof q.question!=='string'||!q.question.trim()||typeof q.sourceAnswer!=='string'||!q.sourceAnswer.trim()||typeof q.sourceImage!=='string'||!['prose','exact'].includes(q.matchingPolicy)||!Array.isArray(q.reviewFlags)||!Array.isArray(q.acceptedAliases)||q.acceptedAliases.some(a=>typeof a!=='string')) throw Error('Dữ liệu câu hỏi bị lỗi: '+q.sourceId);
  ids.add(q.sourceId);
 }
 return {...data, missingIds:Array.from({length:600},(_,i)=>i+1).filter(id=>!ids.has(id))};
}
export function ranges(ids){let out=[],start,last;for(const id of ids){if(start===undefined)start=id;else if(id!==last+1){out.push(start===last?`${start}`:`${start}–${last}`);start=id;}last=id;}if(start!==undefined)out.push(start===last?`${start}`:`${start}–${last}`);return out.join(', ');}
export async function loadBank(){const r=await fetch('./data/questions.json');if(!r.ok)throw Error('Chưa tải được câu hỏi. Vui lòng thử lại.');return validateBank(await r.json());}
