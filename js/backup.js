/* =====================
   BACKUP VIA WHATSAPP
===================== */
function backupWA(){
 const db=localStorage.getItem("koperasi_db");

 if(!db){
  alert("Tidak ada data!");
  return;
 }

 // kompres base64 supaya pendek
 const encoded=btoa(unescape(encodeURIComponent(db)));

 window.open("https://wa.me/?text="+encodeURIComponent("BACKUP_KOPERASI\n"+encoded));
}

/* =====================
   RESTORE VIA WHATSAPP
===================== */
function restoreWA(){
 const text=prompt("Paste backup WhatsApp di sini:");

 if(!text)return;

 try{
  const raw=text.replace("BACKUP_KOPERASI","").trim();
  const json=decodeURIComponent(escape(atob(raw)));

  JSON.parse(json); // validasi

  localStorage.setItem("koperasi_db",json);

  alert("Restore berhasil ✔️");
  location.reload();

 }catch(e){
  alert("Backup tidak valid / terpotong!");
 }
}