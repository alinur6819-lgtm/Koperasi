let lastFiltered = [];
/* =====================
   LOAD ANGGOTA
===================== */
function loadAnggota(){
  const db = getDB();
  const sel = document.getElementById("anggota");
  sel.innerHTML = "<option value=''>-- Pilih Anggota --</option>";

  db.anggota.forEach(a => {
    sel.innerHTML += `<option value="${a.id}">${a.nama}</option>`;
  });
}

/* =====================
   LOAD SIMPANAN
===================== */
function loadSimpanan(){

  const db = getDB();
  const tbody = document.getElementById("listSimpanan");

  const fAnggota = document.getElementById("filterAnggota")?.value || "";
  const fJenis = document.getElementById("filterJenis")?.value || "";

  tbody.innerHTML = "";

  lastFiltered = db.simpanan.filter(s=>{
    return (!fAnggota || s.anggota_id===fAnggota) &&
           (!fJenis || s.jenis===fJenis);
  });

  lastFiltered.forEach((s,i)=>{
    const anggota = db.anggota.find(a=>a.id===s.anggota_id);

    tbody.innerHTML += `
      <tr>
        <td>${s.tanggal}</td>
        <td>${anggota ? anggota.nama : "-"}</td>
        <td>${s.jenis}</td>
        <td>Rp ${Number(s.jumlah).toLocaleString("id-ID")}</td>
        <td>
          <button onclick="hapusSimpanan(${i})">🗑️</button>
        </td>
      </tr>
    `;
  });

}

function exportSimpananPDF(){

if(lastFiltered.length===0){
 alert("Data kosong");
 return;
}

const db=getDB();
let total=0;

const temp=document.createElement("div");
temp.style.background="white";
temp.style.padding="10px";
document.body.appendChild(temp);

let html=`
<h3 style="text-align:center">LAPORAN SIMPANAN</h3>
<p style="text-align:center;font-size:11px">
Dicetak : ${new Date().toLocaleString("id-ID")}
</p>

<table style="width:100%;border-collapse:collapse;font-size:11px">
<tr>
<th style="border:1px solid #000">Tanggal</th>
<th style="border:1px solid #000">Anggota</th>
<th style="border:1px solid #000">Jenis</th>
<th style="border:1px solid #000">Jumlah</th>
</tr>
`;

lastFiltered.forEach(s=>{
 const a=db.anggota.find(x=>x.id===s.anggota_id);
 total+=Number(s.jumlah);

 html+=`
<tr>
<td style="border:1px solid #000">${s.tanggal}</td>
<td style="border:1px solid #000">${a?a.nama:""}</td>
<td style="border:1px solid #000">${s.jenis}</td>
<td style="border:1px solid #000;text-align:right">
Rp ${Number(s.jumlah).toLocaleString("id-ID")}
</td>
</tr>
`;
});

html+=`
<tr>
<td colspan="3" style="border:1px solid #000;font-weight:bold">TOTAL</td>
<td style="border:1px solid #000;text-align:right;font-weight:bold">
Rp ${total.toLocaleString("id-ID")}
</td>
</tr>
</table>
`;

temp.innerHTML=html;

setTimeout(()=>{
 html2pdf()
 .from(temp)
 .set({
  margin:10,
  filename:"laporan_simpanan.pdf",
  html2canvas:{scale:2},
  jsPDF:{unit:"mm",format:"a4"}
 })
 .save()
 .then(()=>temp.remove());
},300);

}
/* =====================
   SIMPAN
===================== */
function simpanSimpanan(e){
  e.preventDefault();

  const db = getDB();
  const anggota_id = document.getElementById("anggota").value;
  const jenis = document.getElementById("jenis").value;
  const jumlah = Number(document.getElementById("jumlah").value);
  const tanggal = document.getElementById("tanggal").value;

  if(!anggota_id){
    alert("Pilih anggota");
    return;
  }

  const id = "SP" + String(db.simpanan.length + 1).padStart(3,"0");

  db.simpanan.push({
    id,
    anggota_id,
    jenis,
    jumlah,
    tanggal
  });

  saveDB(db);
  e.target.reset();
  loadSimpanan();
}

/* =====================
   HAPUS
===================== */
function hapusSimpanan(index){
  if(confirm("Hapus data simpanan ini?")){
    const db = getDB();
    db.simpanan.splice(index,1);
    saveDB(db);
    loadSimpanan();
  }
}