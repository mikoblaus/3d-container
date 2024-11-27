import * as THREE from 'three';
import './style.css';
import { OrbitControls } from 'three/addons/controls/OrbitControls';

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

const cursor = {
    x: 0,
    y: 0,
};

// Сцена
const scene = new THREE.Scene();
scene.background = new THREE.Color("#263238");

const canvas = document.querySelector('.canvas');
const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 10, 20);
camera.lookAt(0, 0, 0);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

// Добавление сетки
const planeSize = 20;
const divisions = 10;
const gridHelper = new THREE.GridHelper(planeSize, divisions, "#42a5f5", "#42a5f5");
scene.add(gridHelper);

// Контейнер
const containerWidth = 5;
const containerHeight = 2;
const containerDepth = 2;

const containerGeometry = new THREE.BoxGeometry(containerWidth, containerHeight, containerDepth);
const containerMaterial = new THREE.MeshBasicMaterial({
    color: 0xFF5733, wireframe: true
});
const container = new THREE.Mesh(containerGeometry, containerMaterial);
container.position.set(0, containerHeight / 2, 0); // Размещаем контейнер на уровне плоскости
scene.add(container);

// Кубики (продукты) с разными размерами и цветами
const productMaterialColors = [
    0xFF5733, 0x4CAF50, 0x2196F3, 0x9C27B0, 0xFFC107, 0x00BCD4, 0xFF9800, 0xE91E63, 0x009688, 0x795548
]; // Разные цвета для кубиков

const products = [];
const placedProducts = [];
const productSizes = [
    { x: 0.5, y: 0.5, z: 0.5 },
    { x: 0.7, y: 0.7, z: 0.7 },
    { x: 0.6, y: 0.8, z: 0.6 },
    { x: 0.4, y: 0.4, z: 0.9 },
    { x: 0.8, y: 0.6, z: 0.5 },
    { x: 0.6, y: 0.9, z: 0.7 }
];



const numProducts = 6;

const pileCenter = { x: -7, y: 1, z: 0 };
const pileSpread = { x: 2, y: 0.5, z: 2 };
function packProductsOnFloor(products, containerWidth, containerHeight, containerDepth) {
    const positions = []; // Для хранения позиций кубиков
    let currentX = -containerWidth / 2;
    let currentY = 0; // Начинаем укладку от пола
    let currentZ = -containerDepth / 2;
    let maxHeightInLayer = 0;

    for (const product of products) {
        const size = product.size;

        // Проверяем, поместится ли кубик в текущий ряд
        if (currentX + size.x > containerWidth / 2) {
            // Переход на новую "строку" в слое
            currentX = -containerWidth / 2;
            currentZ += maxHeightInLayer; // Смещаем по глубине
            maxHeightInLayer = 0;
        }

        // Проверяем, поместится ли кубик в текущий слой
        if (currentZ + size.z > containerDepth / 2) {
            // Переход на новый слой
            currentZ = -containerDepth / 2;
            currentY += maxHeightInLayer;
            maxHeightInLayer = 0;
        }

        // Проверяем, не вышли ли за высоту контейнера
        if (currentY + size.y > containerHeight) {
            console.warn("Контейнер переполнен, не удалось разместить все продукты.");
            break;
        }

        // Устанавливаем позицию кубика (нижняя грань на уровне текущего слоя)
        const position = {
            x: currentX + size.x / 2,
            y: currentY + size.y / 2,
            z: currentZ + size.z / 2,
        };

        // Сохраняем позицию и обновляем текущую позицию для следующего кубика
        positions.push(position);
        currentX += size.x; // Смещаемся по ширине
        maxHeightInLayer = Math.max(maxHeightInLayer, size.z); // Обновляем максимальную высоту в слое
    }

    return positions;
}

// Применяем упаковку
const productsWithSizes = productSizes.map((size, i) => ({
    size,
    color: productMaterialColors[i],
}));

const packedPositions = packProductsOnFloor(productsWithSizes, containerWidth, containerHeight, containerDepth);

for (let i = 0; i < packedPositions.length; i++) {
    const size = productSizes[i];
    const position = packedPositions[i];
    const productGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const productMaterial = new THREE.MeshBasicMaterial({
        color: productMaterialColors[i],
        transparent: true,
        opacity: 0.6,
    });

    const product = new THREE.Mesh(productGeometry, productMaterial);
    // Размещаем кубики относительно контейнера
    product.position.set(position.x, position.y, position.z);
    scene.add(product);
}
// Обработчик кликов
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    // Преобразуем координаты мыши в нормализованные
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = -(event.clientY / sizes.height) * 2 + 1;

    // Обновляем луч
    raycaster.setFromCamera(mouse, camera);

    // Проверяем пересечение с объектами
    const intersects = raycaster.intersectObjects(products);
    if (intersects.length > 0) {
        // Получаем объект, с которым произошел клик
        const selectedProduct = intersects[0].object;
        const productCode = `Product Code: ${Math.floor(Math.random() * 10000)}`;  // Пример генерации кода продукта

        // Отображаем информацию о продукте
        displayProductInfo(productCode);
    }
});

// Функция для отображения информации о продукте
function displayProductInfo(code) {
    const infoDiv = document.getElementById('product-info');
    infoDiv.innerHTML = code;
}

// Создаем HTML элемент для отображения информации
const infoDiv = document.createElement('div');
infoDiv.id = 'product-info';
infoDiv.style.position = 'absolute';
infoDiv.style.top = '20px';
infoDiv.style.left = '20px';
infoDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
infoDiv.style.color = '#fff';
infoDiv.style.padding = '10px';
infoDiv.style.borderRadius = '5px';
document.body.appendChild(infoDiv);

const animate = () => {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.render(scene, camera);
});

animate();
