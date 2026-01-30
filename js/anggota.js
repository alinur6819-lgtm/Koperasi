let editMode = false;

/* =====================
   LOAD DATA
===================== */
function loadAnggota(){
  const db = getDB();
  const tbody = document.getElementById("listAnggota");
  tbody.innerHTML = "";

  db.anggota.forEach((a, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${a.id}</td>
        <td>${a.nama}</td>
        <td>${a.alamat}</td>
        <td>${a.telp}</td>
        <td class="action">
          <button onclick="editAnggota(${i})">✏️</button>
          <button onclick="hapusAnggota(${i})">🗑️</button>
        </td>
      </tr>
    `;
  });
}

/* =====================
   SIMPAN / UPDATE
===================== */
function simpanAnggota(e){
  e.preventDefault();

  const db = getDB();
  const id = document.getElementById("idAnggota").value;
  const nama = document.getElementById("nama").value;
  const alamat = document.getElementById("alamat").value;
  const telp = document.getElementById("telp").value;

  if(editMode){
    const idx = db.anggota.findIndex(a => a.id === id);
    db.anggota[idx] = { id, nama, alamat, telp };
  }else{
    const newID = "AG" + String(db.anggota.length + 1).padStart(3,"0");
    db.anggota.push({
      id: newID,
      nama,
      alamat,
      telp
    });
  }

  saveDB(db);
  resetForm();
  loadAnggota();
}

/* =====================
   EDIT
===================== */
function editAnggota(index){
  const db = getDB();
  const a = db.anggota[index];

  document.getElementById("idAnggota").value = a.id;
  document.getElementById("nama").value = a.nama;
  document.getElementById("alamat").value = a.alamat;
  document.getElementById("telp").value = a.telp;

  editMode = true;
}

/* =====================
   HAPUS
===================== */
function hapusAnggota(index){
  if(confirm("Hapus anggota ini?")){
    const db = getDB();
    db.anggota.splice(index,1);
    saveDB(db);
    loadAnggota();
  }
}

/* =====================
   RESET FORM
===================== */
function resetForm(){
  document.getElementById("idAnggota").value = "";
  document.getElementById("nama").value = "";
  document.getElementById("alamat").value = "";
  document.getElementById("telp").value = "";
  editMode = false;
}