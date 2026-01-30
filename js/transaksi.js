let editIndex = null;

/* =====================
   LOAD ANGGOTA
===================== */
function loadAnggota(){
  const db = getDB();
  const sel = document.getElementById("anggota");
  sel.innerHTML = "<option value=''>-- Pilih Anggota --</option>";

  db.anggota.forEach(a=>{
    sel.innerHTML += `<option value="${a.id}">${a.nama}</option>`;
  });
}

/* =====================
   UBAH JENIS
===================== */
function ubahJenis(){
  const jenis = document.getElementById("jenis").value;
  document.getElementById("pinjaman").style.display =
    jenis === "BAYAR" ? "block" : "none";

  if(jenis === "BAYAR"){
    loadPinjamanAnggota();
  }
}

/* =====================
   LOAD PINJAMAN
===================== */
function loadPinjamanAnggota(){
  const db = getDB();
  const anggota = document.getElementById("anggota").value;
  const sel = document.getElementById("pinjaman");

  sel.innerHTML = "<option value=''>-- Pilih Pinjaman --</option>";

  db.pinjaman
    .filter(p=>p.anggota_id===anggota && p.status==="Aktif")
    .forEach(p=>{
      sel.innerHTML += `
        <option value="${p.id}">
          ${p.id} - Sisa Rp ${p.sisa.toLocaleString("id-ID")}
        </option>`;
    });
}

/* =====================
   SIMPAN / UPDATE
===================== */
function simpanTransaksi(e){
  e.preventDefault();
  const db = getDB();

  const jenis = jenisEl.value;
  const anggota = anggotaEl.value;
  const jumlah = Number(jumlahEl.value);
  const tanggal = tanggalEl.value;

  if(editIndex !== null){
    batalkanEfek(db.transaksi[editIndex], db);
    db.transaksi.splice(editIndex,1);
    editIndex = null;
  }

  // PROSES BARU
  if(jenis === "SETOR"){
    db.simpanan.push({
      id: "SP" + String(db.simpanan.length+1).padStart(3,"0"),
      anggota_id: anggota,
      jenis: "Sukarela",
      jumlah,
      tanggal
    });
  }

  if(jenis === "BAYAR"){
    const pid = pinjamanEl.value;
    const p = db.pinjaman.find(x=>x.id===pid);

    p.sisa -= jumlah;
    if(p.sisa <= 0){
      p.sisa = 0;
      p.status = "Lunas";
    }
  }

  db.transaksi.push({
    id: "TR" + String(db.transaksi.length+1).padStart(3,"0"),
    anggota_id: anggota,
    jenis,
    jumlah,
    tanggal,
    pinjaman_id: jenis==="BAYAR" ? pinjamanEl.value : null
  });

  saveDB(db);
  e.target.reset();
  loadTransaksi();
}

/* =====================
   BATALKAN EFEK
===================== */
function batalkanEfek(tr, db){
  if(tr.jenis === "SETOR"){
    db.simpanan.pop();
  }

  if(tr.jenis === "BAYAR"){
    const p = db.pinjaman.find(x=>x.id===tr.pinjaman_id);
    p.sisa += tr.jumlah;
    p.status = "Aktif";
  }
}

/* =====================
   EDIT
===================== */
function editTransaksi(i){
  const db = getDB();
  const t = db.transaksi[i];

  jenisEl.value = t.jenis;
  anggotaEl.value = t.anggota_id;
  jumlahEl.value = t.jumlah;
  tanggalEl.value = t.tanggal;

  if(t.jenis === "BAYAR"){
    ubahJenis();
    setTimeout(()=>{
      pinjamanEl.value = t.pinjaman_id;
    },100);
  }

  editIndex = i;
}

/* =====================
   BATAL
===================== */
function hapusTransaksi(i){
  if(confirm("Batalkan transaksi ini?")){
    const db = getDB();
    const t = db.transaksi[i];

    batalkanEfek(t, db);
    db.transaksi.splice(i,1);
    saveDB(db);
    loadTransaksi();
  }
}

/* =====================
   LOAD RIWAYAT
===================== */
function loadTransaksi(){
  const db = getDB();
  const tbody = document.getElementById("listTransaksi");
  tbody.innerHTML = "";

  db.transaksi.forEach((t,i)=>{
    const a = db.anggota.find(x=>x.id===t.anggota_id);

    tbody.innerHTML += `
      <tr>
        <td>${t.tanggal}</td>
        <td>${a ? a.nama : "-"}</td>
        <td>${t.jenis}</td>
        <td>Rp ${t.jumlah.toLocaleString("id-ID")}</td>
        <td>${t.jenis==="SETOR" ? "Setor simpanan" : "Bayar angsuran"}</td>
        <td>
          <button onclick="editTransaksi(${i})">✏️</button>
          <button onclick="hapusTransaksi(${i})">🗑️</button>
        </td>
      </tr>
    `;
  });
}

/* =====================
   SHORTCUT ELEMENT
===================== */
const jenisEl = document.getElementById("jenis");
const anggotaEl = document.getElementById("anggota");
const pinjamanEl = document.getElementById("pinjaman");
const jumlahEl = document.getElementById("jumlah");
const tanggalEl = document.getElementById("tanggal");