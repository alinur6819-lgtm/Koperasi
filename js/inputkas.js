/*
db = {
  anggota: [],
  simpanan: [],
  pinjaman: [],
  transaksi: [],
  kas: []
}
*/

let editIndex = null;

/* =====================
   UTIL
===================== */
function rupiah(n){
  return "Rp " + Number(n||0).toLocaleString("id-ID");
}

/* =====================
   LOAD KAS
===================== */
function loadKas(){
  const db = getDB();
  db.kas ??= [];

  const tbody = document.getElementById("listKas");

  let masuk = 0;
  let keluar = 0;
  tbody.innerHTML = "";

  db.kas.forEach((k,i)=>{
    if(k.jenis==="MASUK") masuk += k.jumlah;
    else keluar += k.jumlah;

    const anggota = db.anggota.find(a=>a.id===k.anggota_id);

    tbody.innerHTML += `
      <tr>
        <td>${k.tanggal}</td>
        <td>${anggota?.nama || "-"}</td>
        <td>${k.keterangan}</td>
        <td>${k.jenis==="MASUK"?rupiah(k.jumlah):"-"}</td>
        <td>${k.jenis==="KELUAR"?rupiah(k.jumlah):"-"}</td>
        <td>
          <button onclick="editKas(${i})">✏️</button>
          <button onclick="hapusKas(${i})">🗑️</button>
        </td>
      </tr>`;
  });

  document.getElementById("kasMasuk").innerText = rupiah(masuk);
  document.getElementById("kasKeluar").innerText = rupiah(keluar);
  document.getElementById("saldoKas").innerText = rupiah(masuk-keluar);
}

/* =====================
   SIMPAN KAS MANUAL
===================== */
function simpanKas(){
  const db = getDB();
  db.kas ??= [];

  const tgl = tglKas.value;
  const ket = ketKas.value;
  const jenis = jenisKas.value;
  const jumlah = Number(jumlahKas.value);

  if(!tgl || !ket || !jumlah){
    alert("Lengkapi data!");
    return;
  }

  const data = {
    id: Date.now(),
    tanggal: tgl,
    keterangan: ket,
    jenis,
    jumlah
  };

  if(editIndex===null){
    db.kas.push(data);
  }else{
    db.kas[editIndex] = data;
    editIndex = null;
  }

  saveDB(db);
  tglKas.value = ketKas.value = jumlahKas.value = "";
  loadKas();
}

/* =====================
   EDIT & HAPUS
===================== */
function editKas(i){
  const db = getDB();
  const k = db.kas[i];

  tglKas.value = k.tanggal;
  ketKas.value = k.keterangan;
  jenisKas.value = k.jenis;
  jumlahKas.value = k.jumlah;

  editIndex = i;
}

function hapusKas(i){
  if(!confirm("Hapus data kas ini?")) return;
  const db = getDB();
  db.kas.splice(i,1);
  saveDB(db);
  loadKas();
}

/* =====================
   SIMPAN PINJAMAN
===================== */
document.getElementById("formPinjaman")?.addEventListener("submit", e=>{
  e.preventDefault();

  const db = getDB();
  db.pinjaman ??= [];
  db.kas ??= [];

  const jumlah = Number(jumlahPinjam.value);
  const anggota_id = anggotaPinjam.value;
  const tanggal = new Date().toISOString().slice(0,10);

  const pinjaman = {
    id: Date.now(),
    anggota_id,
    pokok: jumlah,
    bunga: Number(bungaPinjam.value||0),
    tenor: Number(tenorPinjam.value),
    sisa: jumlah,
    tanggal
  };

  db.pinjaman.push(pinjaman);

  /* 🔥 KAS KELUAR */
  db.kas.push({
    id: Date.now(),
    tanggal,
    anggota_id,
    pinjaman_id: pinjaman.id,
    jenis: "KELUAR",
    jumlah,
    keterangan: "Pencairan Pinjaman"
  });

  saveDB(db);
  e.target.reset();
  loadPinjaman();
  loadKas();
});

/* =====================
   SIMPAN ANGSURAN
===================== */
function simpanAngsuran(pinjaman, jumlah){
  const db = getDB();
  db.transaksi ??= [];
  db.kas ??= [];

  const tanggal = new Date().toISOString().slice(0,10);

  db.transaksi.push({
    id: Date.now(),
    pinjaman_id: pinjaman.id,
    anggota_id: pinjaman.anggota_id,
    pokok: jumlah,
    bunga: 0,
    tanggal
  });

  /* 🔥 KAS MASUK */
  db.kas.push({
    id: Date.now(),
    tanggal,
    anggota_id: pinjaman.anggota_id,
    pinjaman_id: pinjaman.id,
    jenis: "MASUK",
    jumlah,
    keterangan: "Angsuran Pinjaman"
  });

  pinjaman.sisa -= jumlah;
  if(pinjaman.sisa<0) pinjaman.sisa=0;

  saveDB(db);
  loadKas();
}

/* =====================
   EXPORT PDF
===================== */
function exportPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const db = getDB();
  const kas = db.kas || [];

  let masuk=0, keluar=0;

  kas.forEach(k=>{
    if(k.jenis==="MASUK") masuk+=k.jumlah;
    else keluar+=k.jumlah;
  });

  doc.text("LAPORAN KAS",14,15);
  doc.text("Kas Masuk  : "+rupiah(masuk),14,25);
  doc.text("Kas Keluar : "+rupiah(keluar),14,32);
  doc.text("Saldo      : "+rupiah(masuk-keluar),14,39);

  doc.autoTable({
    startY:45,
    head:[["Tanggal","Anggota","Keterangan","Masuk","Keluar"]],
    body:kas.map(k=>{
      const a = db.anggota.find(x=>x.id===k.anggota_id);
      return [
        k.tanggal,
        a?.nama||"-",
        k.keterangan,
        k.jenis==="MASUK"?rupiah(k.jumlah):"-",
        k.jenis==="KELUAR"?rupiah(k.jumlah):"-"
      ];
    })
  });

  window.open(doc.output("bloburl"));
}