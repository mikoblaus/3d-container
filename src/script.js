import * as THREE from 'three';
import './style.css';
import {OrbitControls} from 'three/addons/controls/OrbitControls';

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

const renderer = new THREE.WebGLRenderer({canvas});
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
container.position.set(0, 1, 0);
scene.add(container);

const productMaterialColors = [
    0xFF5733, 0x4CAF50, 0x2196F3, 0x9C27B0, 0xFFC107, 0x00BCD4, 0xFF9800, 0xE91E63, 0x009688, 0x795548
];

const products = [];


const productSizes = [
    {x: 0.5, y: 0.5, z: 0.5, product: {title: 'WH/OUT/00045 - [001]კარადა GRD-631-BB-2'}},
    {x: 0.7, y: 0.7, z: 0.9, product: {title: 'WH/OUT/00046 - [003] რატანის  სამეული KJF2115 შაცი'}},
    {x: 0.6, y: 0.8, z: 0.6, product: {title: 'WH/OUT/00047 - [002] კერამოგრანიტი Andezit Antracite 60*60'}},
    {x: 0.4, y: 0.4, z: 0.9, product: {title: 'WH/OUT/00048 - [004] საპნის დასადები სახურავით, L147'}},
    {x: 0.8, y: 0.6, z: 0.5, product: {title: 'WH/OUT/00049 - [005] შპალერი ვინილის 6454-08 0.53*10მ Erismann'}},
    {x: 0.6, y: 0.9, z: 0.7, product: {title: 'WH/OUT/00050 - [006] წებო-ცემენტი - Alfill Teknofix - 25 კგ'}},
];

const numProducts = 6;

const pileCenter = {x: -7, y: 1, z: 0};
const pileSpread = {x: 2, y: 0.5, z: 2};


const initialPositions = [];

for (let i = 0; i < numProducts; i++) {
    const productGeometry = new THREE.BoxGeometry(
        productSizes[i].x,
        productSizes[i].y,
        productSizes[i].z
    );
    const productMaterial = new THREE.MeshBasicMaterial({
        color: productMaterialColors[i],
        transparent: true,
        opacity: 0.6,
    });
    const product = new THREE.Mesh(productGeometry, productMaterial);


    product.position.set(
        pileCenter.x + (Math.random() - 0.5) * pileSpread.x,
        0, // Кубики лежат на полу
        pileCenter.z + (Math.random() - 0.5) * pileSpread.z
    );
    scene.add(product);
    products.push(product);
    initialPositions.push(product.position.clone());

    product.onClick = () => displayProductInfo(productSizes[i]);
}


function displayProductInfo(code) {

    const infoDiv = document.getElementById('product-info');
    infoDiv.innerHTML = `ინფორმაცია პროდუქციაზე: <br/> ${code.product.title}`;
}

// Функция для размещения продуктов на полу контейнера
function packProductsOnFloor(products, containerWidth, containerHeight, containerDepth) {
    const targetPositions = [];
    let xOffset = -containerWidth / 2;
    let zOffset = -containerDepth / 2;


    products.forEach((product, index) => {
        const targetX = xOffset + (product.geometry.parameters.width / 2);
        const targetY = 0.5;
        const targetZ = zOffset + (product.geometry.parameters.depth / 2);


        targetPositions.push(new THREE.Vector3(targetX, targetY, targetZ));


        xOffset += product.geometry.parameters.width;

        if (xOffset > containerWidth / 2) {
            xOffset = -containerWidth / 2;
            zOffset += product.geometry.parameters.depth;
        }
    });

    return targetPositions;
}


function moveProductsToContainer() {
    const targetPositions = packProductsOnFloor(products, containerWidth, containerHeight, containerDepth);
    // Анимация перемещения
    let progress = 0;
    const duration = 2;

    function animateMovement() {
        progress += 0.02;

        if (progress < 1) {
            products.forEach((product, index) => {
                const startPos = initialPositions[index];
                const targetPos = targetPositions[index];

                product.position.x = startPos.x + (targetPos.x - startPos.x) * progress;
                product.position.y = startPos.y + (targetPos.y - startPos.y) * progress;
                product.position.z = startPos.z + (targetPos.z - startPos.z) * progress;
            });
            requestAnimationFrame(animateMovement);
        }
    }

    animateMovement();
}

const animate = () => {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

function onDocumentMouseClick(event) {
    event.preventDefault();


    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = -(event.clientY / sizes.height) * 2 + 1;


    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);


    const intersects = raycaster.intersectObjects(products);


    if (intersects.length > 0) {
        const clickedProduct = intersects[0].object;
        clickedProduct.onClick();
    }
}


window.addEventListener('click', onDocumentMouseClick);

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
});

animate();


const infoDiv = document.createElement('div');
infoDiv.id = 'product-info';
infoDiv.style.position = 'absolute';
infoDiv.style.top = '190px';
infoDiv.style.left = '20px';
infoDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
infoDiv.style.color = '#fff';
infoDiv.style.padding = '10px';
infoDiv.style.borderRadius = '5px';
document.body.appendChild(infoDiv);

// Actions

function calculateVolume(box) {
    return box.x * box.y * box.z;
}

function calculateTotalVolume() {
    let totalVolume = 0;
    productSizes.forEach(product => {
        totalVolume += calculateVolume(product);
    });
    return totalVolume;
}


const arrangeButton = document.getElementById('arrange-button');
arrangeButton.addEventListener('click', moveProductsToContainer);

arrangeButton.addEventListener('click', function() {

    const totalVolume = calculateTotalVolume();

    const containerVolume = 8
    const totalVolumeOfBoxes = calculateTotalVolume();
    const remainingVolume = containerVolume - totalVolumeOfBoxes;
    const remainingPercentage = (remainingVolume / containerVolume) * 100;
    document.getElementById('remainingVolume').textContent = `თავისუფალია: ${remainingVolume.toFixed(2)} m³ (${remainingPercentage.toFixed(2)}%)`;
    document.getElementById('totalVolume').textContent = `ამანათების მოცულობა: ${totalVolume.toFixed(2)} m³`;
});