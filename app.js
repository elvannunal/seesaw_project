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

//obj weight
let nextWeight = Math.floor(Math.random() * 10) + 1;

nextWeightDisplay.textContent = `${nextWeight} kg`;

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
    
    //weight
    const weight = nextWeight;
    //random weight 
    nextWeight = Math.floor(Math.random() * 10) + 1;
    nextWeightDisplay.textContent = `${nextWeight} kg`;
    
    const newObject = {
        id: Date.now(),
        weight: weight,
        distance: distance,
        side: side,
        positionX: clickX 
    };
    
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
 * dropping object color
 * @param {number} weight 
 * @returns {string}
 */
function getObjectColor(weight) {
   const colors=[
    '#a8dadc',
    '#84a98c',
    '#778da9',
    '#c77dff',
    '#ffb703',
    '#fb8500',
    '#e85d04',
    '#d00000',
    '#8e0000',
    '#4a0000' 
    ];
    if(weight>=1 && weight <=10){
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
    const size = 30 + obj.weight * 2; 

    //set this size width and height
    objectElement.style.width = `${size}px`;
    objectElement.style.height = `${size}px`;

    //object(ball-weights) set background color 
    objectElement.style.backgroundColor = getObjectColor(obj.weight);
    
    //object(ball-weights) set weight as a text
    objectElement.textContent = obj.weight;

    //set font size
    objectElement.style.fontSize = `${size * 0.4}px`; 

    //arrange object(ball-weights) position 
    objectElement.style.left = `${obj.positionX - size / 2}px`;
    
    //arrange style 
    objectElement.style.transition = 'top 0.6s ease-out'; 
    objectElement.style.top = '-100px'; 
    
    //add as a child(as a last element)
    seesawPlank.appendChild(objectElement);

    setTimeout(() => {
        objectElement.style.top = `${-size}px`; 
    }, 10); 
}



/**
 * Init function
 */
function init() {

    loadState();
    
    seesawPlank.addEventListener('click', dropObject);
    resetButton.addEventListener('click', resetSeesaw); 
    
    if(objects.length === 0) {
        calculateTilt(); 
    }
}