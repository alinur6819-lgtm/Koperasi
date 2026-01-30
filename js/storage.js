/* =====================
   STORAGE KOPERASI
===================== */
function getDB(){
  let db = localStorage.getItem("koperasi_db");

  if(!db){
    const initDB = {
      user: {
        username: "admin",
        password: "1234"
      },
      anggota: [],
      simpanan: [],
      pinjaman: [],
      transaksi: [],
      kas: []
    };

    localStorage.setItem("koperasi_db", JSON.stringify(initDB));
    return initDB;
  }

  return JSON.parse(db);
}

function saveDB(db){
  localStorage.setItem("koperasi_db", JSON.stringify(db));
}