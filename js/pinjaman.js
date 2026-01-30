cekLogin();

/* TAB */
function openTab(tab,el){
document.querySelectorAll(".tabcontent").forEach(t=>t.style.display="none");
document.querySelectorAll(".tablink").forEach(b=>b.classList.remove("active"));
document.getElementById(tab).style.display="block";
el.classList.add("active");
}

function rupiah(n){return "Rp "+Number(n||0).toLocaleString("id-ID")}

function logout(){
localStorage.removeItem("login");
location.href="login.html";
}

/* LOAD ANGGOTA */
function loadAnggotaDropdowns(){
const db=getDB();
["anggotaPinjam","anggotaBayar","filterAnggotaPinjam","filterAnggotaBayar"].forEach(id=>{
const s=document.getElementById(id);
s.innerHTML=`<option value="">-- Semua --</option>`;
db.anggota.forEach(a=>{
s.innerHTML+=`<option value="${a.nama}">${a.nama}</option>`;
});
});
}

/* HITUNG ANGSURAN */
["jumlahPinjam","bungaPinjam","tenorPinjam"].forEach(id=>{
document.getElementById(id).addEventListener("input",()=>{
const j=+jumlahPinjam.value||0;
const b=+bungaPinjam.value||0;
const t=+tenorPinjam.value||0;
if(j&&b&&t){
angsuranPinjam.value=rupiah(Math.ceil((j+(j*b*t/100))/t));
}
});
});

/* SIMPAN PINJAMAN */
formPinjaman.onsubmit=e=>{
e.preventDefault();
const db=getDB(); if(!db.pinjaman)db.pinjaman=[];
db.pinjaman.push({
id:Date.now(),
nama:anggotaPinjam.value,
jumlah:+jumlahPinjam.value,
bunga:+bungaPinjam.value,
tenor:+tenorPinjam.value,
totalPinjaman:+jumlahPinjam.value,
sisa:+jumlahPinjam.value,
tanggal:new Date().toISOString().slice(0,10)
});
saveDB(db);
formPinjaman.reset();
loadPinjaman();
};

/* SIMPAN BAYAR */
formBayar.onsubmit=e=>{
e.preventDefault();
const db=getDB(); if(!db.transaksi)db.transaksi=[];
const pin=db.pinjaman.find(p=>p.id==pinjamanBayar.value);
pin.sisa-=+jumlahBayar.value;
db.transaksi.push({id:Date.now(),nama:anggotaBayar.value,pinjamanId:pin.id,jumlah:+jumlahBayar.value,jenis:"BAYAR",tanggal:new Date().toISOString().slice(0,10)});
saveDB(db);
loadPinjaman();
loadBayar();
};

/* LOAD PINJAMAN */
function loadPinjaman(){
const db=getDB();
listPinjaman.innerHTML="";
db.pinjaman.forEach(p=>{
listPinjaman.innerHTML+=`
<tr>
<td>${p.nama}</td>
<td>${rupiah(p.jumlah)}</td>
<td>${p.bunga}%</td>
<td>${p.tenor}</td>
<td>${rupiah(p.jumlah-p.sisa)}</td>
<td>${rupiah(p.sisa)}</td>
<td>${p.sisa<=0?"LUNAS":"BELUM"}</td>
</tr>`;
});
}

/* LOAD BAYAR */
function loadBayar(){
const db=getDB();
listBayar.innerHTML="";
db.transaksi?.forEach(t=>{
listBayar.innerHTML+=`
<tr>
<td>${t.nama}</td>
<td>${rupiah(t.jumlah)}</td>
<td>${rupiah(t.jumlah)}</td>
<td>${t.tanggal}</td>
</tr>`;
});
}

/* PDF */

function exportPinjamanPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p","mm","a4");

  doc.setFontSize(16);
  doc.text("DAFTAR PINJAMAN",14,15);

  let body = [];

  document.querySelectorAll("#listPinjaman tr").forEach(tr=>{
    const td = tr.querySelectorAll("td");
    body.push([
      td[0]?.innerText || "",
      td[1]?.innerText || "",
      td[2]?.innerText || "",
      td[3]?.innerText || "",
      td[4]?.innerText || "",
      td[5]?.innerText || "",
      td[6]?.innerText || ""
    ]);
  });

  doc.autoTable({
    startY: 25,
    head: [[
      "Anggota",
      "Pinjaman",
      "Bunga",
      "Tenor",
      "Total Bayar",
      "Sisa",
      "Status"
    ]],
    body: body,
    styles:{
      fontSize:9,
      cellPadding:2
    },
    headStyles:{
      fillColor:[220,220,220],
      textColor:0
    }
  });

  doc.save("pinjaman.pdf");
}

function exportBayarPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p","mm","a4");

  doc.setFontSize(16);
  doc.text("DAFTAR BAYAR ANGSURAN",14,15);

  let body = [];

  document.querySelectorAll("#listBayar tr").forEach(tr=>{
    const td = tr.querySelectorAll("td");
    body.push([
      td[0]?.innerText || "",
      td[1]?.innerText || "",
      td[2]?.innerText || "",
      td[3]?.innerText || ""
    ]);
  });

  doc.autoTable({
    startY: 25,
    head: [[
      "Anggota",
      "Pinjaman",
      "Jumlah Bayar",
      "Tanggal"
    ]],
    body: body,
    styles:{
      fontSize:10,
      cellPadding:3
    },
    headStyles:{
      fillColor:[220,220,220],
      textColor:0
    }
  });

  doc.save("bayar.pdf");
}




loadAnggotaDropdowns();
loadPinjaman();
loadBayar();