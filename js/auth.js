/* =====================
   AUTH KOPERASI
===================== */

// LOGIN
function login(){
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("error");

  if(!user || !pass){
    errorBox.style.display = "block";
    errorBox.innerText = "Username & password wajib diisi";
    return;
  }

  const data = getDB();

  if(user === data.user.username && pass === data.user.password){
    localStorage.setItem("koperasi_login", "true");
    localStorage.setItem("koperasi_user", user);

    window.location.href = "dashboard.html";
  }else{
    errorBox.style.display = "block";
    errorBox.innerText = "Username atau password salah";
  }
}

// CEK LOGIN (dipakai di semua halaman)
function cekLogin(){
  if(localStorage.getItem("koperasi_login") !== "true"){
    window.location.href = "index.html";
  }
}

// LOGOUT
function logout(){
  if(confirm("Yakin ingin logout?")){
    localStorage.removeItem("koperasi_login");
    localStorage.removeItem("koperasi_user");
    window.location.href = "index.html";
  }
}