window.onload = function () {
    const files = document.querySelector('#files');
    const form = document.querySelector('form');
    const list = document.querySelector('#list');

    fetch('/files')
        .then(response => response.text())
        .then(data => {
            const files = JSON.parse(data);
            files.forEach(file => {
                list.innerHTML += `
                <a href="/${file}">
                    <div style="width: 90px; height: 90px; background-color: black; display: flex; justify-content: center; align-items: center; border: 1px solid black; border-radius: 10px;">
                        <img src="/${file}" style="max-height: 80px; max-width: 80px; object-fit: contain;" />
                    </div>
                </a>`;
            });
        })
        .catch(error => console.error(error));


    form.addEventListener('submit', e => {
        e.preventDefault();

        const formData = new FormData(form);

        fetch('/upload', {
            method: 'POST',
            body: formData
        }).then(response => {
            if (response.ok) {
                response.json().then(data => {
                    files.innerHTML = '';
                    list.innerHTML += `
                    <a href="/${data.file}">
                        <div style="width: 90px; height: 90px; background-color: black; display: flex; justify-content: center; align-items: center; border: 1px solid black; border-radius: 10px;">
                            <imgsrc="/${data.file}" style="max-height: 80px; max-width: 80px; object-fit: contain;" />
                            </div>
                            </a>`;
                });
            } else {
                console.error('Upload failed');
            }
        });
        window.location.reload()
    });
}

const previewImg = document.getElementById('preview-img')
previewImg.style.display = 'none'

files.onchange = evt => {
    const btnSelectImg = document.getElementById('files')

    const [file] = btnSelectImg.files
    if (file) {
        previewImg.style.display = 'block'
        previewImg.src = URL.createObjectURL(file)
    }
}

const eraseImagesButton = document.querySelector('#erase-images');
let eraseMode = false;
eraseImagesButton.addEventListener('click', () => {
    eraseMode = !eraseMode;

    if (eraseMode) {
        eraseImagesButton.innerHTML = "Salir de modo borrar";
        const images = document.querySelectorAll('#list img');
        images.forEach(image => {
            const deleteIcon = document.createElement('div');
            deleteIcon.innerHTML = 'X';
            deleteIcon.style.background = 'white';
            deleteIcon.style.color = 'red';
            deleteIcon.style.zIndex = '1';
            deleteIcon.style.width = '20%';
            deleteIcon.style.borderRadius = '5px'
            deleteIcon.style.border = '1px solid black'
            deleteIcon.style.position = 'absolute';
            deleteIcon.style.top = '0';
            deleteIcon.style.right = '-2px';
            deleteIcon.style.cursor = 'pointer';
            deleteIcon.classList.add('delete-icon')
            image.parentNode.appendChild(deleteIcon);
            image.parentNode.parentNode.style.pointerEvents = "none";
            image.parentNode.style.position = 'relative'

        });
        const deleteIcons = document.querySelectorAll('.delete-icon')
        deleteIcons.forEach((icon)=>{
            icon.style.pointerEvents = 'all'
            icon.addEventListener('click', (e) => {
                if (confirm('Estas seguro/a de que queres borrar esta imagen?')) {
                    const imagePath = e.target.parentNode.children[0].src;
                    console.log(imagePath);
                    if (!imagePath) return;
                    fetch('/delete', {
                        method: 'DELETE',
                        body: JSON.stringify({ path: imagePath.replace('http://localhost:3000/', '') }),
                        headers: { 'Content-Type': 'application/json' }
                    }).then(response => {
                        if (response.ok) {
                            e.target.parentNode.remove();
                            window.location.reload()
                        } else {
                            console.error('Delete failed');
                        }
                    });
                }
            });
        })
    } else {
        eraseImagesButton.innerHTML = "Borrar Imagen";
        const deleteIcons = document.querySelectorAll('.delete-icon');
        deleteIcons.forEach(icon => icon.remove());
        const images = document.querySelectorAll('#list a div img');
        images.forEach(image => image.parentNode.style.pointerEvents = "all");
    }
});
