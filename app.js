//constants
const PLANK_LENGTH_PX = 400;
const MAX_ANGLE = 30;
const ANGLE_DIVISOR = 10;
const STORAGE_KEY = 'seesawState';

//dom references
const seesawPlank = document.getElementById('seesaw-plank');
const seesawPlankContainer = document.getElementById('seesaw-plank-container');
const leftWeightDisplay = document.getElementById('left-weight').querySelector('.value');
const rightWeightDisplay = document.getElementById('right-weight').querySelector('.value');
const nextWeightDisplay = document.getElementById('next-weight').querySelector('.value');
const tiltAngleDisplay = document.getElementById('tilt-angle').querySelector('.value');

// control and log
const logArea = document.getElementById('log-area');
const resetButton = document.getElementById('reset-seesaw');


let objects = [];

//object(ball) weight
let nextWeight = Math.floor(Math.random() * 10) + 1;

//show in html the random weight
nextWeightDisplay.textContent = `${nextWeight} kg`;

//load init method
document.addEventListener('DOMContentLoaded', init);

/**
 * 
 * @param {MouseEvent} event 
 */
function dropObject(event) {

    //get seesaw plank positiion-size 
    const rect = seesawPlank.getBoundingClientRect();

    //calculate click position
    const clickX = event.clientX - rect.left;

    //center the plank
    const plankCenter = PLANK_LENGTH_PX / 2;

    const distanceX = clickX - plankCenter;
    //choosing the right side or left side.
    const side = distanceX > 0 ? 'right' : 'left';

    //absolute value=distance
    const distance = Math.abs(distanceX);

    //declare weight
    const weight = nextWeight;

    //random weight calculate
    nextWeight = Math.floor(Math.random() * 10) + 1;

    //show in the html
    nextWeightDisplay.textContent = `${nextWeight} kg`;

    //declare object
    const newObject = {
        id: Date.now(),
        weight: weight,
        distance: distance,
        side: side,
        positionX: clickX
    };

    //push object the objects
    objects.push(newObject);

    renderObject(newObject);
    updateLog(newObject);

    calculateTilt();
}

/**
 * calculate torc
 */
function calculateTilt() {
    let leftTorque = 0;
    let rightTorque = 0;
    let totalLeftWeight = 0;
    let totalRightWeight = 0;

    objects.forEach(obj => {
        const torque = obj.weight * obj.distance;

        if (obj.side === 'left') {
            leftTorque += torque;
            totalLeftWeight += obj.weight;
        } else {
            rightTorque += torque;
            totalRightWeight += obj.weight;
        }
    });

    let angle = (rightTorque - leftTorque) / ANGLE_DIVISOR;

    angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, angle));

    leftWeightDisplay.textContent = `${totalLeftWeight.toFixed(1)} kg`;
    rightWeightDisplay.textContent = `${totalRightWeight.toFixed(1)} kg`;
    tiltAngleDisplay.textContent = `${angle.toFixed(1)}°`;

    seesawPlankContainer.style.transform = `rotate(${angle}deg)`;

    saveState();
}


/**
 * dropping object(ball) color
 * @param {number} weight 
 * @returns {string}
 */
function getObjectColor(weight) {
    const colors = [
        '#cc6633',
        '#1a1a1a',
        '#80b369',
        '#6c7a2c',
        '#ffb703',
        '#ff6f6f',
        '#135590',
        '#4b5563',
        '#7b2e2f',
        '#d97706'
    ];
    if (weight >= 1 && weight <= 10) {
        return colors[weight - 1];
    }
    //Default
    return '#333';
}

/**
 * @param {object} obj 
 */
function renderObject(obj) {

    //create object(ball-weights)
    const objectElement = document.createElement('div');

    //add this object class to class list 
    objectElement.classList.add('seesaw-object');

    //create this object(ball-weights) id
    objectElement.id = `object-${obj.id}`;

    //calculate size of ball
    const size = 34 + obj.weight * 2;

    //set this size width and height
    objectElement.style.width = `${size}px`;
    objectElement.style.height = `${size}px`;

    //object(ball-weights) set background color 
    objectElement.style.backgroundColor = getObjectColor(obj.weight);

    //object(ball-weights) set weight as a text
    objectElement.textContent =`${obj.weight} kg`;

    //set font size
    objectElement.style.fontSize = `${size * 0.35}px`;

    //arrange object(ball-weights) position 
    objectElement.style.left = `${obj.positionX - size / 2}px`;

    //arrange style 
    objectElement.style.transition = 'top 0.6s ease-out';
    objectElement.style.top = '-150px';

    //add as a child(as a last element)
    seesawPlank.appendChild(objectElement);

    setTimeout(() => {
        objectElement.style.top = `${-size}px`;
    }, 10);
}

/**
 * logs
 * @param {object} obj
 */
function updateLog(obj) {
    const logEntry = document.createElement('p');
    logEntry.textContent = `${obj.weight}kg dropped on ${obj.side} side at ${obj.distance.toFixed(0)}px from center`;
    
    //add new record to the top
    if (logArea.firstChild) {
        logArea.insertBefore(logEntry, logArea.firstChild);
    } else {
        logArea.appendChild(logEntry);
    }
}

/**
 * save state to local storage
 **/

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(objects));
    } catch (e) {
        console.error("Local Storage Save Error:", e);
    }
}

function loadState() {
    try {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            objects = JSON.parse(savedState);

            seesawPlank.innerHTML = '';
            logArea.innerHTML = '';

            objects.forEach(obj => {
                renderObject(obj);
                updateLog(obj);
            });

            calculateTilt();
            return true;
        }
    } catch (e) {
        console.error("Local Storage Load Error or Data Corrupted:", e);
    }
    return false;
}


/**
 * reset seesaw datas
 **/

function resetSeesaw() {
    objects = [];

    localStorage.removeItem(STORAGE_KEY);


    seesawPlank.innerHTML = '';
    logArea.innerHTML = '';

    nextWeight = Math.floor(Math.random() * 10) + 1;
    nextWeightDisplay.textContent = `${nextWeight} kg`;

    calculateTilt();
}


/**
 * Init function
 */
function init() {

    loadState();

    seesawPlank.addEventListener('click', dropObject);
    resetButton.addEventListener('click', resetSeesaw);

    if (objects.length === 0) {
        calculateTilt();
    }
}