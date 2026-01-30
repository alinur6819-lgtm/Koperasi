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
  tbody.innerHTML = "";

  db.simpanan.forEach((s, i) => {
    const anggota = db.anggota.find(a => a.id === s.anggota_id);

    tbody.innerHTML += `
      <tr>
        <td>${s.tanggal}</td>
        <td>${anggota ? anggota.nama : "-"}</td>
        <td>${s.jenis}</td>
        <td>Rp ${s.jumlah.toLocaleString("id-ID")}</td>
        <td>
          <button onclick="hapusSimpanan(${i})">🗑️</button>
        </td>
      </tr>
    `;
  });
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