/* =====================
   FILTER ANGGOTA
===================== */
function loadFilter(){
  const db = getDB();
  const sel = document.getElementById("filterAnggota");
  sel.innerHTML = `<option value="">-- Semua Anggota --</option>`;

  db.anggota.forEach(a=>{
    sel.innerHTML += `<option value="${a.id}">${a.nama}</option>`;
  });
}

/* =====================
   LOAD LAPORAN
===================== */
function loadLaporan(){
  const db = getDB();
  const filter = document.getElementById("filterAnggota").value;

  /* ===== SIMPANAN ===== */
  let totalS = 0;
  const listS = document.getElementById("listSimpanan");
  listS.innerHTML = "";

  db.simpanan
    .filter(s => !filter || s.anggota_id === filter)
    .forEach(s=>{
      const a = db.anggota.find(x=>x.id===s.anggota_id);
      totalS += Number(s.jumlah);

      listS.innerHTML += `
        <tr>
          <td>${a ? a.nama : "-"}</td>
          <td>${s.jenis}</td>
          <td>Rp ${Number(s.jumlah).toLocaleString("id-ID")}</td>
        </tr>
      `;
    });

  document.getElementById("totalSimpanan").innerText =
    "Total Simpanan: Rp " + totalS.toLocaleString("id-ID");

  /* ===== PINJAMAN ===== */
  let totalP = 0;
  const listP = document.getElementById("listPinjaman");
  listP.innerHTML = "";

  db.pinjaman
    .filter(p => !filter || p.anggota_id === filter)
    .forEach(p=>{
      const a = db.anggota.find(x=>x.id===p.anggota_id);
      totalP += Number(p.sisa);

      listP.innerHTML += `
        <tr>
          <td>${a ? a.nama : "-"}</td>
          <td>Rp ${Number(p.jumlah).toLocaleString("id-ID")}</td>
          <td>Rp ${Number(p.sisa).toLocaleString("id-ID")}</td>
          <td>${p.status}</td>
        </tr>
      `;
    });

  document.getElementById("totalPinjaman").innerText =
    "Total Sisa Pinjaman: Rp " + totalP.toLocaleString("id-ID");
}

/* =====================
   SIMPANAN → EXCEL
===================== */
function exportSimpananExcel(){
  const db = getDB();
  const filter = document.getElementById("filterAnggota").value;

  const data = db.simpanan
    .filter(s => !filter || s.anggota_id === filter)
    .map(s=>{
      const a = db.anggota.find(x=>x.id===s.anggota_id);
      return {
        Tanggal: s.tanggal,
        Anggota: a ? a.nama : "-",
        Jenis: s.jenis,
        Jumlah: s.jumlah
      };
    });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Simpanan");
  XLSX.writeFile(wb, "laporan_simpanan.xlsx");
}

/* =====================
   PINJAMAN → EXCEL
===================== */
function exportPinjamanExcel(){
  const db = getDB();
  const filter = document.getElementById("filterAnggota").value;

  const data = db.pinjaman
    .filter(p => !filter || p.anggota_id === filter)
    .map(p=>{
      const a = db.anggota.find(x=>x.id===p.anggota_id);
      return {
        Anggota: a ? a.nama : "-",
        Tanggal: p.tanggal,
        Jumlah: p.jumlah,
        Sisa: p.sisa,
        Status: p.status
      };
    });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Pinjaman");
  XLSX.writeFile(wb, "laporan_pinjaman.xlsx");
}

/* =====================
   SIMPANAN → PDF
===================== */
function exportSimpananPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const db = getDB();
  const filter = document.getElementById("filterAnggota").value;

  let y = 10;
  doc.setFontSize(12);
  doc.text("Laporan Simpanan", 10, y);
  y += 10;

  db.simpanan
    .filter(s => !filter || s.anggota_id === filter)
    .forEach((s,i)=>{
      const a = db.anggota.find(x=>x.id===s.anggota_id);
      doc.setFontSize(10);
      doc.text(
        `${i+1}. ${s.tanggal} | ${a ? a.nama : "-"} | ${s.jenis} | Rp ${Number(s.jumlah).toLocaleString("id-ID")}`,
        10, y
      );
      y += 7;
      if(y > 280){
        doc.addPage();
        y = 10;
      }
    });

  doc.save("laporan_simpanan.pdf");
}

/* =====================
   PINJAMAN → PDF
===================== */
function exportPinjamanPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const db = getDB();
  const filter = document.getElementById("filterAnggota").value;

  let y = 10;
  doc.setFontSize(12);
  doc.text("Laporan Pinjaman", 10, y);
  y += 10;

  db.pinjaman
    .filter(p => !filter || p.anggota_id === filter)
    .forEach((p,i)=>{
      const a = db.anggota.find(x=>x.id===p.anggota_id);
      doc.setFontSize(10);
      doc.text(
        `${i+1}. ${a ? a.nama : "-"} | ${p.tanggal} | Rp ${Number(p.jumlah).toLocaleString("id-ID")} | Sisa Rp ${Number(p.sisa).toLocaleString("id-ID")} | ${p.status}`,
        10, y
      );
      y += 7;
      if(y > 280){
        doc.addPage();
        y = 10;
      }
    });

  doc.save("laporan_pinjaman.pdf");
}