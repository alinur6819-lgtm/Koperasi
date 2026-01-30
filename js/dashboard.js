function rupiah(n){
  return "Rp " + (Number(n) || 0).toLocaleString("id-ID");
}

function hitungTotalSaldo(){
  const db = getDB();
  let saldo = 0;

  /* ===== KAS MANUAL ===== */
  if(db.kas){
    db.kas.forEach(k=>{
      if(k.jenis === "masuk") saldo += k.jumlah;
      if(k.jenis === "keluar") saldo -= k.jumlah;
    });
  }

  /* ===== SIMPANAN (MASUK) ===== */
  db.simpanan.forEach(s=>{
    saldo += Number(s.jumlah);
  });

  /* ===== ANGSURAN (MASUK) ===== */
  db.transaksi
    .filter(t => t.jenis === "BAYAR")
    .forEach(t=>{
      saldo += Number(t.jumlah);
    });

  /* ===== PINJAMAN (KELUAR) ===== */
  db.pinjaman.forEach(p=>{
    saldo -= Number(p.jumlah);
  });

  return saldo;
}

function loadDashboard(){
  const el = document.getElementById("totalSaldo");
  if(!el) return;

  el.innerText = rupiah(hitungTotalSaldo());
}