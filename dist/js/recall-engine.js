export const HOUR=3600000;
export function newSession(now=Date.now()){return {id:`${now}-${Math.random().toString(36).slice(2,8)}`,count:0,reviewCount:0,history:[],remedials:{},lastWrong:{},current:null,revealed:false,typed:'',spelling:false,startedAt:now,mode:'learn',studyPhase:'learn',learnQueue:[]};}
export function selectCard(questions,state,now=Date.now(),random=Math.random){
 const s=state.session;if(s.count>=20)return {reason:'Đã hoàn thành 20 lượt. Bắt đầu phiên mới khi sẵn sàng.'};
 const newCards=[],review=[],audit=[];
 for(const q of questions){const c=state.cards[q.sourceId];if(!c){newCards.push(q);continue;}
  const wrongAt=s.lastWrong[q.sourceId];if(wrongAt!==undefined){const count=s.remedials[q.sourceId]||0;if(count>=2)continue;const gap=Math.min(5,Math.max(0,questions.length-1));if(s.count-wrongAt<gap)continue;review.push(q);continue;}
  if(c.examWrong||c.dueAt<=now)review.push(q);else if(c.lastCorrectAt&&now-c.lastSeen>=4*HOUR)audit.push(q);
 }
 const ratio=state.day===1||state.catchUp?3:2;
 const wantNew=state.day===3&&!state.catchUp?review.length===0:s.count%ratio!==(ratio-1);
 let pool=wantNew?newCards:review,reason=wantNew?'Câu mới':'Ôn đến hạn';
 if(!wantNew&&((s.reviewCount||0)+1)%10===0&&audit.length){pool=audit.sort((a,b)=>state.cards[a.sourceId].lastSeen-state.cards[b.sourceId].lastSeen);reason='Kiểm tra lại câu đã nhớ';}
 if(!pool.length){pool=wantNew?review:newCards;reason=wantNew?'Ôn đến hạn':'Câu mới';}
 if(!pool.length)return {reason:'Đã hết câu phù hợp lúc này. Các câu khó được tạm nghỉ; hãy quay lại ở phiên sau hoặc khi đến hạn.'};
 return {card:pool[Math.floor(random()*pool.length)],reason};
}
export function gradeCard(state,id,grade,now=Date.now(),provenance={}){
 if(!['wrong','slow','correct'].includes(grade))throw Error('Invalid grade');
 const s=state.session,previous=state.cards[id],wasRemedial=s.lastWrong[id]!==undefined;
 const c=previous?{...previous}:{attempts:0,misses:0,lastSeen:0,dueAt:0,delayedCorrect:0};
 if(previous)s.reviewCount=(s.reviewCount||0)+1;
 c.attempts++;c.lastSeen=now;c.lastSession=s.id;c.examWrong=false;
 if(grade==='wrong'){c.misses++;c.delayedCorrect=0;c.lastCorrectAt=0;c.dueAt=now;s.lastWrong[id]=s.count+1;}
 else {if(grade==='correct'){if(c.lastCorrectAt&&c.lastCorrectSession!==s.id&&now-c.lastCorrectAt>=4*HOUR)c.delayedCorrect++;c.lastCorrectAt=now;c.lastCorrectSession=s.id;}c.dueAt=now+(grade==='slow'?HOUR:c.delayedCorrect>=2?24*HOUR:4*HOUR);delete s.lastWrong[id];}
 c.lastAttempt={grade,at:now,sessionId:s.id,gradingMode:'self-reported',...provenance};state.cards[id]=c;
 if(wasRemedial)s.remedials[id]=(s.remedials[id]||0)+1;
 s.count++;s.history.push(id);s.current=null;s.revealed=false;s.typed='';state.totalAttempts++;
 return c;
}


