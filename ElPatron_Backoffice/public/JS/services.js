

function mostrarCaja(seccion) {
    document.getElementById('caja-citas').style.display = 'none';
    document.getElementById('opciones').style.display = 'none';
    document.getElementById('tabla-categorias').style.display = 'none';
    document.getElementById('caja-' + seccion).style.display = 'block';
  }
  
  function mostrarOpciones() {
    document.getElementById('opciones').style.display = 'block';
    document.getElementById('tabla-categorias').style.display = 'none';
  }
  
  function mostrarTabla(tipo) {
    document.getElementById('opciones').style.display = 'none';
    if (tipo === 'categoria') {
      document.getElementById('tabla-categorias').style.display = 'block';
    }
  }
  
  function mostrarModal() {
    document.getElementById('modal').style.display = 'flex';
  }
  
  function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
  }
  
  function guardarCategoria() {
    const nombre = document.getElementById('nombre-categoria').value;
    if (nombre.trim() === '') {
      alert('Por favor, ingresa un nombre válido.');
      return;
    }
    //alert(Categoría "${nombre}" guardada exitosamente.);
    cerrarModal();
  }




function image_click(){
    console.log("click on image")

    document.getElementById("profile-hide").style.display = 'flex';

}

function logout(event){
  event.preventDefault();
  var sessionstatus = document.getElementById("sesion_status").innerText

  if(sessionstatus === "iniciar sesion"){
      console.log("no has iniciado sesion")

      //document.location.href = "/Login", true;
      //window.location.replace("http://localhost:8085/Login");
      window.location.assign("http://localhost:8087");

      //fetch('/Login',{method: 'GET'}) 

  }
  else if(sessionstatus === "cerrar sesion"){
      fetch('/logout',{method: 'GET'})
      
      //window.location.reload();
      window.location.assign("http://localhost:8087");
  }
  
}