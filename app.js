const cars=[
{name:"Toyota RAV4",body:"suv",budget:"mid",use:["city","family","travel"],priority:["economy","comfort"],drive:"awd",speed:"normal",price:"≈ 32 000 €",engine:"2.5 Hybrid",power:"218 л.с.",image:"https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80"},
{name:"BMW X3",body:"suv",budget:"mid",use:["city","family","travel"],priority:["comfort","power","tech"],drive:"awd",speed:"fast",price:"≈ 48 000 €",engine:"2.0 Turbo",power:"245 л.с.",image:"https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=1200&q=80"},
{name:"Volkswagen Golf",body:"hatch",budget:"low",use:["city"],priority:["economy","tech"],drive:"fwd",speed:"normal",price:"≈ 25 000 €",engine:"1.5 TSI",power:"150 л.с.",image:"https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=1200&q=80"},
{name:"Tesla Model 3",body:"sedan",budget:"mid",use:["city","travel"],priority:["tech","power","economy"],drive:"rwd",speed:"fast",price:"≈ 39 000 €",engine:"Electric",power:"283 л.с.",image:"https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80"},
{name:"BMW 3 Series",body:"sedan",budget:"mid",use:["city","travel","fun"],priority:["power","comfort","tech"],drive:"rwd",speed:"fast",price:"≈ 43 000 €",engine:"2.0 Turbo",power:"258 л.с.",image:"https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80"},
{name:"Mazda MX-5",body:"sport",budget:"mid",use:["city","fun"],priority:["power"],drive:"rwd",speed:"fast",price:"≈ 31 000 €",engine:"2.0 Skyactiv",power:"184 л.с.",image:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"},
{name:"Mercedes-Benz GLE",body:"suv",budget:"high",use:["family","travel"],priority:["comfort","tech"],drive:"awd",speed:"normal",price:"≈ 68 000 €",engine:"3.0 Turbo",power:"381 л.с.",image:"https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80"},
{name:"Porsche 911",body:"sport",budget:"premium",use:["fun","city"],priority:["power"],drive:"rwd",speed:"fast",price:"≈ 125 000 €",engine:"3.0 Twin-Turbo",power:"394 л.с.",image:"https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80"},
{name:"Hyundai Tucson",body:"suv",budget:"low",use:["city","family","travel"],priority:["economy","comfort"],drive:"fwd",speed:"calm",price:"≈ 29 000 €",engine:"1.6 Hybrid",power:"215 л.с.",image:"https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80"},
{name:"Audi A5",body:"sport",budget:"high",use:["city","fun","travel"],priority:["comfort","tech","power"],drive:"awd",speed:"fast",price:"≈ 57 000 €",engine:"2.0 TFSI",power:"265 л.с.",image:"https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80"},
{name:"Skoda Octavia",body:"sedan",budget:"low",use:["city","family","travel"],priority:["economy","comfort"],drive:"fwd",speed:"calm",price:"≈ 27 000 €",engine:"1.5 TSI",power:"150 л.с.",image:"https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80"},
{name:"Land Rover Defender",body:"suv",budget:"high",use:["travel","family"],priority:["comfort","power"],drive:"awd",speed:"normal",price:"≈ 72 000 €",engine:"3.0 Diesel",power:"300 л.с.",image:"https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80"}
];

let step=1,answers={};
const questions=document.querySelectorAll(".question"), bar=document.getElementById("progressBar"), count=document.getElementById("stepCount"), back=document.getElementById("backBtn"), finder=document.getElementById("finder"), results=document.getElementById("results");

document.querySelectorAll(".options button").forEach(btn=>btn.addEventListener("click",()=>{
 answers[btn.dataset.key]=btn.dataset.value;
 if(step<6){step++;renderStep()}else showResults();
}));
back.onclick=()=>{if(step>1){step--;renderStep()}};
document.getElementById("restartBtn").onclick=reset;
document.getElementById("editBtn").onclick=()=>{results.style.display="none";finder.style.display="block";step=1;renderStep();window.scrollTo({top:0,behavior:"smooth"})};

function renderStep(){
 questions.forEach(q=>q.classList.toggle("active",Number(q.dataset.step)===step));
 bar.style.width=(step/6*100)+"%";count.textContent=step+" / 6";back.disabled=step===1;
}
function score(c){
 let s=0;
 if(answers.budget==="high" && c.budget==="high")s+=25;
 if(answers.budget==="premium" && c.budget==="premium")s+=30;
 if(answers.budget==="mid" && c.budget==="mid")s+=30;
 if(answers.budget==="low" && c.budget==="low")s+=30;
 if(answers.use && c.use.includes(answers.use))s+=22;
 if(answers.body===c.body)s+=22;
 if(answers.priority && c.priority.includes(answers.priority))s+=15;
 if(answers.drive==="any"||answers.drive===c.drive)s+=10;
 if(answers.speed==="fast"&&c.speed==="fast")s+=12;
 if(answers.speed==="normal"&&c.speed!=="calm")s+=8;
 if(answers.speed==="calm"&&c.speed==="calm")s+=10;
 return Math.min(99,s);
}
function showResults(){
 const ranked=cars.map(c=>({...c,match:score(c)})).sort((a,b)=>b.match-a.match).slice(0,6);
 document.getElementById("resultSummary").textContent="Подбор сформирован по твоим ответам. Открой карточку, чтобы сравнить основные параметры.";
 document.getElementById("cards").innerHTML=ranked.map(c=>`<article class="card">
<img class="car-image" src="${c.image}" alt="${c.name}" loading="lazy">
<div class="card-body"><div class="match">${c.match}% СОВПАДЕНИЕ</div><h3>${c.name}</h3><div class="meta">${c.price} · ${c.body.toUpperCase()}</div>
<div class="specs"><div class="spec">Двигатель<b>${c.engine}</b></div><div class="spec">Мощность<b>${c.power}</b></div><div class="spec">Привод<b>${c.drive.toUpperCase()}</b></div><div class="spec">Назначение<b>${c.use[0]}</b></div></div>
<div class="reason">${reason(c)}</div></div></article>`).join("");
 finder.style.display="none";results.style.display="block";window.scrollTo({top:0,behavior:"smooth"});
}
function reason(c){
 const bits=[];
 if(c.body===answers.body)bits.push("подходит выбранный кузов");
 if(c.use.includes(answers.use))bits.push("соответствует сценарию использования");
 if(c.priority.includes(answers.priority))bits.push("есть нужный приоритет");
 if(answers.drive==="any"||c.drive===answers.drive)bits.push("совпадает предпочтение по приводу");
 return bits.length?"Почему в подборке: "+bits.join(", ")+".":"Модель получила высокий общий балл по выбранным параметрам.";
}
function reset(){answers={};step=1;results.style.display="none";finder.style.display="block";renderStep();window.scrollTo({top:0,behavior:"smooth"})}
renderStep();