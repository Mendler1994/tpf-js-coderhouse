let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
const contenedorProductos = document.getElementById("productos-container");
const contenedorCarrito = document.getElementById("carrito-container");
const totalCarrito = document.getElementById("total");
const btnFinalizar = document.getElementById("btn-finalizar");

productos.forEach((producto, id) => {
    const productoDiv = document.createElement("div");
    productoDiv.classList.add("producto"); 

    const isOutOfStock = producto.stock === 0;

    productoDiv.innerHTML = `
        <h2>${producto.nombre}</h2>
        <p>Precio: $${producto.precio}</p>
        <p class="stock">Stock: <span id="stock-${producto.id}">${producto.stock}</span> disponibles</p>
        <button class="btn-comprar" data-id="${producto.id}" ${isOutOfStock ? "disabled" : ""}>
        ${isOutOfStock ? "Sin stock" : "Comprar"}
        </button>
    `;

    contenedorProductos.appendChild(productoDiv);
});

document.querySelectorAll(".btn-comprar").forEach(boton => {
    boton.addEventListener("click", (event) => {
        const id = event.target.getAttribute("data-id");
        agregarAlCarrito(id);
    });
});

// Botón para vaciar carrito
const btnVaciar = document.createElement("button");
btnVaciar.id = "btn-vaciar";
btnVaciar.textContent = "Vaciar Carrito";
btnVaciar.style.display = "none";
btnFinalizar.parentNode.insertBefore(btnVaciar, btnFinalizar);

//Agregar al Carrito
function agregarAlCarrito(id) {
    id = parseInt(id);
    const producto = productos.find(p => p.id === id);
    if (producto && producto.stock > 0) {
        producto.stock--;
        document.getElementById(`stock-${id}`).textContent = producto.stock;

        let productoEnCarrito = carrito.find(item => item.id === id);
        productoEnCarrito
            ? productoEnCarrito.cantidad++
            : carrito.push({ ...producto, cantidad: 1 });

        actualizarCarrito();

        if (producto.stock === 0) {
            const boton = document.querySelector(`.btn-comprar[data-id="${id}"]`);
            boton.disabled = true;
            boton.textContent = "Sin stock";
        }
    } else {
        alert("No hay más stock disponible");
    }
}

//Quitar del Carrito
function quitarDelCarrito(id) {
    id = parseInt(id);
    let item = carrito[id];
    if (!item) return;

    item.cantidad > 1 ? item.cantidad-- : carrito.splice(id, 1);

    let productoOriginal = productos.find(p => p.id === item.id);
    productoOriginal.stock++;

    document.getElementById(`stock-${productoOriginal.id}`).textContent = productoOriginal.stock;
    actualizarCarrito();

    if (productoOriginal.stock === 1) {
        const boton = document.querySelector(`.btn-comprar[data-id="${productoOriginal.id}"]`);
        boton.disabled = false;
        boton.textContent = "Comprar";
    }
}

function actualizarCarrito() {
    contenedorCarrito.innerHTML = "";
    let total = 0;

    carrito.forEach((item, i) => {
        const carritoItem = document.createElement("div");
        carritoItem.classList.add("carrito-item");

        carritoItem.innerHTML = `
            <h3>${item.nombre}</h3> 
            <p> $${item.precio} x ${item.cantidad}</p>
            <button class="btn-quitar" data-id="${i}" aria-label="Quitar uno">-1</button>
            <button class="btn-aumentar" data-id="${i}" aria-label="Agregar uno">+1</button>
        `;
        contenedorCarrito.appendChild(carritoItem);
        total += item.precio * item.cantidad;
    });

    totalCarrito.textContent = total;
    btnFinalizar.style.display = carrito.length > 0 ? "block" : "none";
    btnVaciar.style.display = carrito.length > 0 ? "block" : "none";

    document.querySelectorAll(".btn-quitar").forEach(boton => {
        boton.addEventListener("click", (event) => quitarDelCarrito(event.target.getAttribute("data-id")));
    });
    
    document.querySelectorAll(".btn-aumentar").forEach(boton => {
        boton.addEventListener("click", (event) => {
            const id = event.target.getAttribute("data-id");
            let item = carrito[id];
            let productoOriginal = productos.find(p => p.id === item.id);

            if (productoOriginal.stock > 0) {
                item.cantidad++;
                productoOriginal.stock--;
                document.getElementById(`stock-${productoOriginal.id}`).textContent = productoOriginal.stock;
                actualizarCarrito();
            }
        });
    });
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

btnFinalizar.addEventListener("click", () => {
    if (carrito.length > 0) {
        Swal.fire({
            title: "¡Compra realizada!",
            text: "Tu pedido ha sido procesado con éxito.",
            icon: "success",
            confirmButtonText: "OK"
        });
        localStorage.removeItem("carrito");
        carrito = [];
        actualizarCarrito();
    }
});

btnVaciar.addEventListener("click", () => {
    carrito.forEach(item => {
        let productoOriginal = productos.find(p => p.nombre === item.nombre);
        productoOriginal.stock += item.cantidad;
    });
    localStorage.removeItem("carrito");
    carrito = [];
    actualizarCarrito();
});

// agregar funciones a "Buscar"

const inputBusqueda = document.getElementById("input-busqueda");
const btnBuscar = document.getElementById("btn-buscar");
const selectOrden = document.getElementById("orden-opciones");

btnBuscar.addEventListener("click", () => {
    aplicarFiltrosYOrden();
});

selectOrden.addEventListener("change", () => {
    aplicarFiltrosYOrden();
});

//Mostrar Productos
function mostrarProductos(productosFiltrados) {
    contenedorProductos.innerHTML = "";

    productosFiltrados.forEach((producto) => {
        const productoDiv = document.createElement("div");
        productoDiv.classList.add("producto");

        const isOutOfStock = producto.stock === 0;

        productoDiv.innerHTML = `
            <h2>${producto.nombre}</h2>
            <p>Precio: $${producto.precio}</p>
            <p class="stock">Stock: <span id="stock-${producto.id}">${producto.stock}</span> disponibles</p>
            <button class="btn-comprar" data-id="${producto.id}" ${isOutOfStock ? "disabled" : ""}>
                ${isOutOfStock ? "Sin stock" : "Comprar"}
            </button>
        `;

        contenedorProductos.appendChild(productoDiv);
    });

    document.querySelectorAll(".btn-comprar").forEach(boton => {
        boton.addEventListener("click", (event) => {
            const id = parseInt(event.target.getAttribute("data-id"));
            const index = productos.findIndex(p => p.id === id);
            if (index !== -1) {
            agregarAlCarrito(id);
            }
        });
    });
}


// agregarle funcionabilidad a "Ordenar por"

function aplicarFiltrosYOrden() {
    const texto = inputBusqueda.value.toLowerCase();
    const orden = selectOrden.value;

    let productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(texto)
    );

    switch (orden) {
        case "alfabetico":
            productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
            break;
        case "menor-precio":
            productosFiltrados.sort((a, b) => a.precio - b.precio);
            break;
        case "mayor-precio":
            productosFiltrados.sort((a, b) => b.precio - a.precio);
            break;
    }

    mostrarProductos(productosFiltrados);
}

mostrarProductos(productos);
actualizarCarrito();