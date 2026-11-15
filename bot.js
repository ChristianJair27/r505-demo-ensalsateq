/* Demo asistente WhatsApp EnsalsateQ - Revolution505. Todo corre en el navegador. */
(function(){
"use strict";
var $=function(id){return document.getElementById(id)};
var chat=$("chat"),chips=$("chips"),form=$("form"),input=$("msg"),feed=$("feed"),statusEl=$("waStatus");

/* ---------- Datos ---------- */
var G="https://maps.app.goo.gl/";
var BR={
 corregidora:{n:"Corregidora (El Pueblito)",a:["corregidora","pueblito","el pueblito","correguidora"],map:G+"UsfKjZcWSek1DSeRA",dir:null,days:[1,2,3,4,5,6]},
 luz:{n:"Av. de la Luz",a:["luz","av de la luz","avenida de la luz","titanium","san agustin"],map:G+"xB2KVwYaCHNuKvK69",dir:"Plaza Titanium, Av. San Agustín 1674, local 1 (acceso por Av. de la Luz)",days:[1,2,3,4,5,6]},
 alcanfores:{n:"Alcanfores",a:["alcanfores","alcanfor","los alcanfores"],map:G+"VdXSB",dir:null,days:[1,2,3,4,5,6]},
 auditorio:{n:"Auditorio Josefa",a:["auditorio","josefa","villas del sol","zimapan"],map:G+"hCMSdz717ykZVooU8",dir:"Sierra de Zimapán 103, Villas del Sol",days:[1,2,3,4,5,6]},
 juriquilla:{n:"Juriquilla",a:["juriquilla","juriqilla","jurica","attitude","universitario"],map:G+"8mivGiECrxjW6FXb7",dir:"Blvd. Universitario 502, dentro de Attitude Ballet",days:[2,4]},
 hilvana:{n:"Hilvana",a:["hilvana","hilbana"],map:G+"krFdHR5F8maMeNGs7",dir:null,days:[1,2,3,4,5,6]},
 refugio:{n:"El Refugio (El Marqués)",a:["refugio","el refugio","marques","el marques"],map:G+"Gu7VMPes21z9hAyu6",dir:null,days:[1,2,3,4,5,6]}
};
var BR_IDS=Object.keys(BR);
var STY={salsa:{n:"Salsa",a:["salsa","salza","sasla"]},bachata:{n:"Bachata",a:["bachata","bachatta","bacahta","vachata","bachta"]},cumbia:{n:"Cumbia",a:["cumbia","cunbia","kumbia","cumbias"]}};
var DAYS=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
var DAY_A=[["domingo"],["lunes"],["martes"],["miercoles"],["jueves"],["viernes"],["sabado","sabados"]];
/* Horario de ejemplo por ritmo (entre semana / sábado) */
var SAMPLE_T={salsa:["7:00 pm","10:00 am"],bachata:["8:00 pm","11:00 am"],cumbia:["9:00 pm","12:00 pm"],any:["8:00 pm","11:00 am"]};
var EVENTS=[
 {id:"rumbera",n:"Noche Rumbera en Zákia",date:new Date(2026,10,14,23,59),txt:"**Noche Rumbera en Zákia**, sábado 14 de noviembre, en Santas Alitas Zákia (Paseo de Zakia Pte 4100). Clase de salsa a las 7:00 pm y música en vivo con social desde las 8:00 pm. Reservaciones al 561 567 2389."},
 {id:"social",n:"Social Night (Level Up)",date:new Date(2026,10,21,23,59),txt:"**Social Night · Social Level Up**, sábado 21 de noviembre, en EnsalsateQ Corregidora. Clase de 8:00 a 9:00 pm y social de 9:00 pm a 1:30 am con DJ Quest."}
];

/* ---------- Texto ---------- */
function norm(s){
 s=(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
 s=s.replace(/[^a-z0-9 ]+/g," ").replace(/(.)\1{2,}/g,"$1");
 var rep={q:"que",k:"que",xq:"porque",pq:"porque",info:"informacion",inf:"informacion",hr:"horario",hrs:"horarios",tmb:"tambien",tb:"tambien",grax:"gracias",grs:"gracias",ntp:"no te preocupes",bn:"bien",sta:"esta",ola:"hola",holi:"hola",dnd:"donde",cuanto:"cuanto",kiero:"quiero",qiero:"quiero",ps:"pues",dia:"dia"};
 return s.split(/\s+/).filter(Boolean).map(function(w){return rep[w]||w}).join(" ");
}
function lev(a,b){
 if(a===b)return 0;var m=a.length,n=b.length;if(!m)return n;if(!n)return m;
 var p=new Array(n+1),c=new Array(n+1),i,j;for(j=0;j<=n;j++)p[j]=j;
 for(i=1;i<=m;i++){c[0]=i;for(j=1;j<=n;j++){c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));}var t=p;p=c;c=t;}
 return p[n];
}
function tol(len){return len<=4?0:len<=7?1:2}
/* kw: "palabra", "prefij*", o frase de varias palabras */
function hasKw(text,toks,kw){
 if(kw.indexOf(" ")>-1){
  if((" "+text+" ").indexOf(" "+kw.replace("*","")) >-1)return true;
  var parts=kw.split(" "),k=0;
  for(var i=0;i<toks.length&&k<parts.length;i++){if(wordMatch(toks[i],parts[k]))k++;else if(k>0&&!wordMatch(toks[i],parts[0]))k=0;}
  return k===parts.length;
 }
 for(var t=0;t<toks.length;t++)if(wordMatch(toks[t],kw))return true;
 return false;
}
function wordMatch(tok,kw){
 if(kw.slice(-1)==="*"){var st=kw.slice(0,-1);if(tok.length<st.length-1)return false;
  if(tok.indexOf(st)===0)return true;return st.length>=5&&lev(tok.slice(0,st.length),st)<=1;}
 if(tok===kw)return true;var t=tol(kw.length);return t>0&&Math.abs(tok.length-kw.length)<=t&&lev(tok,kw)<=t;
}

var INTENTS=[
 {id:"humano",w:3,k:["persona","asesor*","humano","alguien","recepcion*","gerente","encargad*","hablar con","queja*","atienda","llamar*","marcar*","agente"]},
 {id:"cancelar",w:2,k:["cancelar","cancela","salir","ya no","olvidalo","menu","inicio","reiniciar","volver"]},
 {id:"muestra",w:3,k:["muestra","prueba","probar","gratis","gratuita","primera clase","clase de cortesia","cortesia","conocer la escuela"]},
 {id:"inscribir",w:3,k:["inscrib*","inscripc*","apartar","aparta*","agend*","reserv*","registr*","quiero clase","quiero una clase","quiero tomar","empezar","entrar","unirme"]},
 {id:"precios",w:3,k:["precio*","costo*","cuesta*","cuanto","cobran","mensualidad","promo*","paquete*","pago*","pagar","tarifa*","descuento*","prodancer","oxxo","paypal","transferencia"]},
 {id:"horarios",w:2,k:["horario*","a que hora","horas","que dias","clases","clase","turno*","cuando","grupo*","nivel*"]},
 {id:"sucursales",w:2,k:["sucursal*","donde","ubicac*","direcc*","mapa","cerca","llegar","como llego","domicilio"]},
 {id:"eventos",w:3,k:["evento*","social","sociales","fiesta*","noche rumbera","social night","rumbera","taller*","viaje*","congreso*","zakia","level up","bailar el sabado"]},
 {id:"zapatos",w:3,k:["zapat*","tacon*","calzado","tienda","talla","danceshoes","tenis"]},
 {id:"online",w:3,k:["online","en linea","virtual","curso online","desde casa","video*"]},
 {id:"intensivo",w:3,k:["intensiv*","10 horas","diez horas","desde cero","principiante*","no se bailar","nunca he bailado"]},
 {id:"coreo",w:3,k:["coreograf*","xv","quince","boda*","vals"]},
 {id:"particular",w:3,k:["particular*","privad*","personalizad*","1 a 1","uno a uno"]},
 {id:"empresa",w:3,k:["empresa*","corporativ*","emplead*","integracion"]},
 {id:"pareja",w:3,k:["pareja","sin pareja","ir solo","ir sola","voy solo","voy sola","acompanante"]},
 {id:"gracias",w:2,k:["gracias","muchas gracias","perfecto","excelente","listo","va","ok","okay","sale"]},
 {id:"adios",w:2,k:["adios","bye","hasta luego","nos vemos"]},
 {id:"saludo",w:1,k:["hola","buenas","buen dia","buenos dias","buenas tardes","buenas noches","que tal","hey"]},
 {id:"si",w:1,k:["si","sip","claro","correcto","confirmo","confirmar","de acuerdo","esta bien","asi es","dale"]},
 {id:"no",w:1,k:["no","nop","incorrecto","cambiar","corregir"]}
];
function detect(raw){
 var text=norm(raw),toks=text.split(" "),best=null,bs=0,scores={};
 INTENTS.forEach(function(it){var s=0;it.k.forEach(function(kw){if(hasKw(text,toks,kw))s+=it.w*(kw.indexOf(" ")>-1?1.5:1);});scores[it.id]=s;if(s>bs){bs=s;best=it.id;}});
 return {id:best,score:bs,scores:scores,text:text,toks:toks};
}
function findBranch(text,toks){for(var i=0;i<BR_IDS.length;i++){var b=BR[BR_IDS[i]];for(var j=0;j<b.a.length;j++)if(hasKw(text,toks,b.a[j]))return BR_IDS[i];}return null;}
function findStyle(text,toks){for(var k in STY)for(var j=0;j<STY[k].a.length;j++)if(hasKw(text,toks,STY[k].a[j]))return k;return null;}
function findDay(text,toks){
 var now=new Date();
 if(/\bpasado manana\b/.test(text))return (now.getDay()+2)%7;
 if(/\bmanana\b/.test(text)&&!/\b(en la|por la|de la) manana\b/.test(text))return (now.getDay()+1)%7;
 if(/\bhoy\b/.test(text))return now.getDay();
 for(var d=0;d<7;d++)for(var j=0;j<DAY_A[d].length;j++)if(hasKw(text,toks,DAY_A[d][j]))return d;
 return null;
}
function findName(raw){
 var m=raw.match(/(?:me llamo|mi nombre es|soy)\s+([A-Za-zÁÉÍÓÚÑáéíóúñü]+(?:\s+[A-Za-zÁÉÍÓÚÑáéíóúñü]+){0,3})/i);
 return m?cap(m[1]):null;
}
function cap(s){return s.trim().split(/\s+/).map(function(w){return w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()}).join(" ");}

/* ---------- UI ---------- */
function hhmm(){var d=new Date();return d.toLocaleTimeString("es-MX",{hour:"numeric",minute:"2-digit"});}
function esc(s){return s.replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]});}
function fmt(s){return esc(s).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/\[(.+?)\]\((https?:[^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');}
function scroll(){chat.scrollTop=chat.scrollHeight;}
function addMsg(side,html,extra){
 var w=document.createElement("div");w.className="msg "+side;
 w.innerHTML='<div class="bub">'+html+(extra||"")+'<span class="t">'+hhmm()+'</span></div>';
 chat.appendChild(w);scroll();return w;
}
function addSys(t){var d=document.createElement("div");d.className="sys";d.innerHTML="<span>"+fmt(t)+"</span>";chat.appendChild(d);scroll();}
function setChips(list){
 chips.innerHTML="";(list||[]).forEach(function(c){var b=document.createElement("button");b.type="button";b.className="chip";b.textContent=c;b.onclick=function(){send(c)};chips.appendChild(b);});
}
var queue=Promise.resolve(),uq=Promise.resolve(),busy=0;
function bot(text,opts){
 opts=opts||{};
 queue=queue.then(function(){return new Promise(function(res){
  busy++;var ty=document.createElement("div");ty.className="msg in typing";ty.innerHTML='<div class="bub"><i></i><i></i><i></i></div>';chat.appendChild(ty);scroll();
  var delay=Math.min(1400,450+text.length*6);if(window.__FAST)delay=30;
  setTimeout(function(){ty.remove();var extra="";
   if(opts.card)extra+='<div class="card">'+opts.card.map(function(r){return"<div><span>"+esc(r[0])+"</span><b>"+esc(r[1])+"</b></div>"}).join("")+"</div>";
   if(opts.tag)extra+='<div><span class="tag">'+esc(opts.tag)+"</span></div>";
   var el=addMsg("in",(opts.who?'<b style="color:#b0174e">'+esc(opts.who)+"</b>\n":"")+fmt(text),extra);
   el.setAttribute("data-intent",opts.intent||"");
   busy--;if(opts.chips)setChips(opts.chips);res();},delay);
 });});
 return queue;
}
function feedAdd(title,sub,lines,cls){
 var e=feed.querySelector(".feed-empty");if(e)e.remove();
 var d=document.createElement("div");d.className="fitem "+(cls||"");
 d.innerHTML='<div class="ft">'+esc(title)+"<small>"+hhmm()+"</small></div><p>"+lines.map(esc).join("<br>")+'</p><p style="margin-top:6px;font-size:.78rem">'+esc(sub)+"</p>";
 feed.insertBefore(d,feed.firstChild);
}

/* ---------- Conversación ---------- */
var MAIN=["Clases y horarios","Precios y promociones","Clase muestra","Sucursales","Eventos y sociales","Inscribirme","Tienda de zapatillas","Hablar con una persona"];
var BR_CHIPS=BR_IDS.map(function(id){return BR[id].n.replace(/ \(.*\)/,"")});
var S;
function reset(){
 S={mode:null,step:null,d:{},fails:0,last:null,branchCtx:null,human:false,ev:null};
 chat.innerHTML='<div class="day"><span>HOY</span></div>';statusEl.textContent="en línea";setChips([]);
 bot("Hola, gracias por escribir a **EnsalsateQ Dance Center**. Soy el asistente virtual y te ayudo al momento con clases, horarios, sucursales, eventos e inscripciones.\n\n¿Qué te gustaría saber?",{chips:MAIN,intent:"bienvenida"});
}
function branchList(){return BR_IDS.map(function(id,i){return (i+1)+". "+BR[id].n}).join("\n");}
function daysTxt(id){var ds=BR[id].days;if(ds.length===6)return"lunes a sábado";return ds.map(function(d){return DAYS[d]}).join(" y ");}
function timeFor(style,day){var t=SAMPLE_T[style]||SAMPLE_T.any;return day===6?t[1]:t[0];}

function answer(intent,ents,raw){
 S.last=intent;
 switch(intent){
 case "saludo":
  return bot("Hola, qué gusto saludarte. ¿Te interesa empezar a bailar, conocer horarios o alguno de nuestros eventos?",{chips:MAIN,intent:intent});
 case "horarios":
  if(ents.branch){S.branchCtx=ents.branch;return horariosBranch(ents.branch,ents.style);}
  return bot("Damos **clases grupales** de salsa, bachata y cumbia de lunes a sábado, todo el año, y te puedes unir en cualquier momento. Cada sucursal tiene sus horarios.\n\n¿De qué sucursal te gustaría ver los horarios?",{chips:BR_CHIPS,intent:intent}).then(function(){S.mode="ask_branch_h";});
 case "precios":
  return bot("Con gusto. Estas son las opciones:\n\n• **Clases grupales** (mensualidad) entre semana\n• **Paquete ProDancer**: clases ilimitadas en la academia\n• **Cursos intensivos de 10 horas** desde cero\n• **Clases particulares**, coreografías y clases para empresas\n\nPromoción de la página web: **Paquete ProDancer + Curso desde cero + inscripción gratis**.\n\nPuedes pagar por transferencia, OXXO, PayPal, Mercado Pago o en efectivo en cualquier sucursal. ¿Te comparto el costo de alguna opción en tu sucursal o prefieres apartar primero una clase muestra?",{tag:"En la implementación aquí van sus precios vigentes por sucursal",chips:["Clase muestra","Cursos intensivos","Hablar con una persona","Sucursales"],intent:intent});
 case "muestra":
  return bot("Claro. Puedes venir a una **clase muestra** para conocer la academia y a los maestros, sin compromiso. No necesitas pareja ni experiencia.\n\nTe la aparto en un minuto: solo necesito tu nombre, la sucursal, el ritmo y el día.",{intent:intent}).then(function(){startBooking(ents,raw);});
 case "inscribir":
  return bot("Perfecto, vamos a apartar tu lugar. Empezamos con una clase muestra y en recepción te ayudan a elegir el paquete que más te convenga.",{intent:intent}).then(function(){startBooking(ents,raw);});
 case "sucursales":
  if(ents.branch)return branchInfo(ents.branch);
  return bot("Tenemos **7 sucursales** en Querétaro:\n\n"+branchList()+"\n\n¿Cuál te queda más cerca? Te paso ubicación y horarios.",{chips:BR_CHIPS,intent:intent}).then(function(){S.mode="ask_branch_i";});
 case "eventos":
  var up=EVENTS.filter(function(e){return e.date>=new Date()}),past=EVENTS.filter(function(e){return e.date<new Date()});
  var t="Además de las clases organizamos **sociales, talleres y viajes**. Un social es de las mejores formas de practicar.\n\n";
  if(up.length)t+="Próximos:\n"+up.map(function(e){return"• "+e.txt}).join("\n")+"\n\n";
  if(past.length)t+="Recientes:\n"+past.map(function(e){return"• "+e.txt}).join("\n")+"\n\n";
  t+=up.length?"¿Te aparto lugar?":"Si quieres, te aviso del próximo.";
  return bot(t,{chips:up.length?["Apartar lugar en el social","Clases y horarios","Hablar con una persona"]:["Avísame del próximo","Clases y horarios"],intent:intent});
 case "zapatos":
  return bot("Tenemos tienda de zapatillas de baile: **@danceshoes_ensalsateq**. El pedido funciona así:\n\n1. Nos mandas tu talla según las instrucciones del catálogo.\n2. Pagas 50% al pedir y 50% al entregar.\n3. Si el modelo no está en almacén, la entrega tarda aproximadamente mes y medio.\n\n¿Te paso con alguien para ver modelos y tallas?",{chips:["Sí, ver modelos","Clases y horarios","Menú"],intent:intent}).then(function(){S.mode="shoes";});
 case "online":
  return bot("Tenemos **cursos online** con la metodología de EnsalsateQ, para ampliar tu repertorio de vueltas y figuras o aprender a dar clases. También hay un curso gratis: **3 vueltas épicas de cumbia para las fiestas**.\n\nAquí lo encuentras: [ensalsateq.com/curso-online](https://www.ensalsateq.com/curso-online/)",{chips:["Clases presenciales","Precios y promociones","Menú"],intent:intent});
 case "intensivo":
  return bot("Los **cursos intensivos de 10 horas** son ideales si empiezas desde cero. Cada mes es un ritmo distinto (cumbia, salsa y bachata), aprendes las bases y de 15 a 20 vueltas en pareja. No necesitas pareja.\n\nPara apartar tu lugar solo necesito tu nombre y la sucursal. Si faltas a una sesión, la repones en otro grupo.",{chips:["Inscribirme","Precios y promociones","Sucursales"],intent:intent});
 case "coreo":
  return bot("Hacemos **coreografías para XV años y bodas**, desde algo romántico y sencillo hasta un show completo, a la medida de tu evento.\n\nPara cotizar necesitamos la fecha, cuántas personas bailan y el estilo que buscas. ¿Te paso con un asesor?",{chips:["Sí, con un asesor","Menú"],intent:intent}).then(function(){S.mode="to_human";});
 case "particular":
  return bot("Las **clases particulares** son 1 a 1 con un maestro o maestra, con metodología personalizada. Puedes elegir ritmo, sucursal y horario.\n\n¿Te paso con recepción para ver disponibilidad?",{chips:["Sí, con un asesor","Clase muestra","Menú"],intent:intent}).then(function(){S.mode="to_human";});
 case "empresa":
  return bot("Damos **clases para empresas**: vamos hasta sus instalaciones con una clase dinámica para integrar al equipo. ¿Te paso con un asesor para cotizar fecha y número de personas?",{chips:["Sí, con un asesor","Menú"],intent:intent}).then(function(){S.mode="to_human";});
 case "pareja":
  return bot("No necesitas pareja. En las clases se rota para que todos bailen y aprendas a bailar con cualquier persona. ¿Te aparto una clase muestra?",{chips:["Clase muestra","Clases y horarios"],intent:intent});
 case "gracias":
  return bot("Con todo gusto. Aquí estoy si necesitas algo más.",{chips:MAIN,intent:intent});
 case "adios":
  return bot("Gracias por escribir a EnsalsateQ. Te esperamos en la pista.",{chips:MAIN,intent:intent});
 case "humano":
  return handoff("Solicitud del cliente");
 }
 return null;
}
function horariosBranch(id,style){
 var b=BR[id],t="Horarios en **"+b.n+"** ("+daysTxt(id)+"):\n\n";
 var ks=style?[style]:["salsa","bachata","cumbia"];
 t+=ks.map(function(k){return"• "+STY[k].n+": "+(b.days.indexOf(1)>-1?"lun a vie "+SAMPLE_T[k][0]+" · sáb "+SAMPLE_T[k][1]:"martes y jueves "+SAMPLE_T[k][0])}).join("\n");
 t+="\n\n¿Te aparto una clase muestra en esta sucursal?";
 S.mode=null;
 return bot(t,{tag:"Horarios de ejemplo; se cargan los reales de cada sucursal",chips:["Sí, apartar clase muestra","Ver ubicación","Otra sucursal"],intent:"horarios"}).then(function(){S.mode="offer_book";S.branchCtx=id;S.styleCtx=style||null;});
}
function branchInfo(id){
 var b=BR[id];S.branchCtx=id;S.mode=null;
 var t="**Sucursal "+b.n+"**\n"+(b.dir?b.dir+"\n":"")+"[Abrir en Google Maps]("+b.map+")\n\nClases: "+daysTxt(id)+".";
 return bot(t,{tag:b.dir?null:"Dirección escrita pendiente; el mapa es el oficial de su sitio",chips:["Horarios aquí","Apartar clase muestra aquí","Otra sucursal"],intent:"sucursales"}).then(function(){S.mode="offer_book";});
}

/* ----- Registro de clase muestra ----- */
function startBooking(ents,raw){
 S.mode="booking";S.d=S.d.done?{}:S.d;
 if(ents.branch)S.d.branch=ents.branch;else if(S.branchCtx&&!S.d.branch)S.d.branch=S.branchCtx;
 if(ents.style)S.d.style=ents.style;else if(S.styleCtx&&!S.d.style)S.d.style=S.styleCtx;
 if(ents.day!=null)S.d.day=ents.day;
 if(ents.name)S.d.name=ents.name;
 return nextStep();
}
function nextStep(){
 var d=S.d;
 if(!d.name){S.step="name";return bot("¿Me compartes tu nombre?",{chips:["Cancelar"]});}
 if(!d.branch){S.step="branch";return bot("Gracias, "+first(d.name)+". ¿En qué sucursal te gustaría tomarla?",{chips:BR_CHIPS});}
 if(!d.style){S.step="style";return bot("¿Qué ritmo te gustaría probar?",{chips:["Salsa","Bachata","Cumbia","No sé, recomiéndame"]});}
 if(d.day==null||BR[d.branch].days.indexOf(d.day)<0){
  S.step="day";var ds=BR[d.branch].days;
  var pre=(d.day!=null)?"En "+BR[d.branch].n+" no hay clase ese día ("+DAYS[d.day]+"). ":"";
  d.day=null;
  return bot(pre+"¿Qué día te queda mejor? En "+BR[d.branch].n+" hay clases "+daysTxt(d.branch)+".",{chips:ds.map(function(x){return cap(DAYS[x])})});
 }
 S.step="confirm";
 return bot("Listo, revisa que todo esté bien:",{card:summary(),tag:"Hora de ejemplo",chips:["Sí, confirmar","Cambiar algo","Cancelar"]});
}
function first(n){return n.split(" ")[0];}
function nextDate(day){var d=new Date(),diff=(day-d.getDay()+7)%7;if(diff===0&&d.getHours()>=19)diff=7;d.setDate(d.getDate()+diff);return d;}
function fdate(day){var d=nextDate(day);return cap(DAYS[day])+" "+d.getDate()+" de "+d.toLocaleDateString("es-MX",{month:"long"});}
function summary(){var d=S.d;return [["Nombre",d.name],["Sucursal",BR[d.branch].n],["Ritmo",d.style==="any"?"Por definir (recomienda el maestro)":STY[d.style].n],["Día",fdate(d.day)],["Hora",timeFor(d.style,d.day)]];}
function bookingInput(raw,det){
 var text=det.text,toks=det.toks,d=S.d;
 if(det.scores.cancelar>0&&det.scores.cancelar>=det.score){S.mode=null;S.step=null;S.d={};return bot("Sin problema, cancelé el registro. ¿Te ayudo con algo más?",{chips:MAIN});}
 if(det.scores.humano>=3)return handoff("Pidió asesor durante el registro");
 var b=findBranch(text,toks),s=findStyle(text,toks),dy=findDay(text,toks),nm=findName(raw);
 if(S.step==="confirm"){
  if(/cambiar|corregir|^no\b/.test(text)){S.step="change";return bot("¿Qué te gustaría cambiar?",{chips:["Nombre","Sucursal","Ritmo","Día"]});}
  if(det.scores.si>0||/confirm/.test(text))return finishBooking();
 }
 if(S.step==="change"){
  if(/nombre/.test(text)){d.name=null;}else if(/sucursal/.test(text)&&!b){d.branch=null;}else if(/ritmo|estilo|genero/.test(text)&&!s){d.style=null;}else if(/dia|fecha/.test(text)&&dy==null){d.day=null;}
 }
 if(b)d.branch=b;if(s)d.style=s;if(dy!=null)d.day=dy;if(nm)d.name=nm;
 if(S.step==="style"&&!s&&/(no se|recomien|cualquier|la que sea|da igual|todas)/.test(text))d.style="any";
 if(S.step==="name"&&!d.name){
  var clean=raw.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñü\s]/g,"").trim();
  if(clean&&clean.split(/\s+/).length<=4&&det.score<3&&!b&&!s&&dy==null)d.name=cap(clean);
  else if(!b&&!s&&dy==null)return bot("Para apartarte el lugar necesito tu nombre, por ejemplo: \"Ana López\".",{chips:["Cancelar"]});
 }
 if(S.step==="branch"&&!d.branch)return bot("No ubiqué esa sucursal. Estas son las 7:\n"+branchList(),{chips:BR_CHIPS});
 if(S.step==="day"&&d.day==null&&dy==null)return bot("¿Qué día? Por ejemplo \"jueves\" o \"mañana\".",{chips:BR[d.branch].days.map(function(x){return cap(DAYS[x])})});
 if(S.step==="style"&&!d.style)return bot("Tenemos salsa, bachata y cumbia. ¿Cuál prefieres?",{chips:["Salsa","Bachata","Cumbia","No sé, recomiéndame"]});
 return nextStep();
}
function finishBooking(){
 var d=S.d,folio="ENQ-"+(1000+Math.floor(Math.random()*9000)),sm=summary();
 S.mode=null;S.step=null;d.done=true;
 feedAdd("Nueva clase muestra · "+BR[d.branch].n,"Aviso enviado a Recepción "+BR[d.branch].n+" · recordatorio programado",[sm[0][1]+" · "+sm[2][1],sm[3][1]+", "+sm[4][1],"Folio "+folio]);
 return bot("Quedó registrada tu clase muestra, "+first(d.name)+". Tu folio es **"+folio+"**.\n\nUn día antes te mando un recordatorio con la ubicación. Te recomendamos llegar 10 minutos antes, con ropa cómoda y agua.\n\n[Ubicación de "+BR[d.branch].n+"]("+BR[d.branch].map+")",{chips:["Eventos y sociales","Tienda de zapatillas","Hablar con una persona","Menú"],intent:"confirmado"});
}

/* ----- Paso a persona ----- */
function handoff(reason){
 var br=S.d&&S.d.branch?S.d.branch:S.branchCtx,where=br?"Recepción "+BR[br].n:"Recepción general";
 S.mode=null;S.step=null;
 return bot("Claro, te paso con una persona de nuestro equipo. Ya le comparto lo que platicamos para que no tengas que repetir nada.",{intent:"handoff"}).then(function(){
  addSys("Pasando con un asesor · "+where);
  statusEl.textContent="Asesor · en línea";S.human=true;
  var ctx=[reason];if(S.d&&S.d.name)ctx.push("Cliente: "+S.d.name);if(S.last&&S.last!=="humano")ctx.push("Último tema: "+S.last);
  feedAdd("Solicitud de asesor · "+where,"Conversación transferida con historial completo",ctx,"h");
  return bot("Hola, te atiende recepción de EnsalsateQ. Ya vi tu conversación, en un momento te ayudo.",{who:"Asesor EnsalsateQ (simulado)",chips:["Volver al asistente"]});
 });
}

/* ----- Router ----- */
function handle(raw){
 var det=detect(raw),text=det.text,toks=det.toks;
 var ents={branch:findBranch(text,toks),style:findStyle(text,toks),day:findDay(text,toks),name:findName(raw)};
 if(S.human){
  if(/volver|asistente|menu|bot/.test(text)){S.human=false;statusEl.textContent="en línea";addSys("De vuelta con el asistente virtual");return bot("Aquí estoy de nuevo. ¿En qué te ayudo?",{chips:MAIN});}
  return bot("Gracias, lo reviso y te respondo por aquí.",{who:"Asesor EnsalsateQ (simulado)",tag:"En la implementación aquí contesta su equipo desde el mismo WhatsApp",chips:["Volver al asistente"]});
 }
 if(S.mode==="booking")return bookingInput(raw,det);
 if(S.mode==="event"){
  if(det.scores.cancelar>0){S.mode=null;return bot("Va, cancelado. ¿Algo más?",{chips:MAIN});}
  var n=findName(raw)||cap(raw.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñü\s]/g,"").trim());
  var pm=text.match(/\b(\d{1,2})\b/),num=pm?pm[1]:"1";
  if(!n){return bot("¿A nombre de quién aparto?");}
  S.mode=null;var ev=S.ev;
  feedAdd("Reservación · "+ev.n,"Aviso enviado al encargado del evento",[n+" · "+num+" persona(s)"]);
  return bot("Listo, "+first(n)+". Quedó tu lugar apartado para **"+ev.n+"**. El día del evento te mando la ubicación y un recordatorio.",{chips:MAIN});
 }
 var intent=det.id;
 /* respuestas cortas a ofertas previas */
 if(S.mode==="ask_branch_h"&&ents.branch){S.mode=null;return horariosBranch(ents.branch,ents.style);}
 if(S.mode==="ask_branch_i"&&ents.branch){S.mode=null;return branchInfo(ents.branch);}
 if(/otra sucursal/.test(text)){S.mode="ask_branch_i";return bot("¿Cuál sucursal?\n"+branchList(),{chips:BR_CHIPS});}
 if(/ver ubicacion/.test(text)&&S.branchCtx)return branchInfo(S.branchCtx);
 if(/horarios aqui/.test(text)&&S.branchCtx)return horariosBranch(S.branchCtx);
 if(/apartar lugar en el social/.test(text)||(S.last==="eventos"&&det.scores.si>0)){
  var up=EVENTS.filter(function(e){return e.date>=new Date()});S.ev=up[up.length-1]||EVENTS[EVENTS.length-1];S.mode="event";
  return bot("Con gusto te aparto lugar para **"+S.ev.n+"**. ¿A nombre de quién y para cuántas personas? Por ejemplo: \"Laura, 2\".");
 }
 if(/avisame del proximo/.test(text)){feedAdd("Interesado en próximos sociales","Se agregó a la lista de difusión de eventos",["Contacto de WhatsApp de la demo"]);return bot("Listo, te aviso en cuanto publiquemos el próximo social.",{chips:MAIN});}
 if((S.mode==="offer_book"&&(det.scores.si>0||/apartar/.test(text)))){S.mode=null;return answer("muestra",ents,raw);}
 if((S.mode==="shoes"||S.mode==="to_human")&&(det.scores.si>0||/asesor|modelos/.test(text))){S.mode=null;return handoff(S.last==="zapatos"?"Quiere ver modelos de zapatillas":"Cotización: "+S.last);}
 if(/clases presenciales/.test(text))intent="horarios";
 if(/cursos intensivos/.test(text))intent="intensivo";
 if(intent==="cancelar"){S.mode=null;return bot("Claro. ¿En qué más te ayudo?",{chips:MAIN});}
 if(intent==="si"||intent==="no")intent=null;
 /* booking con datos en la frase: "quiero bachata en juriquilla el jueves" */
 if(!intent&&(ents.style||ents.branch||ents.day!=null)){
  if(ents.branch&&!ents.style&&ents.day==null)intent="sucursales";
  else if(ents.style&&!ents.branch&&ents.day==null){S.styleCtx=ents.style;return bot("Damos **"+STY[ents.style].n+"** en las 7 sucursales, desde nivel principiante. ¿Te aparto una clase muestra?",{chips:["Sí, apartar clase muestra","Clases y horarios","Sucursales"]}).then(function(){S.mode="offer_book";});}
  else intent="muestra";
 }
 if(intent==="horarios"&&(det.scores.inscribir>0||det.scores.muestra>0))intent=det.scores.muestra>0?"muestra":"inscribir";
 if(intent){S.fails=0;var r=answer(intent,ents,raw);if(r)return r;}
 S.fails++;
 if(S.fails>=2){S.fails=0;return bot("Disculpa, no logré entenderte. Para no hacerte esperar, ¿te paso con una persona de recepción?",{chips:["Hablar con una persona","Menú"]});}
 return bot("Perdón, no estoy seguro de haber entendido. Puedo ayudarte con estos temas:",{chips:MAIN});
}
function send(text){
 text=(text||"").trim();if(!text)return;
 addMsg("out",fmt(text));setChips([]);input.value="";
 uq=uq.then(function(){return handle(text)}).catch(function(e){console.error(e)});
}
form.addEventListener("submit",function(e){e.preventDefault();send(input.value);});
$("resetBtn").addEventListener("click",function(){queue=Promise.resolve();uq=Promise.resolve();reset();});
window.__demo={send:send,state:function(){return S},detect:detect,idle:function(){return uq.then(function(){return queue}).then(function(){return true})}};
reset();
})();
